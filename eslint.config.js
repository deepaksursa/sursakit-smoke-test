import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  // 1. BASIC JAVASCRIPT RULES
  js.configs.recommended,

  // 2. TYPESCRIPT CONFIGURATION
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        setInterval: "readonly",
        setTimeout: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        Date: "readonly",
        Math: "readonly",
        JSON: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        FormData: "readonly",
        Blob: "readonly",
        File: "readonly",
        FileList: "readonly",
        FileReader: "readonly",
        FileReaderSync: "readonly",
        ArrayBuffer: "readonly",
        Uint8Array: "readonly",
        Uint16Array: "readonly",
        Uint32Array: "readonly",
        Int8Array: "readonly",
        Int16Array: "readonly",
        Int32Array: "readonly",
        Float32Array: "readonly",
        Float64Array: "readonly",
        BigInt64Array: "readonly",
        BigUint64Array: "readonly",
        Symbol: "readonly",
        Promise: "readonly",
        Proxy: "readonly",
        Reflect: "readonly",
        Map: "readonly",
        Set: "readonly",
        WeakMap: "readonly",
        WeakSet: "readonly",
        Error: "readonly",
        EvalError: "readonly",
        RangeError: "readonly",
        ReferenceError: "readonly",
        SyntaxError: "readonly",
        TypeError: "readonly",
        URIError: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // General JavaScript/TypeScript rules
      "no-console": "off", // Allow console.log (useful for test debugging)
      "prefer-const": "error", // Use const when variable is not reassigned
      "no-var": "error", // No var, use let/const
    },
  },

  // 3. IGNORE PATTERNS
  {
    ignores: [
      "node_modules/",
      "test-results/",
      "playwright-report/",
      "*.js.map",
    ],
  },
];
