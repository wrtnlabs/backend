module.exports = {
  root: true,
  plugins: ["@typescript-eslint"],
  extends: ["plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "test/tsconfig.json"],
  },
  overrides: [
    {
      files: ["src/**/*.ts", "test/**/*.ts"],
      rules: {
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
  ignorePatterns: ["src/api/functional/**/*.ts"],
};
