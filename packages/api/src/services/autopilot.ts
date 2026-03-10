import { db } from "@rankflo/db";
import {
  resolveAIConfig,
  generateContent,
  suggestTopics,
  slugify,
} from "@rankflo/ai";

export interface AutopilotResult {
  projectsProcessed: number;
  postsGenerated: number;
  errors: Array<{ projectId: string; projectName: string; error: string }>;
}

/**
 * Calculate the next run time based on posts-per-week frequency.
 * e.g. 2 posts/week → run every 3.5 days
 */
function nextRunAt(postsPerWeek: number): Date {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + msPerWeek / postsPerWeek);
}

/**
 * Run autopilot for all projects that are due.
 * Called by the /api/cron/autopilot endpoint.
 */
export async function runAutopilot(): Promise<AutopilotResult> {
  const result: AutopilotResult = {
    projectsProcessed: 0,
    postsGenerated: 0,
    errors: [],
  };

  const config = resolveAIConfig();
  if (!config) {
    console.warn("[Autopilot] No AI provider configured — skipping.");
    return result;
  }

  const now = new Date();

  // Find all autopilot-enabled projects that are due to run
  const projects = await db.project.findMany({
    where: {
      autopilotEnabled: true,
      OR: [
        { autopilotNextRunAt: null },
        { autopilotNextRunAt: { lte: now } },
      ],
    },
    include: {
      organization: {
        select: { id: true, plan: true, aiCreditsBalance: true },
      },
    },
  });

  console.log(`[Autopilot] Found ${projects.length} project(s) due for generation`);

  for (const project of projects) {
    const org = project.organization;

    try {
      // Check credits — quickGenerate costs 3 credits (Enterprise is unlimited)
      const COST = 3;
      if (org.plan !== "ENTERPRISE" && org.aiCreditsBalance < COST) {
        console.log(`[Autopilot] Project ${project.id} skipped — insufficient credits (${org.aiCreditsBalance}/${COST})`);
        // Still advance the next run time so we don't spam
        await db.project.update({
          where: { id: project.id },
          data: { autopilotNextRunAt: nextRunAt(project.autopilotFrequency) },
        });
        continue;
      }

      // Get existing post titles to avoid duplicates
      const existingPosts = await db.post.findMany({
        where: { projectId: project.id, deletedAt: null },
        select: { title: true },
        take: 100,
      });

      const brandStyle = project.brandStyle as Record<string, unknown> | null;

      // Research a topic
      const topicResult = await suggestTopics(config, {
        projectName: project.name,
        industry: typeof brandStyle?.industry === "string" ? brandStyle.industry : undefined,
        audience: typeof brandStyle?.targetAudience === "string" ? brandStyle.targetAudience : undefined,
        existingTopics: existingPosts.map((p) => p.title),
        count: 3,
      });

      const topic = topicResult[0];
      if (!topic) {
        throw new Error("No topic generated");
      }

      // Build brand voice
      const brandVoice = {
        tone: Array.isArray(brandStyle?.tone) ? (brandStyle.tone as string[]) : ["professional", "informative"],
        style: typeof brandStyle?.writingStyle === "string" ? brandStyle.writingStyle : "Clear and engaging",
        vocabulary: Array.isArray(brandStyle?.vocabulary) ? (brandStyle.vocabulary as string[]) : [],
        avoidWords: Array.isArray(brandStyle?.avoidWords) ? (brandStyle.avoidWords as string[]) : [],
        targetAudience: typeof brandStyle?.targetAudience === "string" ? brandStyle.targetAudience : "General audience",
        industry: typeof brandStyle?.industry === "string" ? brandStyle.industry : "General",
      };

      // Generate content
      const generated = await generateContent(
        config,
        {
          topic,
          targetKeywords: typeof brandStyle?.industry === "string" ? [brandStyle.industry] : [],
          contentType: project.autopilotContentType as "blog-post" | "tutorial" | "how-to" | "listicle" | "comparison" | "landing-page",
        },
        brandVoice,
      );

      const postStatus = project.autopilotAutoPublish ? "PUBLISHED" : "DRAFT";

      // Find the org owner to use as author (admin member)
      const adminMember = await db.membership.findFirst({
        where: { organizationId: org.id, role: "ADMIN" },
        select: { userId: true },
      });

      // Create post in a transaction (generate + deduct credits atomically)
      await db.$transaction(async (tx) => {
        const post = await tx.post.create({
          data: {
            title: generated.title,
            slug: generated.slug || slugify(generated.title),
            excerpt: generated.excerpt,
            content: {
              type: "doc",
              blocks: [
                {
                  id: crypto.randomUUID(),
                  type: "markdown",
                  props: { content: generated.content },
                },
              ],
            },
            contentPlain: generated.content,
            status: postStatus,
            publishedAt: postStatus === "PUBLISHED" ? new Date() : null,
            organizationId: org.id,
            authorId: adminMember?.userId ?? null,
            projectId: project.id,
            version: 1,
            locale: "en",
          },
        });

        await tx.seoMeta.create({
          data: {
            postId: post.id,
            metaTitle: generated.metaTitle,
            metaDescription: generated.metaDescription,
            keywords: generated.tags,
            structuredData: generated.structuredData,
          },
        });

        // Deduct credits (skip for Enterprise)
        if (org.plan !== "ENTERPRISE") {
          const newBalance = org.aiCreditsBalance - COST;
          await tx.organization.update({
            where: { id: org.id },
            data: { aiCreditsBalance: { decrement: COST } },
          });
          await tx.creditLedger.create({
            data: {
              organizationId: org.id,
              type: "USAGE",
              amount: -COST,
              balance: newBalance,
              description: `Autopilot generated "${generated.title}"`,
              metadata: { feature: "autopilot", projectId: project.id },
            },
          });
        }

        // Audit log
        await tx.auditLog.create({
          data: {
            organizationId: org.id,
            action: "autopilot.generate",
            entityType: "post",
            entityId: post.id,
            metadata: {
              topic,
              postTitle: generated.title,
              status: postStatus,
              projectName: project.name,
            },
          },
        });

        // Update project postCount
        await tx.project.update({
          where: { id: project.id },
          data: { postCount: { increment: 1 } },
        });
      });

      // Advance next run time
      await db.project.update({
        where: { id: project.id },
        data: {
          autopilotLastRunAt: now,
          autopilotNextRunAt: nextRunAt(project.autopilotFrequency),
        },
      });

      result.postsGenerated++;
      console.log(`[Autopilot] Generated "${generated.title}" for project "${project.name}" (${postStatus})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Autopilot] Error for project ${project.id}:`, msg);
      result.errors.push({ projectId: project.id, projectName: project.name, error: msg });

      // Still advance to avoid hammering on failures
      await db.project.update({
        where: { id: project.id },
        data: { autopilotNextRunAt: nextRunAt(project.autopilotFrequency) },
      }).catch(() => {});
    }

    result.projectsProcessed++;
  }

  return result;
}
