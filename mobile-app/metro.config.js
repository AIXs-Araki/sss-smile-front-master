const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
// 'core' ディレクトリが存在する親のディレクトリ（workspace root）
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Metro の監視対象に workspace root を追加する
config.watchFolders = [workspaceRoot];

// モジュール解決パスを設定し、重複した依存関係を解決する
// これにより、core パッケージ内の import も親の node_modules から解決される
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './global.css' });