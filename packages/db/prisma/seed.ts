import { PrismaClient } from "../src/generated/client/index.js";
import { createHash, randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@rankflo.io";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "rankflo-admin-2024";

  console.log(`Seeding database...`);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash: hashPassword(adminPassword),
      emailVerified: new Date(),
      locale: "en",
    },
  });

  console.log(`Admin user: ${admin.email}`);

  // Create default organization
  const org = await prisma.organization.upsert({
    where: { slug: "rankflo" },
    update: {},
    create: {
      name: "RankFlo",
      slug: "rankflo",
      subdomain: "blog",
      plan: "PRO",
    },
  });

  console.log(`Organization: ${org.name}`);

  // Create admin membership
  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: admin.id,
        organizationId: org.id,
      },
    },
    update: { role: "ADMIN" },
    create: {
      userId: admin.id,
      organizationId: org.id,
      role: "ADMIN",
    },
  });

  console.log(`Admin membership created`);

  // Seed demo data if enabled
  if (process.env.SEED_DEMO_DATA === "true") {
    console.log(`Seeding demo data...`);

    // Create tags
    const tags = await Promise.all(
      [
        { name: "Engineering", slug: "engineering", color: "#39FF14" },
        { name: "Product", slug: "product", color: "#3399FF" },
        { name: "Design", slug: "design", color: "#FFB800" },
        { name: "Open Source", slug: "open-source", color: "#FF3333" },
        { name: "Tutorial", slug: "tutorial", color: "#A855F7" },
      ].map((tag) =>
        prisma.tag.upsert({
          where: {
            organizationId_slug: {
              organizationId: org.id,
              slug: tag.slug,
            },
          },
          update: {},
          create: { ...tag, organizationId: org.id },
        }),
      ),
    );

    console.log(`Created ${tags.length} tags`);

    // Create sample posts
    const posts = [
      {
        title: "Welcome to RankFlo",
        slug: "welcome-to-rankflo",
        excerpt:
          "The next-generation blog platform built for developers and teams.",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Welcome to RankFlo. A platform designed from the ground up to be modular, extensible, and beautiful.",
                },
              ],
            },
          ],
        },
        status: "PUBLISHED" as const,
        publishedAt: new Date(),
      },
      {
        title: "Getting Started with the API",
        slug: "getting-started-with-the-api",
        excerpt: "Learn how to use the RankFlo API to manage your content.",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "RankFlo provides both tRPC and REST APIs for managing your content programmatically.",
                },
              ],
            },
          ],
        },
        status: "PUBLISHED" as const,
        publishedAt: new Date(),
      },
      {
        title: "Self-Hosting Guide",
        slug: "self-hosting-guide",
        excerpt: "Deploy RankFlo on your own infrastructure with Docker.",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "RankFlo can be self-hosted using Docker Compose. This guide walks you through the setup.",
                },
              ],
            },
          ],
        },
        status: "DRAFT" as const,
        publishedAt: null,
      },
    ];

    for (const post of posts) {
      await prisma.post.upsert({
        where: {
          organizationId_slug_locale: {
            organizationId: org.id,
            slug: post.slug,
            locale: "en",
          },
        },
        update: {},
        create: {
          ...post,
          organizationId: org.id,
          authorId: admin.id,
          locale: "en",
          readingTime: 1,
          contentPlain: JSON.stringify(post.content),
        },
      });
    }

    console.log(`Created ${posts.length} sample posts`);
  }

  console.log(`Seed completed.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
