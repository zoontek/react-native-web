const createConfig = ({ modules }) => {
  return {
    comments: true,
    shouldPrintComment: (contents) => !/^:{1,2}/.test(contents.trim()),
    presets: [
      [
        '@babel/preset-env',
        {
          loose: true,
          modules,
          targets: {
            browsers: ['chrome 95', 'firefox 93', 'safari 15.1']
          }
        }
      ],
      '@babel/preset-react',
      ['@babel/preset-typescript', { allowDeclareFields: true }]
    ],
    plugins: ['@babel/plugin-transform-runtime'].concat(
      modules ? ['babel-plugin-add-module-exports'] : []
    )
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
