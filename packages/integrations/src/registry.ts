import type { IntegrationConfig, Connector } from "./types";
import { GitHubConnector } from "./connectors/github";
import { ShopifyConnector } from "./connectors/shopify";
import { WordPressConnector } from "./connectors/wordpress";
import { WebflowConnector } from "./connectors/webflow";
import { WixConnector } from "./connectors/wix";
import { RestConnector } from "./connectors/rest";
import { GraphQLConnector } from "./connectors/graphql";

/**
 * Create the appropriate connector instance for the given integration configuration.
 *
 * This is the main entry point for creating connectors — callers provide
 * a discriminated union of `{ type, config }` and receive a fully typed
 * Connector instance ready to `connect()`.
 *
 * @param integration - A discriminated union containing the integration type and its config.
 * @returns A Connector instance for the specified integration type.
 * @throws Error if the integration type is not supported.
 *
 * @example
 * ```ts
 * const connector = createConnector({
 *   type: "GITHUB",
 *   config: {
 *     provider: "github",
 *     owner: "my-org",
 *     repo: "blog",
 *     branch: "main",
 *     token: "ghp_...",
 *     contentDir: "content/blog",
 *     format: "mdx",
 *   },
 * });
 *
 * await connector.connect();
 * const posts = await connector.listContent();
 * ```
 */
export function createConnector(integration: IntegrationConfig): Connector {
  switch (integration.type) {
    case "GITHUB":
    case "GITLAB":
    case "BITBUCKET":
      // All Git providers use the GitHub connector for now.
      // GitLab and Bitbucket will get dedicated connectors in the future;
      // the GitConfig.provider field records which provider is in use.
      return new GitHubConnector(integration.config);

    case "SHOPIFY_API":
      return new ShopifyConnector(integration.config);

    case "WORDPRESS_API":
      return new WordPressConnector(integration.config);

    case "WEBFLOW_API":
      return new WebflowConnector(integration.config);

    case "WIX_API":
      return new WixConnector(integration.config);

    case "REST_API":
      return new RestConnector(integration.config);

    case "GRAPHQL_API":
      return new GraphQLConnector(integration.config);

    case "SDK":
      throw new Error(
        "SDK integration type does not use a connector. " +
          "Use the RankFlo SDK directly instead.",
      );

    default: {
      const exhaustive: never = integration;
      throw new Error(
        `Unsupported integration type: ${(exhaustive as IntegrationConfig).type}`,
      );
    }
  }
}
