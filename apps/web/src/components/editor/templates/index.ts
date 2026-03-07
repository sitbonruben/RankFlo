import { createBlock } from "@/lib/editor-utils";
import type { EditorDocument } from "@rankflo/core/types";

// ─── Template Interface ───────────────────────────────
export interface Template {
  id: string;
  name: string;
  description: string;
  category: "general" | "technical" | "marketing";
  document: EditorDocument;
}

// ─── Templates ────────────────────────────────────────
export const TEMPLATES: Template[] = [
  // 1. Minimal Blog
  {
    id: "minimal-blog",
    name: "Minimal Blog",
    description:
      "A clean, text-focused layout with a hero section, structured content, and an author bio.",
    category: "general",
    document: {
      version: 1,
      blocks: [
        createBlock("hero", {
          title: "Your Blog Title",
          subtitle: "A compelling subtitle that hooks your reader",
          backgroundImage: "",
          overlay: "none",
          alignment: "center",
          height: "medium",
        }),
        createBlock("text", {
          html: "<p>Welcome to your new blog post. Start with a strong opening paragraph that sets the stage for the rest of your article. Capture your reader's attention from the very first sentence.</p>",
          alignment: "left",
        }),
        createBlock("heading", {
          text: "The Main Idea",
          level: 2,
          alignment: "left",
        }),
        createBlock("text", {
          html: "<p>Dive deeper into your topic here. Explain your main points, share your perspective, and provide value to your readers. Use clear, concise language to keep them engaged throughout.</p>",
          alignment: "left",
        }),
        createBlock("divider", {
          style: "line",
          spacing: "medium",
        }),
        createBlock("author-bio", {
          name: "Your Name",
          avatar: "",
          bio: "A brief bio about the author. Share your expertise, interests, and what drives you to write.",
          links: [],
        }),
      ],
      metadata: { template: "minimal-blog" },
    },
  },

  // 2. Technical Tutorial
  {
    id: "technical-tutorial",
    name: "Technical Tutorial",
    description:
      "Step-by-step guide with code blocks, callouts, and a table of contents.",
    category: "technical",
    document: {
      version: 1,
      blocks: [
        createBlock("heading", {
          text: "Tutorial Title",
          level: 1,
          alignment: "left",
        }),
        createBlock("callout", {
          text: "Make sure you have Node.js 18+ and npm installed before starting this tutorial.",
          type: "info",
          title: "Prerequisites",
        }),
        createBlock("text", {
          html: "<p>In this tutorial, you will learn how to build a complete feature from scratch. We will cover the core concepts, walk through the implementation, and test the final result.</p>",
          alignment: "left",
        }),
        createBlock("heading", {
          text: "Step 1: Setting Up",
          level: 2,
          alignment: "left",
        }),
        createBlock("code", {
          code: 'import { useState, useEffect } from "react";\n\nfunction App() {\n  const [data, setData] = useState(null);\n\n  useEffect(() => {\n    fetchData().then(setData);\n  }, []);\n\n  return <div>{data ? <Display data={data} /> : <Loading />}</div>;\n}',
          language: "typescript",
          filename: "app.tsx",
          showLineNumbers: true,
        }),
        createBlock("text", {
          html: "<p>The code above sets up the basic component structure. We initialize state to hold our data and use an effect to fetch it when the component mounts.</p>",
          alignment: "left",
        }),
        createBlock("heading", {
          text: "Step 2: Adding Logic",
          level: 2,
          alignment: "left",
        }),
        createBlock("code", {
          code: 'async function fetchData(): Promise<Record<string, unknown>> {\n  const response = await fetch("/api/data");\n  if (!response.ok) {\n    throw new Error(`Request failed: ${response.status}`);\n  }\n  return response.json();\n}',
          language: "typescript",
          filename: "utils.ts",
          showLineNumbers: true,
        }),
        createBlock("table-of-contents", {
          style: "minimal",
          maxDepth: 3,
        }),
      ],
      metadata: { template: "technical-tutorial" },
    },
  },

  // 3. Marketing Launch
  {
    id: "marketing-launch",
    name: "Marketing Launch",
    description:
      "Bold, conversion-focused layout with a hero banner, feature highlights, testimonials, and a CTA.",
    category: "marketing",
    document: {
      version: 1,
      blocks: [
        createBlock("hero", {
          title: "Introducing Our Latest Product",
          subtitle:
            "The tool you have been waiting for. Faster, smarter, and built for your workflow.",
          backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
          overlay: "gradient",
          alignment: "center",
          height: "large",
        }),
        createBlock("two-column", {
          ratio: "50-50",
          gap: "large",
          leftChildren: [
            createBlock("heading", {
              text: "Why You Will Love It",
              level: 2,
              alignment: "left",
            }),
            createBlock("list", {
              items: [
                "Lightning-fast performance out of the box",
                "Intuitive drag-and-drop interface",
                "Built-in analytics and reporting",
                "Seamless integrations with your stack",
              ],
              style: "bullet",
            }),
          ],
          rightChildren: [
            createBlock("image", {
              src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
              alt: "Product screenshot showing the dashboard interface",
              caption: "The all-new dashboard experience",
              width: "large",
              rounded: true,
              shadow: true,
            }),
          ],
        }),
        createBlock("quote", {
          text: "This product completely transformed our workflow. We shipped 3x faster in the first month alone.",
          author: "Alex Rivera, CTO at TechCorp",
          style: "bordered",
        }),
        createBlock("newsletter-cta", {
          title: "Get Early Access",
          description:
            "Join the waitlist and be the first to try our new platform. No spam, ever.",
          buttonText: "Join Waitlist",
          style: "banner",
          placeholder: "your@email.com",
        }),
      ],
      metadata: { template: "marketing-launch" },
    },
  },

  // 4. Listicle
  {
    id: "listicle",
    name: "Listicle",
    description:
      "Numbered list format ideal for top-N articles, roundups, and curated content.",
    category: "general",
    document: {
      version: 1,
      blocks: [
        createBlock("hero", {
          title: "Top 10 Things You Need to Know",
          subtitle: "A curated guide to the best resources, tips, and insights",
          backgroundImage: "",
          overlay: "none",
          alignment: "center",
          height: "medium",
        }),
        createBlock("text", {
          html: "<p>We have researched and tested dozens of options to bring you this definitive list. Whether you are a beginner or an expert, there is something here for everyone.</p>",
          alignment: "left",
        }),
        createBlock("heading", {
          text: "1. First Point",
          level: 2,
          alignment: "left",
        }),
        createBlock("text", {
          html: "<p>Explain the first item on your list. Why does it matter? What makes it stand out? Provide context and concrete examples to support your recommendation.</p>",
          alignment: "left",
        }),
        createBlock("image", {
          src: "",
          alt: "Descriptive alt text for the image",
          caption: "An illustrative screenshot or photo",
          width: "large",
          rounded: true,
          shadow: false,
        }),
        createBlock("heading", {
          text: "2. Second Point",
          level: 2,
          alignment: "left",
        }),
        createBlock("text", {
          html: "<p>Continue with your second item. Keep the format consistent so readers know what to expect. Each section should be self-contained and valuable on its own.</p>",
          alignment: "left",
        }),
        createBlock("list", {
          items: [
            "Key benefit or feature one",
            "Key benefit or feature two",
            "Key benefit or feature three",
          ],
          style: "bullet",
        }),
        createBlock("newsletter-cta", {
          title: "Enjoyed This List?",
          description:
            "Subscribe to get our latest curated lists and guides delivered weekly.",
          buttonText: "Subscribe",
          style: "card",
          placeholder: "your@email.com",
        }),
      ],
      metadata: { template: "listicle" },
    },
  },

  // 5. Newsletter
  {
    id: "newsletter",
    name: "Newsletter",
    description:
      "Personal, conversational format perfect for weekly digests and curated updates.",
    category: "general",
    document: {
      version: 1,
      blocks: [
        createBlock("heading", {
          text: "Weekly Digest #42",
          level: 1,
          alignment: "left",
        }),
        createBlock("text", {
          html: "<p>Hey there! Welcome back to another edition of our newsletter. This week has been packed with exciting developments, and I cannot wait to share them with you. Grab your coffee and let us dive in.</p>",
          alignment: "left",
        }),
        createBlock("divider", {
          style: "dots",
          spacing: "medium",
        }),
        createBlock("heading", {
          text: "Highlights",
          level: 2,
          alignment: "left",
        }),
        createBlock("list", {
          items: [
            "Major update: Version 3.0 is here with a redesigned interface",
            "Community spotlight: How one team increased productivity by 40%",
            "Tutorial: Building your first integration in under 10 minutes",
            "Upcoming event: Join our live AMA this Friday at 2pm EST",
          ],
          style: "bullet",
        }),
        createBlock("divider", {
          style: "line",
          spacing: "medium",
        }),
        createBlock("callout", {
          text: "We are hosting a free workshop next week on advanced techniques. Spots are limited, so register now to secure your place.",
          type: "info",
          title: "Upcoming Workshop",
        }),
        createBlock("author-bio", {
          name: "Your Name",
          avatar: "",
          bio: "Curator and editor of this newsletter. Passionate about sharing the best resources and insights with our community.",
          links: [],
        }),
      ],
      metadata: { template: "newsletter" },
    },
  },

  // 6. Case Study
  {
    id: "case-study",
    name: "Case Study",
    description:
      "Professional layout for showcasing client success stories with challenges, solutions, and results.",
    category: "marketing",
    document: {
      version: 1,
      blocks: [
        createBlock("hero", {
          title: "How Acme Corp Increased Revenue by 150%",
          subtitle:
            "A deep dive into the strategy, execution, and measurable results",
          backgroundImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
          overlay: "dark",
          alignment: "center",
          height: "large",
        }),
        createBlock("two-column", {
          ratio: "50-50",
          gap: "large",
          leftChildren: [
            createBlock("heading", {
              text: "The Challenge",
              level: 2,
              alignment: "left",
            }),
            createBlock("text", {
              html: "<p>Acme Corp was struggling with outdated processes and fragmented tools. Their team spent more time on manual tasks than on strategic work, leading to slow growth and declining customer satisfaction.</p>",
              alignment: "left",
            }),
          ],
          rightChildren: [
            createBlock("heading", {
              text: "The Solution",
              level: 2,
              alignment: "left",
            }),
            createBlock("text", {
              html: "<p>We implemented a comprehensive platform that automated their core workflows, unified their data, and gave the team real-time visibility into performance metrics across every department.</p>",
              alignment: "left",
            }),
          ],
        }),
        createBlock("heading", {
          text: "Results",
          level: 2,
          alignment: "center",
        }),
        createBlock("quote", {
          text: "The transformation was remarkable. Within three months, our team was operating at a completely different level. The ROI paid for itself in the first quarter.",
          author: "Sarah Chen, VP of Operations at Acme Corp",
          style: "bordered",
        }),
        createBlock("image", {
          src: "",
          alt: "Results dashboard showing key performance metrics",
          caption: "Key metrics before and after implementation",
          width: "large",
          rounded: true,
          shadow: true,
        }),
        createBlock("newsletter-cta", {
          title: "Want Similar Results?",
          description:
            "Let us show you how we can help transform your business. Schedule a free consultation today.",
          buttonText: "Get Started",
          style: "card",
          placeholder: "your@email.com",
        }),
      ],
      metadata: { template: "case-study" },
    },
  },
];
