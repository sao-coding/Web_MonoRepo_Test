import type { FlatConfig, RuleOverrides } from '../types'

import { GLOB_SRC } from '../globs'

/**
 * ESLint stylistic rules for JavaScript/TypeScript
 * These rules handle code formatting without Prettier
 *
 * Based on Anthony Fu's design philosophy:
 * - Use ESLint native rules for JS/TS formatting
 * - Better diff consistency
 * - Better developer experience
 * - No Prettier conflicts
 */

export const stylistic = (overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'eslint-config/stylistic',
    files: [GLOB_SRC],
    rules: {
      // Indentation & Spacing
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          MemberExpression: 1,
          FunctionDeclaration: { parameters: 1, body: 1 },
          FunctionExpression: { parameters: 1, body: 1 },
          CallExpression: { arguments: 1 },
          ArrayExpression: 1,
          ObjectExpression: 1,
          ImportDeclaration: 1,
          flatTernaryExpressions: false,
          ignoreComments: false,
          ignoredNodes: [
            'TemplateLiteral *',
            'JSXElement',
            'JSXElement > *',
            'JSXAttribute',
            'JSXIdentifier',
            'JSXNamespacedName',
            'JSXMemberExpression',
            'JSXSpreadAttribute',
            'JSXExpressionContainer',
            'JSXOpeningElement',
            'JSXClosingElement',
            'JSXFragment',
            'JSXOpeningFragment',
            'JSXClosingFragment',
            'JSXText',
            'JSXEmptyExpression',
            'JSXSpreadChild',
            'TSTypeParameterInstantiation',
            'FunctionExpression > .params[decorators.length > 0]',
            'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
            'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key'
          ],
          offsetTernaryExpressions: true
        }
      ],
      'no-tabs': 'error',
      'no-mixed-spaces-and-tabs': 'error',

      // Semicolons
      semi: ['error', 'never'],
      'no-extra-semi': 'error',

      // Quotes
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: false }
      ],
      'jsx-quotes': ['error', 'prefer-single'],

      // Commas
      'comma-dangle': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'comma-style': ['error', 'last'],

      // Object & Array
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-newline': ['error', { multiline: true, consistent: true }],
      'object-property-newline': [
        'error',
        { allowMultiplePropertiesPerLine: true }
      ],
      'array-bracket-newline': ['error', 'consistent'],
      'array-element-newline': ['error', 'consistent'],

      // Function
      'function-call-argument-newline': ['error', 'consistent'],
      'function-paren-newline': ['error', 'consistent'],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always'
        }
      ],

      // Operators
      'operator-linebreak': ['error', 'before'],
      'space-infix-ops': 'error',
      'space-unary-ops': ['error', { words: true, nonwords: false }],

      // Keywords
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-before-blocks': ['error', 'always'],

      // Arrow Functions
      'arrow-spacing': ['error', { before: true, after: true }],
      'arrow-parens': ['error', 'always'],

      // Lines
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'linebreak-style': ['error', 'unix'],

      // Others
      'dot-location': ['error', 'property'],
      'max-len': [
        'warn',
        {
          code: 150,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: true
        }
      ],

      // Overrides
      ...overrides
    }
  }
]
