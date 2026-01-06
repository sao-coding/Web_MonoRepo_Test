import type { FlatConfig, RuleOverrides } from '../types'

import { GLOB_JSX, GLOB_TSX } from '../globs'
import { jsxA11yPlugin } from '../plugins'

export const jsx = (overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'eslint-config/jsx/setup',
    files: [GLOB_JSX, GLOB_TSX],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },
  {
    name: 'eslint-config/jsx/rules',
    files: [GLOB_JSX, GLOB_TSX],
    plugins: {
      'jsx-a11y': jsxA11yPlugin
    },
    rules: {
      ...jsxA11yPlugin.flatConfigs.strict.rules,

      'jsx-a11y/anchor-ambiguous-text': 'error',
      'jsx-a11y/lang': 'error',
      'jsx-a11y/no-aria-hidden-on-focusable': 'error',
      'jsx-a11y/prefer-tag-over-role': 'error',

      // 放寬部分過於嚴格的規則
      'jsx-a11y/heading-has-content': 'warn',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',

      ...overrides
    },
    settings: {
      'jsx-a11y': {
        components: {
          Button: 'button',
          Image: 'img',
          Input: 'input',
          Textarea: 'textarea',
          Link: 'a'
        }
      }
    }
  }
]
