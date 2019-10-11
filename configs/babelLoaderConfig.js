const stage0Preset = [
  // Stage 0
  // '@babel/plugin-proposal-function-bind',
  // Stage 1
  // '@babel/plugin-proposal-export-default-from',
  // '@babel/plugin-proposal-logical-assignment-operators',
  // ['@babel/plugin-proposal-optional-chaining', { loose: false }],
  // ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
  // ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
  // '@babel/plugin-proposal-do-expressions',
  // Stage 2
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  // '@babel/plugin-proposal-function-sent',
  // '@babel/plugin-proposal-export-namespace-from',
  // '@babel/plugin-proposal-numeric-separator',
  // '@babel/plugin-proposal-throw-expressions',
  // Stage 3
  // '@babel/plugin-syntax-dynamic-import',
  // '@babel/plugin-syntax-import-meta',
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  // '@babel/plugin-proposal-json-strings',
];

const reactOptimizePreset = [
  '@babel/plugin-transform-react-constant-elements',
  // Leaves out transform-react-inline-elements plugin due to incompatibility with Emotion
  'babel-plugin-transform-react-remove-prop-types',
  'babel-plugin-transform-react-pure-class-to-function',
];

const presetEnv = [
  '@babel/preset-env',
  {
    targets: { electron: require('electron/package.json').version },
    useBuiltIns: 'usage',
    corejs: require('core-js/package.json').version,
  },
];

const devPlugins = [];

const prodPlugins = ['babel-plugin-dev-expression'];
const development = process.env.NODE_ENV === 'development';

const rendererBabelConfig = hot => {
  const config = {
    plugins: [
      ['emotion', { sourceMap: development }],
      ...stage0Preset,
      ...(development ? devPlugins : [...prodPlugins, ...reactOptimizePreset]),
    ],
    presets: [presetEnv, ['@babel/preset-react', { development }]],
  };

  if (hot) {
    config.plugins.push('react-hot-loader/babel');
  }
  return config;
};

const mainBabelConfig = () => ({
  plugins: [...stage0Preset, ...(development ? devPlugins : prodPlugins)],
  presets: [presetEnv],
});

const loaderConfig = options => ({
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      ...options,
    },
  },
});

export const babelLoaderMain = () => loaderConfig(mainBabelConfig());

export const babelLoaderRenderer = hot =>
  loaderConfig(rendererBabelConfig(hot));
