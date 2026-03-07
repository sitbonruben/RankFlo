// ─── Types ──────────────────────────────────────────────────────
export type {
  GitConfig,
  ShopifyConfig,
  WordPressConfig,
  WebflowConfig,
  WixConfig,
  RestApiConfig,
  GraphQLConfig,
  IntegrationConfig,
  ContentItem,
  DeployResult,
  ProjectInfo,
  BrandColors,
  BrandFonts,
  BrandProfile,
  ListContentOptions,
  Connector,
} from "./types";

// ─── Zod Schemas ────────────────────────────────────────────────
export {
  gitConfigSchema,
  shopifyConfigSchema,
  wordpressConfigSchema,
  webflowConfigSchema,
  wixConfigSchema,
  restApiConfigSchema,
  graphqlConfigSchema,
} from "./types";

// ─── Registry (Connector Factory) ───────────────────────────────
export { createConnector } from "./registry";

// ─── Connectors ─────────────────────────────────────────────────
export {
  BaseConnector,
  ConnectorError,
  GitHubConnector,
  ShopifyConnector,
  WordPressConnector,
  WebflowConnector,
  WixConnector,
  RestConnector,
  GraphQLConnector,
} from "./connectors/index";

// ─── Brand Extraction ───────────────────────────────────────────
export { BrandExtractor } from "./brand/index";
export {
  type RGB,
  type HSL,
  parseColor,
  parseHex,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  relativeLuminance,
  contrastRatio,
  isLightOrDark,
  findDominantColors,
  complementaryColor,
  analogousColors,
  triadicColors,
  lighten,
  darken,
  isValidColor,
} from "./brand/index";
