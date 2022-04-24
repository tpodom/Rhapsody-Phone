module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "google"],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    quotes: ["error", "double"],
  },
};
