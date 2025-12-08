# Monorepo 開發環境說明

此專案是一個使用 Turborepo 與 pnpm 建立的 TypeScript/Next.js Monorepo，整合多種開發工具來提升程式碼品質、協作效率與 CI/CD 自動化。

## 使用到的開發工具與設定

### 套件與腳本管理

- **pnpm**

  - 透過 `pnpm-workspace.yaml` 管理多個子專案與套件。
  - 使用 `pnpm` 指令執行共用 scripts（例如 `pnpm check`、`pnpm lint` 等）。

- **Turborepo (`turbo`)**
  - 於根目錄 [`package.json`](package.json:1) 中定義：
    - `"build": "turbo build"`
    - `"build:apps": "turbo build --filter=./apps/*"`
    - `"build:packages": "turbo build --filter=./packages/*"`
    - `"check-types": "turbo check-types"`
    - `"dev": "turbo dev"`
    - `"start": "turbo start"`
    - `"lint": "turbo lint"`
  - 在 [`turbo.json`](turbo.json:1) 設定任務相依與快取：
    - `build` / `build:packages` / `check-types` / `lint` 任務的 `dependsOn` 與 `outputs`。
    - 啟用 `remoteCache` 以加速 CI/CD 構建。

### 程式碼品質與風格

- **ESLint**

  - 根目錄使用共用設定套件 [`@msi/eslint-config`](packages/eslint-config/src/index.ts:1)，由 [`eslint.config.ts`](eslint.config.ts:1) 匯入：
    - 指定 `project: './tsconfig.json'`
    - `turbo: true`
    - 於 root 層級忽略 `apps/**`、`packages/**`（各子專案再自訂各自的 ESLint 設定）。
  - 各 app / package（例如 [`apps/web/eslint.config.ts`](apps/web/eslint.config.ts:1)、[`apps/docs/eslint.config.ts`](apps/docs/eslint.config.ts:1)、[`packages/ui/eslint.config.ts`](packages/ui/eslint.config.ts:1)）皆使用自訂 ESLint config 套件，集中管理規則。

- **自製 ESLint 設定套件 `@msi/eslint-config`**

  - 來源位置：[`packages/eslint-config`](packages/eslint-config/README.md:1)
  - 內含多組專用 config：
    - [`configs/javascript.ts`](packages/eslint-config/src/configs/javascript.ts:1)
    - [`configs/typescript.ts`](packages/eslint-config/src/configs/typescript.ts:1)
    - [`configs/react.ts`](packages/eslint-config/src/configs/react.ts:1)
    - [`configs/nextjs.ts`](packages/eslint-config/src/configs/nextjs.ts:1)
    - [`configs/tailwindcss.ts`](packages/eslint-config/src/configs/tailwindcss.ts:1)
    - [`configs/imports.ts`](packages/eslint-config/src/configs/imports.ts:1)
    - [`configs/prettier.ts`](packages/eslint-config/src/configs/prettier.ts:1)
    - [`configs/ignores.ts`](packages/eslint-config/src/configs/ignores.ts:1)
  - 整合於 [`base.ts`](packages/eslint-config/src/base.ts:1)、[`plugins.ts`](packages/eslint-config/src/plugins.ts:1) 等檔案，提供 monorepo 共用 Lint 標準。

- **Prettier**

  - 使用自製設定套件 [`@msi/prettier-config`](packages/prettier-config/src/index.ts:1)。
  - 由根目錄 [`prettier.config.js`](prettier.config.js:1) 匯入共用格式化規則：
    - `export default msi()`
  - 格式化腳本於根目錄 [`package.json`](package.json:6)：
    - `"format": "prettier --write \"**/*.{ts,tsx,md}\""`

- **TypeScript 共用設定 (`@msi/typescript-config`)**
  - 在 [`packages/tsconfig`](packages/tsconfig/package.json:1) 提供：
    - [`base.json`](packages/tsconfig/base.json:1)
    - [`nextjs.json`](packages/tsconfig/nextjs.json:1)
    - [`react-library.json`](packages/tsconfig/react-library.json:1)
  - 各 app / package 參考這些共用設定，統一 TypeScript 編譯選項。

### 靜態檢查與檔案健康

- **Knip（未使用程式碼/相依檢查）**

  - 設定檔：[`knip.config.ts`](knip.config.ts:1)
    - 忽略目錄：`**/fixtures/**`、`packages/ui/**`、`cspell.config.mjs`
    - Vitest 設定偵測：`vitest.{config,shared,workspace}.ts`
    - 忽略部分偵測不到的依賴（如 `prettier-plugin-*` 等）。
  - 在根目錄 [`package.json`](package.json:11) 中腳本：
    - `"check:knip": "knip"`
    - `"knip": "knip"`
  - 整體檢查腳本 `"check"` 會包含 `pnpm check:knip`。

- **CSpell（拼字檢查）**
  - 設定檔：[`cspell.config.mjs`](cspell.config.mjs:1)
    - 忽略路徑：`node_modules`、`pnpm-lock.yaml`、`.pnpm-store/`、`.git` 等。
    - 自訂字典詞彙：`nixpacks`, `knip`, `apk`。
  - 於 [`package.json`](package.json:13) 定義：
    - `"check:spelling": "cspell"`
  - 同樣整合進 `"check"` 腳本中。

