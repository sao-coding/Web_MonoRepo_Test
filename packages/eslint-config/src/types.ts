import type { Linter } from 'eslint'

/**
 * ESLint configuration options.
 */
export type ConfigOptions = {
  /**
   * The absolute or relative path to the root directory that contains
   * the `tsconfig.json`. Used to resolve TypeScript configuration.
   */
  tsconfigRootDir?: string
  /**
   * Enable additional ESLint rules optimized for React projects.
   * @default auto-detected based on whether 'react' is installed
   */
  react?: boolean
  /**
   * Enable additional ESLint rules optimized for Next.js projects.
   * This option also automatically enables React rules.
   * @default auto-detected based on whether 'next' is installed
   */
  nextjs?: boolean
  /**
   * Path to the main entry point of your Tailwind CSS setup.
   * Enabling this also turns on ESLint rules related to Tailwind CSS.
   */
  tailwindEntryPoint?: string
  /**
   * A list of file paths or glob patterns that ESLint should ignore.
   */
  ignores?: string[]
  /**
   * Override specific ESLint rules for each plugin.
   */
  overrides?: Overrides
}

export type RuleOverrides = Linter.Config['rules']

export type Overrides = {
  javascript?: RuleOverrides
  typescript?: RuleOverrides
  react?: RuleOverrides
  jsx?: RuleOverrides
  nextjs?: RuleOverrides
  tailwindcss?: RuleOverrides
  importSort?: RuleOverrides
  imports?: RuleOverrides
  prettier?: RuleOverrides
}

export type FlatConfig = Linter.Config
