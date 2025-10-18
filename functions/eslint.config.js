export default [
  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
      },
    },

    rules: {
      "no-unused-vars": "warn",
      "object-curly-spacing": ["error", "always"],
    },
  },
];

