module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  overrides: [
    {
      files: '*.css',
      options: {
        semi: true,
        singleQuote: false,
      },
    },
  ],
}
