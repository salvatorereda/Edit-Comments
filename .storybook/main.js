const path = require('path');
const { NormalModuleReplacementPlugin } = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');

// Source tree paths.
//
// This template targets the Vue 2.7 repo, `sketchup_web`. The whole toolchain
// below (vue-template-compiler, vue-loader 15, Storybook 6.5 on webpack) is
// Vue 2 only. Pointing SKETCHUP_WEB_PATH at `sketchup_web_v2` will NOT work —
// that repo is Vue 3.5 on Vite, and its SFCs will fail to compile here in
// confusing ways. A v3 mock needs its own template, not this one.
const SKETCHUP_WEB_ROOT = process.env.SKETCHUP_WEB_PATH
  ? path.resolve(process.env.SKETCHUP_WEB_PATH)
  : path.resolve(__dirname, '../../../../sketchup_web');
const SOURCE_FRONTEND = path.join(SKETCHUP_WEB_ROOT, 'frontend');
const SOURCE_SRC = path.join(SOURCE_FRONTEND, 'src');
const SOURCE_RESOURCES = path.join(SOURCE_FRONTEND, 'resources');
const SOURCE_SASS = path.join(SOURCE_FRONTEND, 'public/sass');
const SOURCE_MOCK = path.join(SOURCE_SRC, 'mock');

module.exports = {
  stories: ['../stories/**/*.stories.@(mdx|js|ts)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/vue',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  webpackFinal: (config) => {
    // Replace default rules with our custom set
    config.module.rules = [
      // MDX stories
      {
        test: /stories\.mdx$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['@babel/plugin-transform-react-jsx'],
            },
          },
          {
            loader: '@storybook/mdx1-csf/loader.js',
          },
        ],
      },
      // Vue single-file components
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      // TypeScript
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: true,
            },
          },
        ],
      },
      // SCSS with CSS Modules (matches source webpack config)
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false,
              modules: {
                localIdentName: '[path][name]__[local]',
              },
            },
          },
          'sass-loader',
        ],
      },
      // SVG sprite loader
      {
        test: /\.svg$/i,
        loader: 'svg-sprite-loader',
      },
      // Images
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ];

    // Resolve aliases pointing to source tree
    config.resolve.alias = {
      // Mock overrides (must come before source aliases)
      'builtconstants': path.join(SOURCE_MOCK, '_empty_constants'),
      '@/models/Preference': path.resolve(__dirname, 'mocks/preference.ts'),
      '@/store/RootStore': path.resolve(__dirname, 'mockStore.js'),
      // Private package, not installed. GlobalConstants.ts (imported by
      // RightSidebarPanel and most sidebar panels) needs BinaryType from it.
      '@sketchup/sketchup-shared-ts/lib/Whp/Enums': path.resolve(
        __dirname,
        'mocks/sketchupSharedTsEnums.ts'
      ),
      // CommentTextArea and CommentContent import these. The real ones pull in axios, Sentry and
      // DialogPrompts (most of the app); see the notes in each stand-in.
      '@/App': path.resolve(__dirname, 'mocks/app.ts'),
      '@/utils/HttpUtils': path.resolve(__dirname, 'mocks/httpUtils.ts'),
      '@/views/commentsPanel/SnapshotThumbnail.vue': path.resolve(
        __dirname,
        'mocks/SnapshotThumbnail.vue'
      ),
      ...(config.resolve.alias ?? {}),
      // Source tree aliases
      '@': SOURCE_SRC,
      '@resources': SOURCE_RESOURCES,
      '@sass': SOURCE_SASS,
      '@mock': SOURCE_MOCK,
    };

    // Source files live outside this project, so Node's upward node_modules
    // lookup from the source tree never reaches ours, and sketchup_web has no
    // node_modules of its own installed. Resolve packages the source imports
    // (e.g. @vueuse/core, used in ~17 places) against this project's.
    config.resolve.modules = [
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
    ];

    config.resolve.extensions = ['.js', '.ts', '.vue'];
    config.resolve.fallback = { https: false, crypto: false };

    // Remove any existing VueLoaderPlugin added by @storybook/vue to avoid
    // double template compilation, then add our own single instance.
    const filteredPlugins = config.plugins.filter(
      (p) => p.constructor.name !== 'VueLoaderPlugin'
    );

    config.plugins = [
      new NormalModuleReplacementPlugin(/l10n$/, path.resolve(__dirname, 'mocks/l10n.ts')),
      new VueLoaderPlugin(),
      ...filteredPlugins,
    ];

    return config;
  },
};
