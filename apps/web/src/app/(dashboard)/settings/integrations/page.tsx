"use client";

const INTEGRATIONS = [
  {
    name: "GitHub",
    description: "Auto-sync posts from a GitHub repo via webhook on push.",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    status: "coming_soon",
  },
  {
    name: "WordPress",
    description: "One-click import of all posts, pages, tags, and authors.",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c2.34 0 4.484.843 6.15 2.234L4.234 18.15A8.457 8.457 0 013.5 12c0-4.687 3.813-8.5 8.5-8.5zm0 17c-2.34 0-4.484-.843-6.15-2.234l13.916-13.916A8.457 8.457 0 0120.5 12c0 4.687-3.813 8.5-8.5 8.5z" />
      </svg>
    ),
    status: "coming_soon",
  },
  {
    name: "Webflow",
    description: "Pull content from Webflow CMS into your RankFlo projects.",
    icon: (
      <svg className="h-5 w-5 font-bold" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.8 2H6.2A4.2 4.2 0 002 6.2v11.6A4.2 4.2 0 006.2 22h11.6a4.2 4.2 0 004.2-4.2V6.2A4.2 4.2 0 0017.8 2zm-5.3 14.5l-3.6-4.8-2.6 4.8H4.5l3.8-7L5 5.5h1.9l3.3 4.5 2.5-4.5h1.8l-3.5 6.4 3.8 4.6h-2.3zm5.1 0l-2.3-3.1-1.1 2H12.5l2-3.6-2.8-3.8h2l1.9 2.6 1.8-3.1h1.7l-2.7 4.7 2.9 4.3H17.6z" />
      </svg>
    ),
    status: "coming_soon",
  },
  {
    name: "Shopify",
    description: "Import your Shopify blog posts and collections.",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.337 23.979l7.216-1.561S19.973 7.514 19.95 7.348c-.022-.167-.167-.278-.306-.278s-2.784-.194-2.784-.194-.5-.5-1.167-1.111V5.76c0-.5-.361-.695-.695-.695-.028 0-.056.003-.083.006-.056-.778-.5-1.5-1.334-2.167-.194-.166-.389-.25-.583-.25-.083 0-.167.028-.25.056C12.47 1.93 11.998 1.5 10.997 1.5c-.75 0-1.5.278-2.084.75-.167.139-.278.278-.389.417-.194-.028-.389-.056-.583-.056-1.084 0-1.862.806-2.167 2.084-.833.25-1.417.806-1.667 1.667L2.94 6.557s-.167.083-.222.222L.024 22.418l14.758 2.588.555-1.027zm-5.229-20.65c0-.028.028-.028.028-.056.222-.806.806-1.222 1.389-1.222.5 0 .834.25 1.084.583-.028 0-.056-.028-.083-.028-.667 0-1.084.278-1.334.722-.028.056-.028.083-.056.139-.028.083-.028.167-.028.25v.028c0 .028 0 .056.028.083.028.139.056.278.111.389-.334.028-.639.056-.917.056-.389 0-.75-.028-1.084-.083.139-.583.528-1.5.862-1.861zm1.89 1.972c-.25-.167-.417-.306-.417-.667 0-.167.056-.25.167-.25.056 0 .111.028.139.056.25.222.389.5.5.806-.139-.028-.278-.056-.389.055zM9.97 3.385c.083 0 .167.028.25.056-.056.028-.111.083-.167.111-.361.25-.694.667-.889 1.167-.139.028-.278.056-.417.083.25-.917.75-1.417 1.223-1.417zm-2.25 2.86c.278-.028.528-.056.778-.056.25 0 .5.028.75.028l.028-.556c.028-.25.25-.444.5-.444.056 0 .111.028.167.056l.25 1.139c.25.028.5.056.722.083l.139-.556c.028-.25.25-.444.5-.444.056 0 .111.028.167.056l.25 1.167c.222.028.444.056.639.056l.139.25c-.528.417-1.028.889-1.472 1.472-.167.222-.306.444-.417.667-.306-.139-.722-.25-1.056-.25-.75 0-1.222.417-1.222 1.083 0 .556.389.806.722.806.417 0 .639-.25.639-.556 0-.139-.028-.25-.139-.306v-.028c0-.028.028-.028.056-.028.028 0 .083.028.111.056.222.167.361.5.361.806 0 .5-.333.889-.944.889-.583 0-1.083-.417-1.083-1.167 0-.806.528-1.361 1.222-1.611.083-.028.139-.028.222-.056l-.222-.972c-.75.028-1.417.139-2.028.5l.028-.028c-.083-.028-.139-.083-.167-.194-.139-.944.444-3.694 1.5-3.694zm-2.111-.278h.139l-.167.806c-.417.25-.75.611-1 .972.139-.833.528-1.583 1.028-1.778zm8.937 9.19c0 1.194-.444 1.861-1.083 1.861-.25 0-.5-.111-.722-.278l.361-.722c.111.083.222.139.333.139.278 0 .445-.306.445-.972 0-.528-.278-.917-.667-.917-.222 0-.444.111-.611.25l-.361-.75c.25-.222.556-.361.917-.361.778 0 1.389.75 1.389 1.75z" />
      </svg>
    ),
    status: "coming_soon",
  },
  {
    name: "REST API",
    description: "Pull content from any REST endpoint on a schedule.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
    status: "coming_soon",
  },
  {
    name: "GraphQL",
    description: "Query any GraphQL API and map fields to RankFlo posts.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
    status: "coming_soon",
  },
];

export default function SettingsIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Integrations</h2>
        <p className="text-sm text-gray-500">
          Connect external platforms to import and sync content into RankFlo.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-sm text-gray-500">
            Integrations are in development. Use{" "}
            <span className="font-medium text-gray-300">Webhooks</span> to receive real-time post events,
            or the{" "}
            <span className="font-medium text-gray-300">Content API</span> to push content programmatically today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 opacity-70 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                {integration.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {integration.name}
                </p>
                <p className="text-xs text-gray-500">{integration.description}</p>
              </div>
            </div>
            <span className="rounded-full border border-gray-700 px-2.5 py-0.5 text-xs text-gray-500">
              Soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
