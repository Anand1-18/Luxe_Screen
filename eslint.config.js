import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export default defineConfig([
  globalIgnores(["**/node_modules/**", "**/dist/**", "server/prisma/migrations/**"]),
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Allow omitting properties via rest destructuring: const { a, ...rest } = obj
      "no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_", varsIgnorePattern: "^[A-Z_]" },
      ],
    },
  },
  {
    files: ["client/**/*.{js,jsx}"],
    languageOptions: { globals: globals.browser },
    extends: [reactHooks.configs.flat["recommended-latest"] ?? reactHooks.configs.flat.recommended],
  },
  {
    files: ["server/**/*.js", "shared/**/*.js", "*.config.js", "**/*.config.js"],
    languageOptions: { globals: globals.node },
  },
]);
