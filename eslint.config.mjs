import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
    globalIgnores(["dist/**/*", "node_modules/**/*", "**/*.js", "**/*.cjs"]),
    js.configs.recommended,
    {
        files: ["**/*.ts"],
        ignores: ["**/*.test.ts", "**/__tests__/**/*.ts"],
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },

            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: __dirname,
            },
        },

        rules: {
            "no-unused-vars": "off", // Use @typescript-eslint version instead
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],

            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-floating-promises": "error",
            "prefer-const": "error",
            "no-var": "error",
            "object-shorthand": "error",
            "prefer-arrow-callback": "error",
        },
    },
    {
        files: ["**/*.test.ts", "**/__tests__/**/*.ts"],
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },

            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: "module",
        },

        rules: {
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
            }],
            "prefer-const": "error",
            "no-var": "error",
            "object-shorthand": "error",
            "prefer-arrow-callback": "error",
        },
    },
]);
