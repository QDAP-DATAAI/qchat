const { FlatCompat } = require("@eslint/eslintrc")
const js = require("@eslint/js")
const typescriptEslint = require("@typescript-eslint/eslint-plugin")
const tsParser = require("@typescript-eslint/parser")
const importPlugin = require("eslint-plugin-import")
const noRelativeImportPaths = require("eslint-plugin-no-relative-import-paths")

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

module.exports = [
  {
    ignores: ["**/.next", "**/node_modules"],
  },
  ...compat.extends(
    "next",
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "no-relative-import-paths": noRelativeImportPaths,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "linebreak-style": ["error", "unix"],
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: false,
        },
      ],
      semi: ["error", "never"],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-magic-numbers": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-parameter-properties": "off",
      "@typescript-eslint/no-floating-promises": ["error"],
      "@typescript-eslint/array-type": ["off", { default: "generic" }],
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      "require-await": "warn",
      "@typescript-eslint/promise-function-async": [
        "warn",
        {
          allowedPromiseNames: ["Thenable"],
          checkArrowFunctions: true,
          checkFunctionDeclarations: true,
          checkFunctionExpressions: true,
          checkMethodDeclarations: true,
        },
      ],
      "no-console": "error",
      "no-relative-import-paths/no-relative-import-paths": [
        "warn",
        {
          allowSameFolder: true,
          prefix: "@",
        },
      ],
      "import/order": [
        "warn",
        {
          pathGroups: [
            {
              pattern: "{@/features,@/components,@/ui,@/services,@/lib}/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/app-global",
              group: "internal",
              position: "before",
            },
          ],
          groups: ["builtin", "external", "internal", ["sibling", "parent"], "index", "unknown"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "no-else-return": [
        "warn",
        {
          allowElseIf: false,
        },
      ],
      "@next/next/no-duplicate-head": "off", // Disable temporarily if causing issues
      "@next/next/no-page-custom-font": "off", // Disable temporarily if causing issues
    },
  },
]
