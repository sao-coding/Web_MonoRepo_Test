import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  // 在輸出檔案頂部加入 "use client" 指令
  banner: {
    js: '"use client";'
  }
})
