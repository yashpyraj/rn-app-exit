module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['lib/', 'coverage/', 'node_modules/'],
  overrides: [
    {
      files: ['**/__tests__/**/*.{js,ts,tsx}'],
      env: {jest: true},
    },
  ],
};
