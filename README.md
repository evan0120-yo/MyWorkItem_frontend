# Frontend

## 目前內容

- 文件：Frontend/Development.md、Frontend/Question.md
- 前端專案：Frontend/MyWorkItem.App
- 目前只建立專案結構與啟動設定，尚未開始實作業務頁面與串接流程

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

- 已建立 React + TypeScript + Vite 專案結構
- 已接好 Tailwind 基本設定
- 已放入 TanStack Query 與 React Router 依賴
- 已預留 user flow / admin flow 的 feature 資料夾
- 尚未開始實作實際頁面、路由與 API 流程

## 下一步建議

- 先補 BDD / SDD / TDD 文件
- 先決定第一條要落地的垂直流程
- 再把該流程一次做完，不先鋪半成品
