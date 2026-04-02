# Frontend

## 目前內容

- 文件：Frontend/Development.md、Frontend/Question.md
- 前端專案：Frontend/MyWorkItem.App
- 目前已完成 user flow、admin CRUD、mock user switcher、API 串接與頁面測試

## 目前專案方向

- React
- TypeScript
- Vite
- Tailwind CSS
- native fetch
- TanStack Query
- 同一個 SPA 同時承載 user 與 admin 流程

## 專案資料夾

```text
Frontend
├─ Development.md
├─ Question.md
├─ README.md
└─ MyWorkItem.App
   ├─ public
   ├─ src
   │  ├─ app
   │  │  ├─ router
   │  │  ├─ providers
   │  │  └─ layouts
   │  ├─ api
   │  │  ├─ client
   │  │  ├─ queryKeys
   │  │  └─ mappers
   │  ├─ features
   │  │  ├─ work-items
   │  │  ├─ admin-work-items
   │  │  └─ auth-mock
   │  ├─ pages
   │  ├─ components
   │  ├─ styles
   │  └─ types
   ├─ package.json
   ├─ vite.config.ts
   ├─ tailwind.config.ts
   ├─ postcss.config.cjs
   └─ .env.example
```

## 啟動前準備

1. 確認本機已有 Node.js 與 npm
2. 進入前端專案目錄
3. 安裝套件
4. 視需要建立 `.env.local`

## API Base URL

目前先提供：

- Frontend/MyWorkItem.App/.env.example

內容如下：

```text
VITE_API_BASE_URL=http://localhost:5032
```

如果後端改用 HTTPS，也可以改成：

```text
VITE_API_BASE_URL=https://localhost:7119
```

## 啟動方式

在專案根目錄執行：

```powershell
cd Frontend\MyWorkItem.App
copy .env.example .env.local
npm install
npm run dev
```

啟動後預設網址：

- http://localhost:5173

## 目前狀態

- 已完成 React + TypeScript + Vite SPA
- 已完成 user list / detail / confirm / revert
- 已完成列表內的 revert confirmation、selected row 高亮與成功提示
- 已完成 admin list / create / edit / delete
- 已完成 create / update / delete 成功回到列表後的 success message
- 已完成 mock user switcher 與 localStorage 同步
- 已完成 native fetch + TanStack Query API 串接
- 已補前端頁面測試與 live API smoke test

## 測試方式

一般測試：

```powershell
cd Frontend\MyWorkItem.App
npm run test
```

建置檢查：

```powershell
cd Frontend\MyWorkItem.App
npm run build
```

live backend smoke test：

```powershell
cd Backend
dotnet run --project .\MyWorkItem.Api\MyWorkItem.Api.csproj --launch-profile http
```

另開一個終端：

```powershell
cd Frontend\MyWorkItem.App
$env:LIVE_API_SMOKE='1'
npm run test -- --run src/app/router/__tests__/LiveApiSmoke.test.tsx
```

這個 smoke test 會直接渲染前端頁面並打 live backend，驗證：

- admin create / edit / delete
- user confirm / revert
- 不同使用者的個人 status 隔離
- 刪除後 detail not found

## 下一步建議

- 補 PostgreSQL integration tests
- 視需要再補真正瀏覽器層的 E2E 自動化
- Phase 2 若要正式化，再補 JWT 與正式授權
