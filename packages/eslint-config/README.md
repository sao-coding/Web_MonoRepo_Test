# ESLint Config

一個適用於 Next.js、React、TypeScript 和 Tailwind CSS 專案的 ESLint 配置套件。

## 特色

✨ **開箱即用** - 零配置即可開始使用  
🎯 **專為現代框架優化** - 支援 Next.js、React 和 TypeScript  
🎨 **Tailwind CSS 整合** - 自動驗證和排序 Tailwind 類別  
📦 **自動 Import 排序** - 保持 import 語句整齊有序  
🔧 **高度可自訂** - 輕鬆覆寫任何規則

## 安裝

```bash
npm install -D @your-org/eslint-config eslint
```

```bash
pnpm add -D @your-org/eslint-config eslint
```

```bash
yarn add -D @your-org/eslint-config eslint
```

## 使用方式

在專案根目錄建立 `eslint.config.ts` 檔案：

```typescript
import { defineConfig } from "@your-org/eslint-config";

export default defineConfig({
  tsconfigRootDir: import.meta.dirname,
});
```

### 完整配置範例

```typescript
import { defineConfig } from "@your-org/eslint-config";

export default defineConfig({
  // 必填：TypeScript 配置根目錄
  tsconfigRootDir: import.meta.dirname,

  // 選填：啟用 React 規則（預設自動偵測）
  react: true,

  // 選填：啟用 Next.js 規則（預設自動偵測）
  nextjs: true,

  // 選填：Tailwind CSS 進入點
  tailwindEntryPoint: "./src/styles/globals.css",

  // 選填：忽略的檔案
  ignores: ["dist/**", ".next/**", "node_modules/**"],

  // 選填：覆寫特定規則
  overrides: {
    typescript: {
      "@typescript-eslint/no-unused-vars": "warn",
    },
    react: {
      "@eslint-react/no-array-index-key": "warn",
    },
  },
});
```

## 配置選項

### `tsconfigRootDir` (必填)

TypeScript 配置檔案 `tsconfig.json` 所在的根目錄路徑。

```typescript
tsconfigRootDir: import.meta.dirname;
```

### `react` (選填)

啟用 React 專用的 ESLint 規則。如果專案中已安裝 `react`，將自動啟用。

```typescript
react: true;
```

### `nextjs` (選填)

啟用 Next.js 專用的 ESLint 規則。如果專案中已安裝 `next`，將自動啟用。啟用此選項也會自動啟用 React 規則。

```typescript
nextjs: true;
```

### `tailwindEntryPoint` (選填)

Tailwind CSS 的主要進入點檔案路徑。設定後會啟用 Tailwind CSS 相關的 ESLint 規則。

```typescript
tailwindEntryPoint: "./src/styles/globals.css";
```

### `ignores` (選填)

要忽略的檔案或目錄的 glob 模式陣列。

```typescript
ignores: ["dist/**", ".next/**", "coverage/**"];
```

### `overrides` (選填)

覆寫特定插件的規則配置。

```typescript
overrides: {
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
```

## 包含的規則

### JavaScript & TypeScript

- ✅ ESLint 推薦規則
- ✅ TypeScript 嚴格型別檢查
- ✅ 未使用的變數和 import 偵測
- ✅ 一致的型別 import 風格

### React & JSX

- ✅ React 最佳實踐
- ✅ React Hooks 規則
- ✅ JSX 可訪問性 (a11y) 檢查
- ✅ 元件檔案命名規範 (kebab-case)

### Next.js

- ✅ Core Web Vitals 規則
- ✅ Next.js 特定優化建議

### Tailwind CSS

- ✅ 類別順序驗證
- ✅ 衝突類別偵測
- ✅ 重複類別警告
- ✅ 支援 `cva` (class-variance-authority)

### Import 管理

- ✅ 自動 Import 排序（7 層分組）
- ✅ Import 重複檢測
- ✅ Import 順序驗證

### 程式碼格式化

- ✅ Prettier 整合
- ✅ 自動格式化

## Import 排序規則

Import 語句會自動按以下順序排序：

1. **Type imports** - 所有型別匯入
2. **Side effect imports** - 副作用匯入（如 `import 'styles.css'`）
3. **Node.js builtins** - Node.js 內建模組（`node:` 前綴）
4. **External packages** - 第三方套件
5. **Absolute imports** - 絕對路徑匯入
6. **Parent relative imports** - 父目錄相對路徑（`../`）
7. **Current directory imports** - 當前目錄相對路徑（`./`）

範例：

```typescript
// 1. Type imports
import type { FC } from "react";
import type { NextPage } from "next";

// 2. Side effects
import "./globals.css";

// 3. Node.js builtins
import fs from "node:fs";

// 4. External packages
import { useState } from "react";
import Link from "next/link";

// 5. Absolute imports
import { Button } from "@/components/ui/button";

// 6. Parent relative
import { utils } from "../utils";

// 7. Current directory
import { Header } from "./header";
```

## 進階使用

### 添加自訂配置

您可以在 `defineConfig` 之後添加額外的配置：

```typescript
import { defineConfig } from "@your-org/eslint-config";

export default defineConfig(
  {
    tsconfigRootDir: import.meta.dirname,
    react: true,
    nextjs: true,
  },
  // 自訂配置
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
```

### 禁用特定規則

```typescript
export default defineConfig({
  tsconfigRootDir: import.meta.dirname,
  overrides: {
    typescript: {
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
});
```

## VS Code 整合

安裝 [ESLint 擴充套件](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)，並在 `.vscode/settings.json` 中添加：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## 常見問題

### TypeScript 專案找不到型別

確保 `tsconfig.json` 中包含了所有需要的檔案：

```json
{
  "include": ["**/*.ts", "**/*.tsx"]
}
```

### Import 排序不符合預期

執行以下命令修復：

```bash
npx eslint . --fix
```

### Tailwind 類別驗證失敗

確保 `tailwindEntryPoint` 指向正確的 Tailwind CSS 檔案。

## 授權

MIT

## 貢獻

歡迎提交 Issue 和 Pull Request！
