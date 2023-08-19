module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "overrides": [
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "react",
    "@typescript-eslint",
    "react",
    "react-hooks",
  ],
  "rules": {
    "prefer-const": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": [1, {
      "varsIgnorePattern": "^_",
      "argsIgnorePattern": "^_",
    }],
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-namespace": 0,
    "no-constant-condition": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
  },
  "ignorePatterns": [
  ],
}
