// @ts-check

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintConfigPrettier from "eslint-config-prettier/flat";

import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  /*
   * =========================================================
   * ARQUIVOS IGNORADOS
   * =========================================================
   */

  globalIgnores(["node_modules/**", "dist/**", "build/**", "coverage/**", ".vite/**"]),

  /*
   * =========================================================
   * CONFIGURAÇÕES GERAIS
   * =========================================================
   */

  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },

  /*
   * =========================================================
   * JAVASCRIPT
   * =========================================================
   */

  {
    files: ["**/*.{js,mjs,cjs}"],

    extends: [js.configs.recommended],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],

      "no-debugger": "error",

      "no-var": "error",

      "prefer-const": "error",

      eqeqeq: ["error", "always"],

      curly: ["error", "all"],

      "object-shorthand": ["error", "always"],
    },
  },

  /*
   * =========================================================
   * TYPESCRIPT + REACT
   * =========================================================
   */

  {
    files: ["**/*.{ts,tsx}"],

    extends: [
      js.configs.recommended,

      tseslint.configs.recommendedTypeChecked,

      tseslint.configs.stylisticTypeChecked,

      reactHooks.configs.flat.recommended,

      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: "latest",

      sourceType: "module",

      globals: {
        ...globals.browser,
      },

      parserOptions: {
        projectService: true,

        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      /*
       * =====================================================
       * TYPESCRIPT
       * =====================================================
       */

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      "@typescript-eslint/no-floating-promises": "error",

      "@typescript-eslint/await-thenable": "error",

      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],

      "@typescript-eslint/prefer-optional-chain": "warn",

      "@typescript-eslint/prefer-nullish-coalescing": "warn",

      "@typescript-eslint/no-unnecessary-condition": "warn",

      "@typescript-eslint/no-unnecessary-type-assertion": "warn",

      /*
       * =====================================================
       * JAVASCRIPT
       * =====================================================
       */

      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],

      "no-debugger": "error",

      "no-var": "error",

      "prefer-const": "error",

      eqeqeq: ["error", "always"],

      curly: ["error", "all"],

      "object-shorthand": ["error", "always"],

      /*
       * =====================================================
       * REACT
       * =====================================================
       */

      "react-hooks/rules-of-hooks": "error",

      "react-hooks/exhaustive-deps": "warn",

      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
    },
  },

  /*
   * =========================================================
   * ARQUIVOS DE TESTE
   * =========================================================
   */

  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/tests/**/*.{ts,tsx}"],

    rules: {
      "no-console": "off",

      "@typescript-eslint/no-explicit-any": "off",

      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  /*
   * =========================================================
   * PRETTIER
   *
   * Deve ficar no final para remover regras do ESLint
   * que entram em conflito com o Prettier.
   * =========================================================
   */

  eslintConfigPrettier,
]);
