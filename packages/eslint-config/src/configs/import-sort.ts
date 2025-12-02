import type { FlatConfig, RuleOverrides } from "../types";

import { importSortPlugin } from "../plugins";

export const importSort = (overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: "eslint-config/import-sort/rules",
    plugins: {
      "simple-import-sort": importSortPlugin,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Type imports
            [
              String.raw`^.*\u0000$`,
              String.raw`^node:.*\u0000$`,
              String.raw`^@?\w.*\u0000$`,
              String.raw`^\.\..*\u0000$`,
              String.raw`^\..*\u0000$`,
            ],

            // Side effect imports (e.g., `import 'some-module'`)
            [String.raw`^\u0000`],

            // Node.js builtins prefixed with `node:`
            ["^node:"],

            // Things that start with a letter (or digit or underscore), or `@` followed by a letter
            [String.raw`^@?\w`],

            // Absolute imports (e.g., `import something from 'src/utils'`)
            ["^[^.]"],

            // Parent directory relative imports (e.g., `import something from '../utils'`)
            [String.raw`^\.\.`],

            // Current directory relative imports (e.g., `import something from './utils'`)
            [String.raw`^\.`],
          ],
        },
      ],
      "simple-import-sort/exports": "error",

      ...overrides,
    },
  },
];
