const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo (shared packages)
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order.
// IMPORTANT: For pnpm, we must NOT use disableHierarchicalLookup = true
// because pnpm uses symlinks + a virtual store (.pnpm), and Metro needs
// to walk up the directory tree to resolve transitive dependencies correctly.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Enable package.exports resolution for modern packages (optional but recommended)
config.resolver.unstable_enablePackageExports = true;

// 4. DO NOT set disableHierarchicalLookup = true with pnpm!
//    That flag prevents Metro from walking up the directory tree,
//    which breaks pnpm's symlinked virtual store resolution entirely.
//    Removing it here is the key fix for "Unable to resolve X" errors.

module.exports = config;
