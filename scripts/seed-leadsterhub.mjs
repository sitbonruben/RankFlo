#!/usr/bin/env node
// Seeds 10 SEO-optimised blog posts for the LeadsterHub project
// Run: node scripts/seed-leadsterhub.mjs

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL env var is required");
  process.exit(1);
}

// Use pg directly
const { default: pg } = await import("pg");
const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL });

const ORG_ID = "cmmhq0kf20001lm017xtbgefh";
const PROJECT_ID = "proj_leadsterhub"; // may need to look up

// First, find the actual project ID for LeadsterHub
const { rows: projects } = await pool.query(
  `SELECT id, name FROM "projects" WHERE "organizationId" = $1`,
  [ORG_ID]
);
console.log("Projects:", projects);

const project = projects.find(
  (p) => p.name.toLowerCase().includes("lead") || p.id.includes("lead")
);
if (!project) {
  console.error("LeadsterHub project not found. Available:", projects);
  process.exit(1);
}
console.log("Using project:", project.id, project.name);

const now = new Date().toISOString();
const slug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const posts = [
  {
    id: "post_lh_001",
    title: "10 B2B Lead Generation Strategies That Actually Work in 2025",
    slug: "b2b-lead-generation-strategies-2025",
    excerpt:
      "Discover the top B2B lead generation strategies delivering results in 2025, from intent-based outreach to AI-powered prospecting.",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [
            {
              type: "text",
              text: "Why Most B2B Lead Generation Advice Is Outdated",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The B2B buying landscape has changed dramatically. Buyers complete 70% of their research before ever talking to a salesperson. Cookie-cutter tactics no longer cut it — you need strategies built for how modern buyers actually behave.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [
            {
              type: "text",
              text: "1. Intent-Based Outreach",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Tools like Bombora and G2 Buyer Intent tell you which companies are actively researching solutions like yours. Reaching out while intent is high can increase reply rates by 3-5x compared to cold outreach.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "2. LinkedIn Thought Leadership" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Founders and sales leaders posting educational content on LinkedIn drive inbound leads at a fraction of paid ad costs. Aim for 3-5 posts per week mixing insights, case studies, and controversial takes.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "3. SEO-Driven Content Marketing" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Long-tail keywords like 'best email finder for sales teams' have lower competition but high purchase intent. A single well-optimised article can generate leads for years with zero ongoing spend.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "4. Cold Email with Personalisation at Scale" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "AI writing tools now let you personalise every cold email line at scale. Reference a prospect's recent funding, hiring spike, or LinkedIn post. Even a single personalised sentence doubles reply rates.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "5. Webinars and Virtual Events" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "A focused 30-minute webinar on a specific pain point can generate 200-500 qualified registrants. The attendee list is a warm lead list — they self-selected the problem you solve.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "6. Partner and Channel Referrals" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Identify adjacent tools your ICP already uses and build referral partnerships. A CRM vendor referring to your email finder tool creates warm leads with built-in trust.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "7. Review Sites and G2/Capterra Optimisation" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "75% of B2B buyers check review sites before purchasing. Actively collecting reviews, responding to feedback, and running G2 ads to buyers researching competitors is a high-ROI channel most companies ignore.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "8. Free Tools and Lead Magnets" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "A free email verifier, ROI calculator, or prospecting template gives buyers a reason to engage before they're ready to buy. These tools compound over time via SEO and word-of-mouth.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "9. Targeted LinkedIn Ads" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "LinkedIn's job title and company size targeting is unmatched for B2B. Use Lead Gen Forms to capture leads without landing pages — conversion rates are typically 2-3x higher than external landing pages.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "10. Community-Led Growth" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Slack communities, Discord servers, and niche forums are where your buyers hang out. Contributing genuinely (not spamming) builds brand authority and generates inbound leads organically.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Putting It All Together" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The best B2B lead generation programs combine 2-3 of these channels rather than betting everything on one. Start with the channels that match your team's strengths, measure cost-per-qualified-lead, and double down on what works.",
            },
          ],
        },
      ],
    },
    tags: ["lead generation", "B2B", "outbound", "sales"],
    metaTitle: "10 B2B Lead Generation Strategies That Work in 2025",
    metaDescription:
      "From intent-based outreach to community-led growth — the 10 B2B lead generation strategies delivering the best ROI in 2025.",
  },
  {
    id: "post_lh_002",
    title: "7 Cold Email Templates with 40%+ Reply Rates",
    slug: "cold-email-templates-high-reply-rate",
    excerpt:
      "Copy these 7 proven cold email templates that consistently achieve 40%+ reply rates for B2B sales teams.",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Cold email is far from dead — but generic templates are. These 7 frameworks are built around psychology, personalisation, and brevity. Each has been tested across thousands of sends.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Template 1: The Compliment + Problem" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: 'Subject: Quick question about [Company]\'s outbound\n\nHi [First Name],\n\nI noticed [specific thing you genuinely liked — recent hire, funding, product launch].\n\nMost [job title]s I talk to at [company size] companies are struggling with [specific pain]. Is that something on your radar?\n\n[Your name]',
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Template 2: The Case Study" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Subject: How [Similar Company] got [Result] in 90 days\n\nHi [First Name],\n\n[Similar company] was facing [same problem you have]. We helped them [specific result] in [timeframe].\n\nWorth a 15-min call to see if we can do the same for [their company]?\n\n[Your name]",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Template 3: The Trigger Event" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Subject: Congrats on the Series A — one thought\n\nHi [First Name],\n\nJust saw [Company] raised [amount] — congrats! Companies at your stage often [specific challenge that comes with growth].\n\nWe help [type of company] solve exactly this. Open to a quick chat?\n\n[Your name]",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Template 4: The Direct Ask" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Subject: [First Name] — 2 minutes?\n\nHi [First Name],\n\nI help [type of company] [achieve outcome] without [pain/effort].\n\nAre you the right person to discuss this, or should I reach out to someone else on your team?\n\n[Your name]",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Template 5: The Insight" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Subject: Something I noticed about [Company]'s strategy\n\nHi [First Name],\n\nI was looking at your [website/LinkedIn/job posts] and noticed [specific observation tied to your product's value].\n\n[Your company] helps [type of buyer] turn this into [outcome]. Happy to share what's working.\n\n[Your name]",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Template 6: The Referral" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Subject: [Mutual Connection] suggested I reach out\n\nHi [First Name],\n\n[Mutual connection] mentioned you might be dealing with [problem]. That's exactly what we help with.\n\nWould a quick call make sense?\n\n[Your name]",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Template 7: The Re-engagement" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Subject: Still relevant?\n\nHi [First Name],\n\nI reached out a few months ago about [topic]. Things change — [your product] has improved significantly since then.\n\nWould it make sense to reconnect?\n\n[Your name]",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "What Makes These Work" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Every high-performing cold email shares three traits: it's short (under 75 words), it's specific (mentions something real about the prospect), and it ends with an easy yes/no question. Avoid attachments, multiple CTAs, and marketing language.",
            },
          ],
        },
      ],
    },
    tags: ["cold email", "sales templates", "outbound", "email marketing"],
    metaTitle: "7 Cold Email Templates with 40%+ Reply Rates (Tested 2025)",
    metaDescription:
      "Stop sending emails that get ignored. These 7 cold email templates are proven to achieve 40%+ reply rates for B2B sales teams.",
  },
  {
    id: "post_lh_003",
    title: "Best Email Finder Tools in 2025: An Honest Comparison",
    slug: "best-email-finder-tools-2025",
    excerpt:
      "We tested the top email finder tools so you don't have to. Here's an honest comparison of accuracy, pricing, and features.",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Finding accurate contact emails is the foundation of any outbound program. We tested 8 of the most popular email finder tools on accuracy, database size, enrichment features, and value for money.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "What to Look for in an Email Finder" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Accuracy matters most — a 70% accuracy rate means 30% of your emails bounce, hurting deliverability. After accuracy: database coverage (tech vs all industries), bulk lookup speed, CRM integrations, and LinkedIn extension availability.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "LeadsterHub" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Best for: Full outbound workflow. LeadsterHub combines email finding with verification, sequencing, and CRM sync in one platform. Accuracy: 94%. Starting at $49/mo for 1,000 credits. The Chrome extension finds emails directly from LinkedIn profiles.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Hunter.io" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Best for: Domain-based searches. Hunter is excellent at finding all emails associated with a company domain. Accuracy: 88%. Free plan available with 25 searches/mo. Limited enrichment data beyond email.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Apollo.io" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Best for: Large teams needing a full sales intelligence platform. Apollo has 270M+ contacts, built-in sequencing, and a free tier. Accuracy: 85%. Can get expensive at scale — $99/user/mo for Pro.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Snov.io" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Best for: Budget-conscious teams. Snov offers email finding, verification, drip campaigns, and CRM at competitive prices. Accuracy: 82%. Strong LinkedIn extension. Starting at $30/mo.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "ZoomInfo" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Best for: Enterprise with big budgets. ZoomInfo has the largest database (321M contacts) and deep company intelligence including org charts, technographics, and buying intent. Accuracy: 91%. Pricing starts at $15k+/yr — not for SMBs.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Our Verdict" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "For most B2B teams, LeadsterHub or Apollo offer the best balance of accuracy, features, and price. Hunter is the best single-purpose tool for domain searches. ZoomInfo is only worth it if you have the budget and need enterprise-level data depth.",
            },
          ],
        },
      ],
    },
    tags: ["email finder", "sales tools", "lead generation", "comparison"],
    metaTitle: "Best Email Finder Tools in 2025: Compared for B2B Sales",
    metaDescription:
      "Honest comparison of the best email finder tools in 2025. We tested accuracy, pricing, and features so you can pick the right tool for your team.",
  },
  {
    id: "post_lh_004",
    title: "LinkedIn Lead Generation: The Complete 2025 Playbook",
    slug: "linkedin-lead-generation-playbook-2025",
    excerpt:
      "The complete playbook for generating B2B leads on LinkedIn — from profile optimisation to outreach sequences that convert.",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "LinkedIn has 900M+ professionals and is the #1 channel for B2B lead generation. But most people use it wrong. This playbook covers everything from profile setup to systematic outreach.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 1: Optimise Your Profile for Leads, Not Jobs" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Your headline should state who you help and how, not just your job title. 'I help SaaS founders book 20+ qualified calls/mo | Outbound sales systems' beats 'CEO at Acme'. Your about section is a landing page — include a clear CTA.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 2: Build Your ICP List with Sales Navigator" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Sales Navigator lets you filter by job title, seniority, company size, industry, geography, and even recent activity (job change, company growth). Build a saved search of 500-2,000 prospects matching your ICP.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 3: Content That Attracts Inbound Leads" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Post 3-5x per week. The formats that drive the most engagement: carousels (slide decks), short text posts with a strong hook, and case study storytelling. The algorithm rewards consistency — show up daily for 90 days before judging results.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 4: Connection Request Sequence" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Send 20-30 connection requests/day. Keep the note short and relevant: 'Hi [Name], I work with [type of companies] on [outcome]. Would love to connect.' After connecting, wait 2-3 days, then send a value-first message — not a pitch.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 5: The 3-Message Sequence" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Message 1 (after connecting): Share a relevant insight or resource. No ask. Message 2 (3 days later): Light touch — 'Did the [resource] help?' or a relevant question. Message 3 (5 days later): The offer — 'Would it make sense to jump on a 15-min call?'. Keep all messages under 3 sentences.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Automation Tools" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Tools like Dripify, Expandi, and LeadsterHub automate connection requests and follow-up messages within LinkedIn's limits. Stay under 100 connection requests/week and vary message timing to avoid account restrictions.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "LinkedIn Ads for Lead Gen" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Lead Gen Forms convert at 2-3x the rate of sending traffic to a landing page. Target by job title + company size. Test Sponsored Content (feed ads) vs Message Ads (InMail). Budget $50-100/day to gather meaningful data in 2 weeks.",
            },
          ],
        },
      ],
    },
    tags: ["LinkedIn", "lead generation", "social selling", "outbound"],
    metaTitle: "LinkedIn Lead Generation Playbook 2025: From Profile to Pipeline",
    metaDescription:
      "The complete LinkedIn lead generation playbook for 2025. Covers profile optimisation, Sales Navigator, content strategy, and outreach sequences.",
  },
  {
    id: "post_lh_005",
    title: "How to Build a Lead Scoring Model That Actually Works",
    slug: "lead-scoring-model-guide",
    excerpt:
      "A practical guide to building a lead scoring model that helps your sales team focus on the prospects most likely to convert.",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Without lead scoring, sales teams waste time on cold prospects while hot buyers go uncontacted. A well-built scoring model surfaces your best leads automatically so reps know exactly who to call first.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Two Types of Lead Scores" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Demographic/firmographic score (fit): does this person match your ICP? Behavioural score (engagement): have they shown buying intent? The best models combine both into a single composite score.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 1: Define Your Ideal Customer Profile" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Look at your last 20 closed-won deals. What job titles, company sizes, industries, and geographies appear most often? These attributes form the positive signals in your fit score. Closed-lost deals reveal negative signals to penalise.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 2: Define Behavioural Signals" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "High-intent signals: pricing page visit (+20), demo request (+50), opened 3+ emails in a week (+15), attended webinar (+25). Low-intent signals: opened a single newsletter (+2), visited blog once (+1). Score decay: subtract 10 points for no activity in 30 days.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 3: Build the Scoring Matrix" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Assign point values to each signal. Total max score: 100. Thresholds: 0-30 = cold, 31-60 = warm (nurture), 61-100 = hot (sales follow-up within 24 hours). Adjust thresholds based on your team's capacity.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 4: Implement in Your CRM" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Most CRMs (HubSpot, Salesforce, Pipedrive) have native lead scoring. Alternatively, use a scoring tool like MadKudu or Breadcrumbs.io that uses ML to weight signals based on your actual conversion data.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 5: Review and Iterate" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Run a monthly analysis: do leads scoring 70+ actually convert at a higher rate? If not, recalibrate your signals. A good lead scoring model improves monthly as it learns from your closed deals.",
            },
          ],
        },
      ],
    },
    tags: ["lead scoring", "CRM", "sales operations", "demand generation"],
    metaTitle: "How to Build a Lead Scoring Model That Works (2025 Guide)",
    metaDescription:
      "Learn how to build a lead scoring model that helps sales teams focus on the best prospects. Step-by-step guide with real point values.",
  },
  {
    id: "post_lh_006",
    title: "Outbound Sales Prospecting: 8 Techniques to Fill Your Pipeline",
    slug: "outbound-sales-prospecting-techniques",
    excerpt:
      "Eight battle-tested outbound prospecting techniques that top sales teams use to consistently fill their pipelines.",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Inbound leads are great but rarely sufficient to hit growth targets. A strong outbound motion ensures you control your pipeline rather than waiting for buyers to find you. These 8 techniques work across industries.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "1. List Building from Intent Signals" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Build prospect lists based on signals: job postings (they're hiring, they have budget), tech stack changes (just switched CRM), funding announcements (growth mode), or G2/Capterra reviews of competitors.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "2. Multi-Channel Sequencing" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Touch prospects across email, LinkedIn, and phone. A sequence might look like: Day 1 email, Day 3 LinkedIn connect, Day 5 email follow-up, Day 7 LinkedIn message, Day 10 phone call. Multi-channel sequences get 287% higher reply rates than email alone.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "3. Video Prospecting" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Record a 60-second personalised video (Loom, Vidyard) referencing the prospect's website or LinkedIn. Video emails get 5x more replies than text emails. Show something specific about their company in the first 5 seconds.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "4. Account-Based Prospecting" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Identify 50 dream accounts. Contact 3-5 stakeholders at each account across departments. Coordinate messaging so different team members receive related (not identical) touches. ABS deals close at 2x the rate of random outbound.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "5. Cold Calling with Research" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Cold calling is alive for decision-makers who don't read email. Research before dialling: know their company news, their LinkedIn summary, and one specific reason you're calling. Opening with 'I know you're busy — I'll be quick. We helped [competitor] with [result]. Is that relevant for you?' works well.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "6. Direct Mail" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "For high-value accounts, physical mail stands out. A handwritten note or a relevant book sent to a CEO often gets a meeting where emails get ignored. Cost-per-meeting is higher but quality is unmatched for enterprise deals.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "7. Event-Triggered Outreach" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Set up alerts for trigger events: funding (Crunchbase), hiring (LinkedIn), tech stack changes (BuiltWith), leadership changes (LinkedIn). Reaching out within 48 hours of a trigger event gets 3-5x higher response rates.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "8. Referral Prospecting" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "After closing a deal, ask: 'Who else in your network faces the same challenge?' A warm introduction converts at 5-10x the rate of cold outreach. Build referral asks into your post-close process systematically.",
            },
          ],
        },
      ],
    },
    tags: ["outbound sales", "prospecting", "pipeline", "cold calling"],
    metaTitle: "8 Outbound Sales Prospecting Techniques to Fill Your Pipeline (2025)",
    metaDescription:
      "From multi-channel sequencing to event-triggered outreach — 8 outbound prospecting techniques the best sales teams use in 2025.",
  },
  {
    id: "post_lh_007",
    title: "B2B Email Deliverability: The Complete Guide to Landing in the Inbox",
    slug: "b2b-email-deliverability-guide",
    excerpt:
      "Everything you need to know about B2B email deliverability — from DNS setup to warming protocols that keep you out of spam.",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Deliverability is the most underappreciated part of cold email. You can have the best copy in the world — if it lands in spam, nothing else matters. Here's the complete playbook.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "DNS Authentication: SPF, DKIM, and DMARC" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "SPF authorises which servers can send email from your domain. DKIM adds a cryptographic signature to verify email authenticity. DMARC tells receiving servers what to do with emails that fail SPF/DKIM. All three are required — skip any and your emails will struggle.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Use Sending Subdomains" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Never send cold email from your primary domain. Use outbound@mail.yourcompany.com or yourcompany.io. If your subdomain gets blacklisted, your main domain (and reply emails from customers) are unaffected.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Email Warming" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "New mailboxes have no sending reputation. Use a warming tool (Lemwarm, Mailreach, Smartlead's warm-up) for 4-6 weeks before sending cold email. Start at 10 emails/day, increase by 10 every 3 days until you reach 50/day max.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "List Hygiene" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Bounce rate above 3% damages your sender reputation fast. Always verify emails before sending with a tool like NeverBounce, ZeroBounce, or LeadsterHub's built-in verifier. Remove catch-all and role-based addresses (info@, hello@).",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Sending Limits and Patterns" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Send no more than 50 cold emails/mailbox/day. Use multiple mailboxes (rotating) for higher volume. Send between 8am-5pm recipient local time. Add random delays between emails (2-5 minutes). Avoid sending all emails simultaneously.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Content That Avoids Spam Filters" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Avoid spam trigger words: 'free', 'guaranteed', 'no obligation', 'winner'. Keep HTML minimal — plain text emails have better deliverability. Never use URL shorteners. Don't attach files. Keep links to 1 maximum.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Monitor Your Reputation" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Check Google Postmaster Tools and Microsoft SNDS weekly. Use MXToolbox to check blacklist status. If you appear on a blacklist, identify the cause (high bounces, spam complaints) and fix it before requesting removal.",
            },
          ],
        },
      ],
    },
    tags: ["email deliverability", "cold email", "SPF DKIM DMARC", "outbound"],
    metaTitle: "B2B Email Deliverability Guide 2025: Land in the Inbox Every Time",
    metaDescription:
      "The complete B2B email deliverability guide. Covers DNS setup, email warming, list hygiene, and sending practices to stay out of spam.",
  },
  {
    id: "post_lh_008",
    title: "How to Define Your Ideal Customer Profile (ICP): Template + Examples",
    slug: "ideal-customer-profile-template",
    excerpt:
      "A practical framework for defining your ICP, with a ready-to-use template and real examples from B2B SaaS companies.",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "A vague ICP is one of the top reasons outbound campaigns fail. When you try to sell to everyone, you resonate with no one. Defining a precise ICP makes every piece of your go-to-market more effective.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "ICP vs Buyer Persona: What's the Difference?" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "ICP describes the ideal company: industry, size, revenue, tech stack, growth stage. Buyer persona describes the ideal person within that company: job title, responsibilities, goals, pain points. Both matter — ICP comes first.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 1: Analyse Your Best Customers" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Pull your top 20% of customers by: LTV, NPS score, expansion revenue, and referrals. What do they have in common? Industry patterns, company size ranges, and specific use cases will emerge.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Step 2: Identify Negative Signals" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Look at churned customers and closed-lost deals. What firmographic or behavioural signals predicted failure? These become disqualifying criteria — companies matching these signals should be deprioritised or excluded from outreach.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "The ICP Template" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Company attributes: Industry (e.g. B2B SaaS), Company size (50-500 employees), Annual revenue ($5M-$50M), Geography (North America), Growth rate (20%+ YoY). Tech stack (e.g. uses HubSpot, Outreach). Job attributes: Title (VP Sales, Head of Growth), Reports to (CEO or CRO), Team size (3-15 SDRs). Pain points: [list 3-5 specific pains your product solves].",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Example: LeadsterHub ICP" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Industry: B2B SaaS and professional services. Size: 10-200 employees. Revenue: $1M-$20M ARR. Buyer: VP Sales or Founder. Pain: spending too much time on manual prospecting, poor email deliverability, low meeting book rates. Tech: uses a CRM (HubSpot/Salesforce) but lacks dedicated outbound tooling.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Using Your ICP to Build Target Lists" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Run your ICP attributes through LinkedIn Sales Navigator, Apollo, or LeadsterHub to build your first target list. Aim for a list of 500-2,000 highly-qualified prospects before launching your first campaign. Quality over quantity.",
            },
          ],
        },
      ],
    },
    tags: ["ICP", "ideal customer profile", "go-to-market", "sales strategy"],
    metaTitle: "How to Define Your Ideal Customer Profile (ICP) — Template & Examples",
    metaDescription:
      "Define your ideal customer profile with this practical template and B2B examples. Learn how to identify your best-fit customers and build better prospect lists.",
  },
  {
    id: "post_lh_009",
    title: "Sales Automation Tools in 2025: What to Automate (and What Not To)",
    slug: "sales-automation-tools-2025",
    excerpt:
      "A guide to the best sales automation tools in 2025 and a framework for deciding what to automate without losing the human touch.",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Sales automation done right frees reps to spend more time on high-value activities. Done wrong, it creates robotic outreach that burns prospects and damages brand. Here's the playbook.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "What to Automate" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Safe to automate: email follow-up sequences, LinkedIn connection requests (with limits), meeting scheduling (Calendly), CRM data entry (via integrations), lead enrichment, email verification, and reporting. These tasks are repetitive, low-judgment, and benefit from consistency.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "What NOT to Automate" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Never automate: the first line of a cold email (personalise it), responses to replies (always respond manually), contract negotiation, customer success conversations, and references to recent news or events. The moment automation feels generic is the moment it fails.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Best Sales Automation Tools 2025" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Outreach/Salesloft: enterprise sequencing with AI writing assistance. Apollo.io: prospecting + sequencing in one. LeadsterHub: email finding, verification, and outbound automation. Instantly.ai: high-volume cold email with strong deliverability features. Clay: data enrichment and hyper-personalisation at scale. Calendly: meeting scheduling. Gong: call recording and AI coaching.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Building Your Sales Tech Stack" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "For a team of 1-5 SDRs: CRM (HubSpot free/starter) + email sequencer (LeadsterHub or Instantly) + meeting scheduler (Calendly) = $200-500/mo total. Avoid adding tools before you've maxed out what you already have.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Measuring Automation ROI" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Track: time saved per SDR per week, reply rate (automated vs manual), meetings booked per 100 contacts, and cost per meeting. If automation is reducing reply rates, the time savings don't justify the trade-off. Rebalance toward personalisation.",
            },
          ],
        },
      ],
    },
    tags: ["sales automation", "sales tools", "sequencing", "outbound"],
    metaTitle: "Best Sales Automation Tools in 2025: What to Automate and What Not To",
    metaDescription:
      "Guide to sales automation in 2025. Learn what to automate, what to keep human, and which tools the best outbound teams are using.",
  },
  {
    id: "post_lh_010",
    title: "Demand Generation vs Lead Generation: What's the Difference?",
    slug: "demand-generation-vs-lead-generation",
    excerpt:
      "Demand gen vs lead gen — two terms that are often confused. Here's a clear breakdown of the differences and how to build both.",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Marketing teams argue about demand gen vs lead gen endlessly. In practice, both are essential — they serve different stages of the buyer journey. Understanding the difference helps you allocate budget and measure results correctly.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "What is Demand Generation?" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Demand generation creates awareness and interest in your category and product. The goal is to build a large audience of potential buyers who understand the problem you solve. Channels: content marketing, social media, podcasts, webinars, community, SEO, brand advertising.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "What is Lead Generation?" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Lead generation captures the contact information of buyers who have shown intent. The goal is to convert anonymous demand into identifiable, contactable prospects. Channels: gated content, free trials, demo requests, forms, cold outreach, events.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Key Differences" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Demand gen: long-term investment, brand building, top-of-funnel, hard to attribute directly to revenue. Lead gen: shorter-term, directly attributable, bottom-of-funnel, scalable with budget. Demand gen feeds lead gen — without awareness, outbound conversion rates drop.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "The Problem with Only Doing Lead Gen" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Companies that focus solely on lead gen face: declining email reply rates as they saturate their ICP, heavy reliance on paid acquisition, and no organic growth engine. Adding demand gen content gradually reduces cost-per-lead as inbound picks up.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "How to Build Both" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Early stage (0-$1M ARR): focus 80% on lead gen (outbound, referrals) and 20% on demand gen (1-2 blog posts/week, LinkedIn presence). Growth stage ($1M-$10M ARR): shift to 60/40. Scale stage ($10M+ ARR): invest heavily in brand — it reduces CAC across all channels.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Metrics for Each" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Demand gen metrics: organic traffic, share of voice, brand search volume, social following growth, content engagement. Lead gen metrics: MQLs, SQLs, cost per MQL, form conversion rate, demo requests, pipeline generated. Track both — optimising only for leads will eventually hollow out your brand.",
            },
          ],
        },
      ],
    },
    tags: ["demand generation", "lead generation", "marketing strategy", "B2B marketing"],
    metaTitle: "Demand Generation vs Lead Generation: Key Differences Explained",
    metaDescription:
      "Demand gen vs lead gen — what's the difference and which should you focus on? Clear breakdown with practical advice for B2B companies at every stage.",
  },
];

