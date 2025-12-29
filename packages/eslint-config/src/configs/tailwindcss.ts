import type { FlatConfig, RuleOverrides } from '../types'

import { tailwindcssPlugin } from '../plugins'

export const tailwindcss = (entryPoint: string, overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'eslint-config/tailwindcss/rules',
    plugins: {
      'better-tailwindcss': tailwindcssPlugin
    },
    rules: {
      'better-tailwindcss/enforce-consistent-class-order': 'warn',
      'better-tailwindcss/enforce-consistent-important-position': 'error',
      'better-tailwindcss/enforce-consistent-variable-syntax': 'error',
      'better-tailwindcss/enforce-shorthand-classes': 'warn',
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-deprecated-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/no-unnecessary-whitespace': 'error',
      // 關閉 no-unregistered-classes 因為它需要正確配置入口點才能運作
      'better-tailwindcss/no-unregistered-classes': 'off',

      ...overrides
    },
    settings: {
      'better-tailwindcss': {
        entryPoint,
        callees: [
          [
            'cva',
            [
              { match: 'strings' },
              {
                match: 'objectValues',
                pathPattern: '^base$'
              }
            ]
          ]
        ]
      }
    }
  }
]
