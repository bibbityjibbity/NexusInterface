/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import { readFileSync } from 'fs';

import packageJson from '../package.json';

const appVersion = packageJson.version;
const buildDate = packageJson.buildDate;
const moduleSpecVersion = packageJson.moduleSpecVersion;
const supportedModuleSpecVersion = packageJson.supportedModuleSpecVersion;
const appId = packageJson.build.appId;

var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

let nexusPubKey = '';
try {
  nexusPubKey = readFileSync(
    path.resolve(process.cwd(), 'nexus_pub_key.pem')
  ).toString();
} catch (err) {
  console.error(err);
}

export default {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',

  output: {
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [path.join(process.cwd(), 'src/shared'), 'node_modules'],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'production'
      ),
      APP_VERSION: JSON.stringify(appVersion || ''),
      BUILD_DATE: JSON.stringify(buildDate || ''),
      MODULE_SPEC_VERSION: JSON.stringify(moduleSpecVersion || ''),
      SUPPORTED_MODULE_SPEC_VERSION: JSON.stringify(
        supportedModuleSpecVersion || ''
      ),
      APP_ID: JSON.stringify(appId || ''),
      NEXUS_EMBASSY_PUBLIC_KEY: JSON.stringify(nexusPubKey),
    }),

    new webpack.NamedModulesPlugin(),
    new FriendlyErrorsWebpackPlugin(),
  ],
};
