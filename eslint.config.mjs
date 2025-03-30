import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    // "prettier" removes all formatting rules from the config
    // these are not needed as we use Biome for formatting
    extends: [
      "next/core-web-vitals",
      "next/typescript",
      "prettier",
      "plugin:@typescript-eslint/strict-type-checked",
    ],
    plugins: ["path-alias", "react-compiler"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      projectService: true,
      tsconfigRootDir: __dirname,
    },

    rules: {
      "path-alias/no-relative": [
        "error",
        {
          paths: {
            // It's recommended to resolve path alias directories as
            // relative paths will be resolved relative to cwd. This
            // may cause unexpected behavior in monorepo setups
            "@": resolve(import.meta.dirname, "./src"),
          },
        },
      ],
      "react-compiler/react-compiler": "error",
    },
  }),
];

export default eslintConfig;
