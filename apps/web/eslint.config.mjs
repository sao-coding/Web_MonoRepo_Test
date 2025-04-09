import msi from '@msi/eslint-config'

export default msi({
  project: './tsconfig.json',
  tsconfigRootDir: import.meta.dirname,
  react: true,
  next: true,
  turbo: true
})
