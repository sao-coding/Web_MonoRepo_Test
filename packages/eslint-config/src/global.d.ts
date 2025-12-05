// This declaration file defines the missing/incompatible types for ESLint plugins.
// Note: only the types needed are defined.
//
// - eslint-plugin-jsx-a11y: missing types
// - @next/eslint-plugin-next: incompatible types
// - @eslint-react/eslint-plugin: incompatible types
// - eslint-plugin-better-tailwindcss: incompatible types
// - @typescript-eslint/eslint-plugin: incompatible types
// - eslint-plugin-react-hooks: incompatible types

declare module 'eslint-plugin-jsx-a11y' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: ESLint.Plugin & {
    configs: {
      recommended: Linter.Config
      strict: Linter.Config
    }
    flatConfigs: {
      recommended: Linter.Config
      strict: Linter.Config
    }
  }

  export default plugin
}

declare module '@next/eslint-plugin-next' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: ESLint.Plugin & {
    configs: {
      recommended: Linter.Config
      'core-web-vitals': Linter.Config
    }
  }

  export default plugin
}

declare module '@eslint-react/eslint-plugin' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: ESLint.Plugin & {
    configs: {
      all: Linter.Config
    }
  }

  export default plugin
}

declare module 'eslint-plugin-better-tailwindcss' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: ESLint.Plugin & {
    configs: {
      'recommended-error': Linter.Config
    }
  }

  export default plugin
}

declare module '@typescript-eslint/eslint-plugin' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: ESLint.Plugin & {
    configs: {
      'eslint-recommended': {
        overrides: [
          {
            files: string[]
            rules: Linter.RulesRecord
          }
        ]
      }
      'strict-type-checked': Linter.Config
      'stylistic-type-checked': Linter.Config
    }
  }

  export default plugin
}

declare module 'eslint-plugin-react-hooks' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: ESLint.Plugin & {
    configs: {
      recommended: Linter.Config
      'recommended-latest': Linter.Config
    }
  }

  export default plugin
}
