"use client";

const INTEGRATIONS = [
  { name: "GitHub", description: "Sync content from repositories", icon: "G", connected: false },
  { name: "Shopify", description: "Import blog posts and pages", icon: "S", connected: false },
  { name: "WordPress", description: "Migrate your WordPress content", icon: "W", connected: false },
  { name: "Webflow", description: "Import from Webflow CMS", icon: "Wf", connected: false },
  { name: "Wix", description: "Import from Wix blogs", icon: "Wx", connected: false },
  { name: "REST API", description: "Connect any REST endpoint", icon: "R", connected: false },
  { name: "GraphQL", description: "Connect any GraphQL API", icon: "Q", connected: false },
];

export default function SettingsIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Integrations</h2>
        <p className="text-sm text-gray-500">Connect external platforms to sync and deploy content.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                {integration.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {integration.name}
                </p>
                <p className="text-xs text-gray-500">{integration.description}</p>
              </div>
            </div>
            <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200">
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
