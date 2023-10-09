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
    "plugin:import/recommended",
    "plugin:import/typescript",
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
    "@typescript-eslint/ban-ts-comment": 0,
    "no-tabs": 1,
    "no-template-curly-in-string": 1,
    "@typescript-eslint/no-floating-promises": [1, {ignoreVoid: true}],

    //"import/no-cycle": 1,
    "import/no-mutable-exports": 1,
    "import/no-named-as-default-member": 0,
    "import/no-unused-modules": [1, {"unusedExports": true}]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "ignorePatterns": [
  ],
}
