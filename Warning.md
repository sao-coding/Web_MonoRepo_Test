這是一個非常實用的想法。建立一份明確的 **AI 開發準則 (Cursor Rules / System Instructions)** 可以大幅減少 AI「自作聰明」或「寫出壞味道程式碼」的機會。

這份 `.md` 檔案主要針對 **Monorepo 架構** 與 **Shadcn UI 標準** 進行規範。您可以將此檔案命名為 `.cursorrules` (如果您使用 Cursor) 或 `AI_GUIDELINES.md` (放在專案根目錄讓 AI 讀取)。

-----

### 建議的 `.md` 內容

````markdown
# AI Coding Guidelines & Anti-Patterns

這份文件規範了在 SpecCore (Monorepo) 專案中進行開發時，AI 必須遵守的架構原則與禁止事項。

## 1. Monorepo 架構分際 (Architecture Boundaries)

專案結構分為 `apps/` (應用程式) 與 `packages/ui/` (共用 UI 庫)。

### 🚫 禁止事項 (DO NOT)
- **嚴禁在 `packages/ui` 中寫入業務邏輯**：
  - 不要在 UI 庫中引入 `fetch`, `axios`, `useAuth`, `useQuery` 等與後端或驗證有關的 Hook。
  - 不要在 UI 庫中定義特定專案的 Type (如 `RecordItem`, `User`)。
- **禁止為了單一 App 的需求修改 `packages/ui` 的樣式**：
  - 如果只是某個 App 需要紅色按鈕，請在該 App 層級覆蓋樣式，而不是去改 `packages/ui/src/components/button.tsx` 的預設值。

### ✅ 允許事項 (DO)
- **僅在「優化通用行為」時修改 `packages/ui`**：
  - 例如：增加全域的 `transition-all` 動畫、修復 Accessibility (無障礙) 問題、或是增加新的通用 Variant。
- **頁面組件 (Page Assemblies) 放在 `apps/`**：
  - 像 `AppSidebar`, `ParameterSettings`, `ChatHistory` 這種包含資料邏輯的組件，必須放在 `apps/YOUR_APP/src/components` 下。

---

## 2. Shadcn UI / Radix UI 使用規範

本專案使用 Shadcn UI (@msi/ui) 作為基礎組件庫。

### 🚫 禁止事項 (DO NOT)
- **禁止「手寫」已有組件功能的邏輯**：
  - ❌ 不要用 `<div>` + `onClick` + `absolute position` 來手刻下拉選單或 Tooltip。
  - ❌ 不要用 `useState` 手動控制 Sidebar 的寬度 (如 `w-80` vs `w-14`)。
- **禁止使用 `!important` 覆蓋樣式**：
  - 除非萬不得已，否則不要使用 `!bg-black` 這種強制覆蓋。這代表你沒有正確使用 Tailwind 的 `cn()` 或組件的 `variant`。
- **禁止破壞 Composition (組合) 模式**：
  - 不要把所有東西塞在一個 prop 裡 (如 `items={...}`)，應該優先使用子組件組合 (如 `<Sidebar><SidebarContent>...</SidebarContent></Sidebar>`)。

### ✅ 最佳實踐 (Best Practices)
- **Sidebar 開發**：
  - 使用標準結構：`SidebarHeader` > `SidebarMenu` > `SidebarMenuItem` > `SidebarMenuButton`。
  - **Logo 與標題**：應包在 `SidebarMenuButton` 內，利用其內建的「收合時隱藏文字」邏輯，而非手寫 CSS。
  - **收合狀態**：使用 `group-data-[collapsible=icon]:hidden` 來控制收合時的顯示/隱藏。
- **Trigger 位置**：
  - 標準的 `SidebarTrigger` (漢堡按鈕) 應放在 **`SidebarInset` 的 Header (Navbar)** 中，由外部控制 Sidebar，而非塞在 Sidebar 內部 (除非是 Floating 樣式)。

---

## 3. 樣式與動畫 (Styling & Animation)

### 🚫 禁止事項 (DO NOT)
- **不要在元件層級寫死動畫 Keyframes**：
  - 動畫定義 (如 `collapsible-down`) 應統一在 `packages/ui/src/styles/preset.css` 或 `globals.css` 中定義，App 只負責使用 utility class (如 `animate-collapsible-down`)。
- **不要移除無障礙屬性**：
  - 不要隨意移除 `sr-only` (Screen Reader Only) 的標籤。

### ✅ 最佳實踐 (Best Practices)
- **使用 `cn()` 合併樣式**：
  - 所有自定義組件都應接受 `className` prop 並透過 `cn(defaultStyles, className)` 合併。
- **狀態驅動樣式**：
  - 多利用 `data-[state=open]` 或 `group-data-[collapsible=icon]` 等 Data Attribute 來切換樣式，而非依賴額外的 React State。

---

## 4. 範例對照 (Example)

**❌ 錯誤寫法 (Bad Code)**
```tsx
// 在 packages/ui 中
export const UserProfile = () => {
  const user = useAuth(); // 錯誤：依賴業務邏輯
  return <div>{user.name}</div>
}

// 在 apps 中手寫 Sidebar
<div className={isExpanded ? "w-64" : "w-16"}> // 錯誤：手寫寬度控制
  <button onClick={toggle}>Toggle</button>
</div>
````

**✅ 正確寫法 (Good Code)**

```tsx
// 在 apps/src/components/AppSidebar.tsx
<Sidebar collapsible="icon">
  <SidebarHeader>
    <SidebarMenuButton size="lg"> // 正確：使用標準組件
       <Logo />
       <span>Title</span> // 正確：利用組件內建邏輯處理收合隱藏
    </SidebarMenuButton>
  </SidebarHeader>
</Sidebar>
```

```

### 如何使用這個檔案？

1.  **Cursor 使用者**：將此內容存為專案根目錄的 `.cursorrules` 檔案。Cursor 會自動讀取並在生成代碼時遵守。
2.  **一般 LLM 使用者**：將此檔案存為 `AI_GUIDELINES.md`。每次開啟新對話時，可以先將此檔案內容貼給 AI，或者在 Prompt 中加上一句：「請參考 `AI_GUIDELINES.md` 的規範進行修改。」
```
