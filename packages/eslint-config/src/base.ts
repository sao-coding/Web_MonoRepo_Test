import type { ConfigOptions, FlatConfig } from './types'

import { isPackageExists } from 'local-pkg'

import { formatters } from './configs/formatters'
import { gitignore } from './configs/gitignore'
import { ignores } from './configs/ignores'
import { importSort } from './configs/import-sort'
import { imports } from './configs/imports'
import { javascript } from './configs/javascript'
import { jsx } from './configs/jsx'
import { nextjs } from './configs/nextjs'
import { react } from './configs/react'
import { stylistic } from './configs/stylistic'
import { tailwindcss } from './configs/tailwindcss'
import { typescript } from './configs/typescript'

const isReactInstalled = isPackageExists('react')
const isNextjsInstalled = isPackageExists('next')

export const defineConfig = (
  options: ConfigOptions,
  ...userConfigs: FlatConfig[]
): FlatConfig[] => {
  const { overrides = {} } = options

  const configs = [
    ...gitignore(),
    ...ignores(options.ignores ?? []),
    ...javascript(overrides.javascript),
    ...typescript(options.tsconfigRootDir, overrides.typescript),
    ...importSort(overrides.importSort),
    ...imports(overrides.imports),
    ...jsx(overrides.jsx)
  ]

  const isNextjsEnabled = options.nextjs ?? isNextjsInstalled
  const isReactEnabled = (options.react ?? isReactInstalled) || isNextjsEnabled

  if (isReactEnabled) {
    configs.push(...react(overrides.react))
  }

  if (isNextjsEnabled) {
    configs.push(...nextjs(overrides.nextjs))
  }

  if (options.tailwindEntryPoint) {
    configs.push(
      ...tailwindcss(options.tailwindEntryPoint, overrides.tailwindcss)
    )
  }

  // Add user configs before formatting
  configs.push(...userConfigs)

  // Stylistic rules for JS/TS (ESLint native formatting)
  configs.push(...stylistic(overrides.stylistic))

  // Formatters for other file types (using Prettier via eslint-plugin-format)
  // Must be added as the last item
  configs.push(...formatters(overrides.formatters))

  return configs
}
