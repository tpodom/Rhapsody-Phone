module.exports = {
  root: true,
  env: {
    node: true,
    "jest/globals": true,
    es6: true,
  },
  plugins: ["jest"],
  extends: ["eslint:recommended", "google", "prettier"],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    quotes: ["error", "double"],
  },
};
