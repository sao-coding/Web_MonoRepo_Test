import { defineConfig } from './src'

export default defineConfig({
  tsconfigRootDir: import.meta.dirname,
  tailwindEntryPoint: './src/styles/tailwind.css',
})
