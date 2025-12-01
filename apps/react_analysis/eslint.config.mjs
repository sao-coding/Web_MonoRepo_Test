import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  nextjs: true,
  typescript: true,
  stylistic: {
    overrides: {
      'antfu/top-level-function': 'off',
    },
  },
  rules: {
    'antfu/top-level-function': 'off',
    'node/prefer-global/process': 'off',
  },
  extends: ['next/core-web-vitals', 'next/typescript'],
})
