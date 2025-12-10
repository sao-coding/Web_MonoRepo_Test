// import msi from '@msi/eslint-config'

// export default msi(
//   {
//     project: './tsconfig.json',
//     tsconfigRootDir: import.meta.dirname,
//     turbo: true
//   },
//   {
//     ignores: ['apps/**', 'packages/**']
//   }
// )

import { defineConfig } from '@msi/eslint-config'

export default defineConfig({
  tailwindEntryPoint: './src/styles/globals.css'
})
