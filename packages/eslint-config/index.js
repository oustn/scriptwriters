module.exports = {
  extends: ["turbo", "prettier", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "import/extensions": "off",
    "turbo/no-undeclared-env-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off"
  }
};
