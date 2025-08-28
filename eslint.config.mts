import node from "eslint-plugin-n";
import prettier from "eslint-plugin-prettier/recommended";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import unusedImports from "eslint-plugin-unused-imports";
import unicornPlugin from "eslint-plugin-unicorn";

export default tseslint.config(
  globalIgnores(["**/dist"]),

  eslint.configs.recommended,
  tseslint.configs.recommended,
  node.configs["flat/recommended"],

  prettier,
  {
    rules: {
      "prettier/prettier": ["error", {}, { usePrettierrc: false }],
    },
  },

  {
    ...unicornPlugin.configs.recommended,
    rules: {
      "unicorn/prevent-abbreviations": "off",
      "unicorn/prefer-import-meta-properties": "error",
    },
  },

  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*/**", "../**"],
              message: "Relative imports are not allowed.",
            },
          ],
        },
      ],
    },
  },
);
