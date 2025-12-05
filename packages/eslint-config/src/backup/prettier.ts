import type { FlatConfig, RuleOverrides } from '../types'

import {
  GLOB_CSS,
  GLOB_GRAPHQL,
  GLOB_HTML,
  GLOB_JSON,
  GLOB_JSON5,
  GLOB_JSONC,
  GLOB_LESS,
  GLOB_MARKDOWN,
  GLOB_POSTCSS,
  GLOB_SCSS,
  GLOB_SVG,
  GLOB_TOML,
  GLOB_XML,
  GLOB_YAML
} from '../globs'
import { prettierPlugin, prettierPluginRecommended } from '../plugins'

const prettierBaseOptions = {
  arrowParens: 'always',
  singleQuote: true,
  jsxSingleQuote: true,
  tabWidth: 2,
  semi: false,
  trailingComma: 'none',
  endOfLine: 'lf',
  printWidth: 120
} as const

export const prettier = (overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'eslint-config/prettier/rules',
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...prettierPluginRecommended.rules,
      'prettier/prettier': ['error', prettierBaseOptions],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/css',
    files: [GLOB_CSS, GLOB_POSTCSS],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'css'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/scss',
    files: [GLOB_SCSS],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'scss'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/less',
    files: [GLOB_LESS],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'less'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/html',
    files: [GLOB_HTML],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'html'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/json',
    files: [GLOB_JSON],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'json'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/json5',
    files: [GLOB_JSON5],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'json5',
          trailingComma: 'all'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/jsonc',
    files: [GLOB_JSONC],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'json',
          trailingComma: 'all'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/markdown',
    files: [GLOB_MARKDOWN],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'markdown',
          embeddedLanguageFormatting: 'off'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/yaml',
    files: [GLOB_YAML],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'yaml'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/toml',
    files: [GLOB_TOML],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'toml'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/xml',
    files: [GLOB_XML],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'xml',
          xmlQuoteAttributes: 'double',
          xmlSelfClosingSpace: true,
          xmlSortAttributesByKey: false,
          xmlWhitespaceSensitivity: 'ignore'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/svg',
    files: [GLOB_SVG],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'xml',
          xmlQuoteAttributes: 'double',
          xmlSelfClosingSpace: true,
          xmlSortAttributesByKey: false,
          xmlWhitespaceSensitivity: 'ignore'
        }
      ]
    }
  },
  {
    name: 'eslint-config/prettier/graphql',
    files: [GLOB_GRAPHQL],
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'graphql'
        }
      ]
    }
  }
]
