// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Reglas base JS/TS/React recomendadas:
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      // Personalización adicional:
      "react/react-in-jsx-scope": "off",       // No necesario en React 17+
      "react/prop-types": "off",               // Usas TypeScript para tipos
      "no-unused-vars": "off",                 // Usar la de TS
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
]);