### Commit 流程與 Git Hooks

- **Commitizen / czg（互動式 Commit 訊息）**

  - 於 [`package.json`](package.json:14) 定義：
    - `"commit": "pnpm cz"`
    - `"cz": "cross-env NODE_OPTIONS=\"--experimental-transform-types --disable-warning=ExperimentalWarning\" czg"`
  - 搭配 [`commitlint.config.ts`](commitlint.config.ts:1) 中 `defineConfig()` 提供的 `prompt` 設定：
    - 自訂 type / scope / issue 前綴選單與提示文字（中文說明）。
    - `scopes` 動態從 `apps/` 與 `packages/` 目錄讀取，確保範圍與實際專案結構同步。

- **Commitlint**

  - 依賴：
    - `@commitlint/cli`
    - `@commitlint/config-conventional`
  - 設定檔：[`commitlint.config.ts`](commitlint.config.ts:1)
    - `extends: ['@commitlint/config-conventional']`
    - 自訂規則：
      - `'scope-enum': [2, 'always', ['release', ...scopes]]`
    - 與 `czg` 的 `prompt` 整合，確保互動式輸入與規則一致。

- **Husky**

  - 安裝與啟用於根目錄 [`package.json`](package.json:20) 的 `prepare` 腳本：
    - `"prepare": "husky && pnpm build:packages"`
  - Hooks 位置：
    - [`./.husky/pre-commit`](.husky/pre-commit:1)
      - 內容：`pnpm lint-staged`，於每次 commit 前執行 `lint-staged`。

- **lint-staged**
  - 於 [`package.json`](package.json:23) 中引入 `lint-staged` 套件，並透過 Husky 的 `pre-commit` hook：
    - 只對 staged 檔案執行 Lint / Format，加快本地開發體驗。
  - 具體規則可依日後需求擴充在 `lint-staged` 設定中。

### CI/CD 與發佈流程（GitLab CI）

- **GitLab CI (`.gitlab-ci.yml`)**
  - 檔案位置：[`./.gitlab-ci.yml`](.gitlab-ci.yml:1)
  - 階段 (stages)：
    - `check`
    - `publish-npm`
    - `build-docker`
    - `deploy-docker`
  - 主要 Job：
    - **`check-affected`**：計算受影響的 apps 與 packages
      - 使用 Turbo 的 `--affected --dry=json` 產生 `affected-packages.json`。
      - 透過 `jq` 解析出 `AFFECTED_APPS` 與 `AFFECTED_PACKAGES`。
      - 設定到 `build.env` 作為後續 Job 的環境變數。
    - **`build-docker`**：
      - 對 `AFFECTED_APPS` 中的每個 app，使用對應的 `apps/<app>/Dockerfile` 建立 Docker 映像並推送到 GitLab Registry。
    - **`deploy-docker`**：
      - 使用 SSH 登入遠端主機。
      - 傳輸 [`docker-compose.yml`](docker-compose.yml:1)，並透過 `docker stack deploy` 更新服務。
    - **`publish-npm`**：
      - 對 `AFFECTED_PACKAGES` 中的每個 NPM 套件執行 `pnpm publish --no-git-checks`。
      - 發佈目標為 GitLab Package Registry (`@msi` scope)。

### 共用 UI / Utils 套件

- **UI 套件（`@msi/ui`）**

  - 來源：[`packages/ui`](packages/ui/package.json:1)
  - 內含：
    - 共用元件（例如 [`src/components/button.tsx`](packages/ui/src/components/button.tsx:1)）
    - 共用樣式 [`src/styles/globals.css`](packages/ui/src/styles/globals.css:1)

- **工具函式（`@msi/utils`）**
  - 來源：[`packages/utils`](packages/utils/package.json:1)
  - 匯出常用工具（例如 [`src/get-error-message.ts`](packages/utils/src/get-error-message.ts:1)、[`src/range.ts`](packages/utils/src/range.ts:1)）。
  - Lint 設定檔：[`packages/utils/eslint.config.mjs`](packages/utils/eslint.config.mjs:1)

---

## 常用指令整理

於專案根目錄執行：

- 檢查整體專案（型別、Lint、未使用程式碼、拼字）

  - `pnpm check`
    - 內含：
      - `turbo lint`
      - `pnpm turbo check-types`
      - `pnpm check:knip`
      - `pnpm check:spelling`

- Lint 檢查

  - `pnpm lint`

- 型別檢查

  - `pnpm check-types`

- 未使用程式碼 / 相依檢查

  - `pnpm check:knip`

- 拼字檢查

  - `pnpm check:spelling`

- 程式碼格式化

  - `pnpm format`

- 啟動開發環境

  - `pnpm dev`

- 建置專案

  - `pnpm build`
  - 只建置 apps：`pnpm build:apps`
  - 只建置 packages：`pnpm build:packages`

- 互動式 Commit 訊息（czg + commitlint）
  - `pnpm commit`（等同執行 `pnpm cz`）
