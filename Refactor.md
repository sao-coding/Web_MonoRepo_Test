# ASR 模組化重構指南

本文件記錄 ASR (語音轉文字) 從 `rd_aicity` 遷移到獨立 app 的過程與專案規範。

---

## 專案架構

```
apps/asr/                     # 獨立 Next.js App
├── package.json              # port 3004 (dev), 3014 (prod)
├── next.config.ts            # basePath: /AI_City/asr
├── src/
│   ├── app/
│   │   ├── layout.tsx        # AuthProvider + ThemeProvider
│   │   ├── page.tsx          # 主頁面，使用 @msi/ui 元件
│   │   └── globals.css       # @import '@msi/ui/styles/preset.css'
│   ├── components/           # App 專用元件
│   │   ├── asr-sidebar.tsx   # 基於 @msi/ui Sidebar 原語
│   │   ├── defalt-info.tsx   # 歡迎畫面
│   │   └── file-upload-area.tsx  # 拖放上傳區
│   ├── hooks/
│   │   └── use-asr.ts        # ASR 核心邏輯 hook
│   └── config/
│       └── asr.ts            # API 設定
```

---

## 核心原則

### 1. 元件使用優先順序

```
@msi/ui > 本地元件 > 手刻 JSX
```

| 來源 | 使用時機 |
|------|----------|
| `@msi/ui` | 通用 UI (Button, Dialog, Avatar, Sidebar 原語) |
| `@msi/ui/components/chat-layout` | 聊天佈局 (ChatLayout, ChatHeader, ChatMessage) |
| 本地 components/ | App 專用邏輯 (AsrSidebar, FileUploadArea) |

### 2. 樣式覆寫方式

❌ **不要**：修改 `@msi/ui` 原始碼
✅ **應該**：使用 `className` prop 覆寫

```tsx
<ChatHeader className='border-b-0' />  // 移除底線
<Sidebar className='bg-gray-50' />      // 自訂背景
```

### 3. Provider 順序

```tsx
<ThemeProvider>
  <AuthProvider>
    {children}
    <Toaster />
  </AuthProvider>
</ThemeProvider>
```

---

## 元件模組化決策

### ChatSidebar vs AsrSidebar

| 元件 | 位置 | 適用場景 |
|------|------|----------|
| [ChatSidebar](file:///c:/Users/felixyun/Web_MonoRepo_Test/packages/ui/src/components/chat-layout/chat-sidebar.tsx#77-397) | `@msi/ui` | 對話歷史 + 筆記 (ProductSpec, GPU競品) |
| [AsrSidebar](file:///c:/Users/felixyun/Web_MonoRepo_Test/apps/asr/src/components/asr-sidebar.tsx#62-252) | `apps/asr` | 語言選擇 + 識別紀錄 (ASR 專用) |

**結論**：結構差異大，保持獨立但使用相同 Sidebar 原語。

### FileUploadArea

**不移到 @msi/ui**，原因：
- 僅 ASR 和圖意探險家使用
- 其他上傳場景 UI 不同 (全頁模糊 + 對話框內上傳)
- 復用率低

---

## Rewrites 設定

```typescript
// apps/rd_aicity/next.config.ts
async rewrites() {
  return [
    { source: '/asr', destination: 'http://localhost:3004/AI_City/asr' },
    { source: '/asr/:path*', destination: 'http://localhost:3004/AI_City/asr/:path*' }
  ]
}
```

**行為**：
- 本地開發：需啟動 ASR app (`pnpm turbo run --filter asr dev`)
- 未啟動時：fallback 到資料庫設定的 URL

---

## 已完成項目

- [x] 建立 `apps/asr` 獨立 app
- [x] 整合 `@msi/auth` (AuthProvider + useAuth)
- [x] 使用 `@msi/ui` ChatLayout、ChatHeader、ChatMessage
- [x] 建立 AsrSidebar (Sidebar原語 + SidebarRail)
- [x] 設定 rewrites 和 ecosystem config
- [x] 支援深色模式

---

## 未來遷移注意事項

當從 `rd_aicity` 遷移其他頁面時：

1. **建立新 app** - 複製 ASR 結構
2. **替換 imports** - `@/components/ui/*` → `@msi/ui`
3. **包裹 Providers** - AuthProvider + ThemeProvider
4. **設定 rewrites** - 在 rd_aicity 和 ecosystem config
5. **Port 規劃** - dev 300x, prod 301x
