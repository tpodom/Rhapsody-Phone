module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "google", "prettier"],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    quotes: ["error", "double"],
  },
};