// Find the actual project
const { rows: [projectRow] } = await pool.query(
  `SELECT id FROM "projects" WHERE "organizationId" = $1 LIMIT 1`,
  [ORG_ID]
);

// Try to find LeadsterHub specifically
const { rows: allProjects } = await pool.query(
  `SELECT id, name FROM "projects" WHERE "organizationId" = $1`,
  [ORG_ID]
);

console.log("All projects for org:", allProjects);

const leadsterProject =
  allProjects.find(
    (p) =>
      p.name.toLowerCase().includes("lead") ||
      p.name.toLowerCase().includes("leadster")
  ) || allProjects[0];

if (!leadsterProject) {
  console.error("No project found");
  process.exit(1);
}

const projectId = leadsterProject.id;
console.log(`Inserting posts into project: ${projectId} (${leadsterProject.name})`);

// Check for existing posts
const { rows: existingPosts } = await pool.query(
  `SELECT id FROM "posts" WHERE "projectId" = $1`,
  [projectId]
);
console.log(`Existing posts: ${existingPosts.length}`);

let inserted = 0;
let skipped = 0;

for (const post of posts) {
  // Check if this post already exists (by slug)
  const { rows: existing } = await pool.query(
    `SELECT id FROM "posts" WHERE "projectId" = $1 AND slug = $2`,
    [projectId, post.slug]
  );

  if (existing.length > 0) {
    console.log(`Skipping existing post: ${post.slug}`);
    skipped++;
    continue;
  }

  await pool.query(
    `INSERT INTO "posts" (
      id, "projectId", "organizationId", title, slug, excerpt, content,
      tags, "metaTitle", "metaDescription", status, "publishedAt",
      "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7::jsonb,
      $8, $9, $10, 'PUBLISHED', NOW(),
      NOW(), NOW()
    )`,
    [
      post.id,
      projectId,
      ORG_ID,
      post.title,
      post.slug,
      post.excerpt,
      JSON.stringify(post.content),
      post.tags,
      post.metaTitle,
      post.metaDescription,
    ]
  );
  console.log(`Inserted: ${post.title}`);
  inserted++;
}

console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);
await pool.end();
