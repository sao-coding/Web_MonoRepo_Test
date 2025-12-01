import { defineConfig } from 'cspell'

export default defineConfig({
  version: '0.2',
  ignorePaths: [
    'node_modules',
    'pnpm-lock.yaml',
    '.pnpm-store/',
    'package-lock.json',
    'vscode-extension',
    '.git/objects',
    '.vscode',
    '.vscode-insiders',
    'package.json',
  ],
  useGitignore: true,
})
