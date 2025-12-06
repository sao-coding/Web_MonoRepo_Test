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
  GLOB_SRC,
  GLOB_SVG,
  GLOB_TOML,
  GLOB_XML,
  GLOB_YAML
} from '../globs'
import { formatPlugin } from '../plugins'

/**
 * Plain text parser for non-JS/TS files
 * Treats file content as a single string, allowing Prettier to format it
 */
const parserPlain = {
  meta: {
    name: 'parser-plain'
  },
  parseForESLint: (code: string) => ({
    ast: {
      type: 'Program',
      loc: { start: 0, end: code.length },
      range: [0, code.length],
      body: [],
      comments: [],
      tokens: []
    },
    services: {},
    scopeManager: null,
    visitorKeys: {
      Program: []
    }
  })
}

const prettierBaseOptions = {
  arrowParens: 'always',
  singleQuote: true,
  jsxSingleQuote: true,
  tabWidth: 2,
  semi: false,
  trailingComma: 'none',
  endOfLine: 'lf',
  printWidth: 120
}

const xmlOptions = {
  xmlQuoteAttributes: 'double',
  xmlSelfClosingSpace: true,
  xmlSortAttributesByKey: false,
  xmlWhitespaceSensitivity: 'ignore'
}

export const prettier = (overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'eslint-config/prettier/setup',
    plugins: {
      format: formatPlugin
    }
  },
  {
    name: 'eslint-config/prettier/source',
    files: [GLOB_SRC],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'typescript'
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/css',
    files: [GLOB_CSS, GLOB_POSTCSS],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'css'
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/scss',
    files: [GLOB_SCSS],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'scss'
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/less',
    files: [GLOB_LESS],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'less'
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/html',
    files: [GLOB_HTML],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'html'
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/json',
    files: [GLOB_JSON],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'json'
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/json5',
    files: [GLOB_JSON5],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'json5',
          trailingComma: 'all'
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/jsonc',
    files: [GLOB_JSONC],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'json',
          trailingComma: 'all'
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/markdown',
    files: [GLOB_MARKDOWN],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'markdown',
          embeddedLanguageFormatting: 'off'
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/yaml',
    files: [GLOB_YAML],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'yaml'
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/toml',
    files: [GLOB_TOML],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'toml',
          plugins: ['prettier-plugin-toml']
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/xml',
    files: [GLOB_XML],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          ...xmlOptions,
          parser: 'xml',
          plugins: ['@prettier/plugin-xml']
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/svg',
    files: [GLOB_SVG],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          ...xmlOptions,
          parser: 'xml',
          plugins: ['@prettier/plugin-xml']
        }
      ],
      ...overrides
    }
  },
  {
    name: 'eslint-config/prettier/graphql',
    files: [GLOB_GRAPHQL],
    languageOptions: {
      parser: parserPlain
    },
    rules: {
      'format/prettier': [
        'error',
        {
          ...prettierBaseOptions,
          parser: 'graphql'
        }
      ],
      ...overrides
    }
  }
]
