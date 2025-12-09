#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distPath = path.join(__dirname, '..', 'dist', 'index.mjs')

function fail(msg, err) {
  console.error(msg)
  if (err) console.error(err)
  process.exit(1)
}

if (!fs.existsSync(distPath)) {
  console.error('Cannot find built module at', distPath)
  console.error('Please run: pnpm --filter @msi/eslint-config run build')
  process.exit(2)
}

(async () => {
  try {
    const mod = await import(pathToFileURL(distPath).href)

    const defineConfig = mod.defineConfig ?? mod.default?.defineConfig
    if (!defineConfig || typeof defineConfig !== 'function') {
      fail('defineConfig export not found or not a function. Exports: ' + Object.keys(mod).join(', '))
    }

    // Try a few option shapes to ensure no runtime errors
    const tests = [
      { tsconfigRootDir: path.join(__dirname, '..') },
      { nextjs: true, react: true },
      { tailwindEntryPoint: './src/index.css' }
    ]

    for (const opts of tests) {
      let result
      try {
        result = defineConfig(opts)
      } catch (err) {
        fail('defineConfig threw with options: ' + JSON.stringify(opts), err)
      }

      if (!Array.isArray(result)) {
        fail('defineConfig did not return an array for options: ' + JSON.stringify(opts))
      }

      console.log('OK:', 'options', JSON.stringify(opts), '=> rules count:', result.length)
    }

    console.log('\nSmoke check passed: `defineConfig` imported and executed successfully.')
    process.exit(0)
  } catch (err) {
    fail('Unexpected error while importing or executing module', err)
  }
})()
