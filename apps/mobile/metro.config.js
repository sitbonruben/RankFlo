const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root for changes (needed for workspace packages)
config.watchFolders = [monorepoRoot];

// Let Metro resolve packages from the monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Enable package.json "exports" field support (required for ESM-only packages like copy-anything)
config.resolver.unstable_enablePackageExports = true;

// Explicitly set condition names to avoid react-server subset
config.resolver.unstable_conditionNames = [
  "react-native",
  "browser",
  "require",
  "import",
  "default",
];

// Force react and react-native to always resolve from the mobile app's node_modules
// to prevent React 19 from the monorepo root being loaded alongside React 18
const mobileNodeModules = path.resolve(projectRoot, "node_modules");
const forcedModules = {
  react: path.resolve(mobileNodeModules, "react"),
  "react/jsx-runtime": path.resolve(mobileNodeModules, "react/jsx-runtime"),
  "react/jsx-dev-runtime": path.resolve(mobileNodeModules, "react/jsx-dev-runtime"),
  "react-native": path.resolve(mobileNodeModules, "react-native"),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force specific modules to resolve from mobile's node_modules
  if (forcedModules[moduleName]) {
    return {
      filePath: require.resolve(moduleName, { paths: [mobileNodeModules] }),
      type: "sourceFile",
    };
  }

  // Fallback to default resolution
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
