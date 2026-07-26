import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships native flat configs. Routing them through
// @eslint/eslintrc's FlatCompat made ESLint try to JSON-serialize plugin objects that
// reference one another, so every run died with "Converting circular structure to JSON"
// before a single file was read. Spread the flat configs directly instead.
const eslintConfig = [
  // Global ignores must be an object with no other keys; alongside `rules` they would
  // only apply to that one config block.
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/*.backup",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
