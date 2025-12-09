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
import { formatPlugin } from '../plugins'

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

export const formatters = (overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: '@msi/prettier/setup',
    plugins: {
      format: formatPlugin
    }
  },
  {
    name: '@msi/prettier/css',
    files: [GLOB_CSS, GLOB_POSTCSS],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/scss',
    files: [GLOB_SCSS],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/less',
    files: [GLOB_LESS],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/html',
    files: [GLOB_HTML],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/json',
    files: [GLOB_JSON],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/json5',
    files: [GLOB_JSON5],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/jsonc',
    files: [GLOB_JSONC],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/markdown',
    files: [GLOB_MARKDOWN],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/yaml',
    files: [GLOB_YAML],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/toml',
    files: [GLOB_TOML],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/xml',
    files: [GLOB_XML],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/svg',
    files: [GLOB_SVG],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
    name: '@msi/prettier/graphql',
    files: [GLOB_GRAPHQL],
    languageOptions: {
      parser: formatPlugin.parserPlain
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
