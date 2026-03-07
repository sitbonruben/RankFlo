import { NextResponse } from "next/server";

/**
 * RankFlo SDK — Info / Documentation endpoint.
 *
 * Returns JSON metadata about the available SDK endpoints and provides
 * ready-to-use embed snippets so integrators can quickly get started.
 *
 * GET /api/v1/sdk
 */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.rankflo.io";

  return NextResponse.json(
    {
      version: "1.0.0",
      endpoints: [
        {
          name: "Subscribe Widget",
          path: "/api/v1/sdk/subscribe.js",
          method: "GET",
          description:
            "Embeddable JavaScript widget that renders a subscribe form and captures email subscribers.",
          parameters: {
            key: {
              required: true,
              description:
                "Your project API key (blg_xxx). Passed as a query parameter on the script URL.",
            },
          },
          dataAttributes: {
            "data-rankflo-subscribe": {
              required: true,
              description:
                "Add this attribute to any HTML element to mount a subscribe form inside it.",
            },
            "data-rankflo-theme": {
              required: false,
              default: "dark",
              description:
                'Color theme for the widget. Accepts "dark" or "light".',
            },
            "data-rankflo-button-text": {
              required: false,
              default: "Subscribe",
              description: "Text displayed on the submit button.",
            },
            "data-rankflo-placeholder": {
              required: false,
              default: "Enter your email",
              description: "Placeholder text for the email input field.",
            },
            "data-rankflo-source": {
              required: false,
              default: "widget",
              description:
                "Attribution tag that tracks where the subscriber came from.",
            },
          },
        },
        {
          name: "Content SDK",
          path: "/api/v1/content",
          method: "GET",
          description:
            "Headless CMS API for fetching published posts by project API key.",
        },
        {
          name: "Subscribe API",
          path: "/api/v1/subscribe",
          method: "POST",
          description:
            "REST endpoint for programmatically subscribing an email address.",
        },
      ],
      embedCode: [
        "<!-- RankFlo Subscribe Widget -->",
        `<script src="${appUrl}/api/v1/sdk/subscribe.js?key=YOUR_PROJECT_KEY"></script>`,
        '<div data-rankflo-subscribe data-rankflo-theme="dark"></div>',
      ].join("\n"),
    },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
