const createConfig = ({ modules }) => {
  const plugins = [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
    '@babel/plugin-proposal-nullish-coalescing-operator',
    [
      '@babel/plugin-transform-runtime',
      {
        version: '7.18.6'
      }
    ]
  ].concat(modules ? ['babel-plugin-add-module-exports'] : []);

  return {
    assumptions: {
      iterableIsArray: true
    },
    comments: true,
    shouldPrintComment: (contents) => !/^:{1,2}/.test(contents.trim()),
    presets: [
      [
        '@babel/preset-env',
        {
          loose: true,
          modules,
          exclude: ['transform-typeof-symbol'],
          targets: {
            browsers: [
              'chrome 95',
              'edge 95',
              'firefox 93',
              'safari 15.1',
              'ios_saf 15.1'
            ]
          }
        }
      ],
      '@babel/preset-react'
    ],
    plugins: plugins
  };
};

module.exports = function (api) {
  if (api) {
    api.cache(true);
  }

  return process.env.BABEL_ENV === 'commonjs' || process.env.NODE_ENV === 'test'
    ? createConfig({ modules: 'commonjs' })
    : createConfig({ modules: false });
};
