# Frontend Development

## AI 目前認知

如果現在直接開始開發，我腦中的前端專案模型如下：

- 這不是 SEO 或內容型網站，而是標準的前後端分離業務介面。
- 前端的核心不是炫技，而是把以下流程做穩：
  - 列表
  - 詳情
  - 勾選與確認
  - 撤銷確認
  - admin CRUD
- 我不會把此專案當成 Next.js 導向專案，也不會引入不必要的 full-stack framework 心智負擔。
- 我會把它當成 `React SPA + RESTful API client` 來做。
- 同一個 React App 內會同時承載：
  - 一般使用者流程
  - admin 流程
- 我目前直覺上會用 route 來切前台與 admin，而不是拆成兩套前端。
- 前端我會把狀態明確拆成兩種：
  - server state：Work Item 資料、狀態、列表、詳情
  - local UI state：checkbox 是否被當次選取、彈窗開關、暫時表單狀態
- 我之所以偏向 `fetch + TanStack Query`，是因為此專案本質就是多頁 CRUD + 狀態同步。
- 我會把 TanStack Query 視為「server state 管理層」，不是視為 API 溝通方式本身。
- 我會預設前端重點在：
  - query key 規則清楚
  - API module 固定
  - feature hook 固定
  - mutation 後 invalidate 規則固定
- Tailwind 對我來說是為了降低畫面開發成本，讓注意力集中在流程與狀態，而不是 UI library 細節。
- Phase 1 前端我會先做 mock user / role switcher，讓整個主流程能完整操作。
- 如果沒有新的決策，我會自然朝這個方向寫：
  - `React + TypeScript + Vite`
  - `Tailwind CSS`
  - `fetch + TanStack Query`
  - `同 SPA 承載前台與 admin`
  - `先穩定主流程，再補真正 auth`

## 來源依序

1. PDF
2. MyWorkItem_PDF_Readthrough.md
3. MyWorkItem_Missing_And_Odd_Info.md
4. Frontend/Question.md
5. 本文件

## 前端目標

- `來源明文`
  - 提供可操作 UI
  - 前台使用者可查看 Work Item 列表
  - 可查看 Work Item 詳情
  - 可勾選並確認
  - 可撤銷確認
  - 管理員可新增 / 修改 / 刪除 Work Item
- `已確認`
  - 技術方向：React 前端，前後端分離
  - React：TypeScript
  - 建置工具：Vite
  - 樣式方案：Tailwind CSS
  - HTTP client：原生 fetch
  - 資料抓取方案：fetch + TanStack Query
  - 權限策略：
    - Phase 1：Mock 權限 / user switcher
    - Phase 2：若有時間，再配合後端補 JWT

## 前端架構原則

- `已確認`
  - 不使用 Next.js
  - 不使用 axios
  - 以 RESTful API 溝通
  - 以 TanStack Query 管理 server state
- `AI 推估 / 待覆核`
  - 前台與 admin 先放在同一個 React App
  - 用 route 區分前台與 admin
  - 以 feature 為主切分前端程式碼，而不是以技術層硬切

## 專案切分

```text
Frontend
└─ src
   ├─ app
   │  ├─ router
   │  ├─ providers
   │  └─ layouts
   │
   ├─ api
   │  ├─ client
   │  ├─ queryKeys
   │  └─ mappers
   │
   ├─ features
   │  ├─ work-items
   │  ├─ admin-work-items
   │  └─ auth-mock
   │
   ├─ pages
   ├─ components
   ├─ styles
   └─ types
```

- `AI 推估 / 待覆核`
  - `app`：放 router、providers、layout
  - `api`：放 fetch wrapper、query keys、API functions
  - `features`：按功能切分 hooks、components、mutations
  - `pages`：頁面組裝

## 路由方向

- `來源明文`
  - `/work-items`
  - `/work-items/{id}`
  - `/admin/work-items/new`
  - `/admin/work-items/{id}/edit`
- `AI 推估 / 待覆核`
  - 補一個 admin 列表頁：
    - `/admin/work-items`
  - 單一 React App 的 route tree：

```text
/
├─ /work-items
├─ /work-items/:id
└─ /admin/work-items
   ├─ /new
   └─ /:id/edit
```

## 畫面清單

- `來源明文`
  - Work Item List
  - Work Item Detail
  - Admin create / edit / delete 能力
- `AI 推估 / 待覆核`
  - 先做 4 個主頁：
    - WorkItemsPage
    - WorkItemDetailPage
    - AdminWorkItemsPage
    - AdminWorkItemFormPage

## 資料抓取層次

```text
React 畫面
│
├─ page 組裝資料與互動
├─ feature hooks 管 list / detail / mutation
├─ api module 呼叫 fetch
└─ ASP.NET Core RESTful API
```

- `已確認`
  - 使用原生 fetch
  - 使用 TanStack Query
- `AI 推估 / 待覆核`
  - 每個 feature 至少提供：
    - query hook
    - mutation hook
    - query keys

## Query / Mutation 初步規範

- `AI 推估 / 待覆核`
  - Query key 命名以 resource 為主：
    - `['work-items', filters]`
    - `['work-item', id, userId]`
    - `['admin-work-items']`
  - Mutation 後必須明確 invalidate
  - QueryClient defaults 需在專案一開始就定義

## 功能對應

### 前台列表

- `來源明文`
  - 顯示編號 / 標題 / 狀態
  - 支援排序
  - checkbox 多選
  - 全選
  - Confirm
- `AI 推估 / 待覆核`
  - checkbox 選取狀態保留在本地 UI state
  - 已確認 / 待確認狀態來自 server state

### 前台詳情

- `來源明文`
  - 顯示編號 / 標題 / 描述 / 建立時間 / 狀態 / 最後更新時間
- `已確認`
  - 詳情頁顯示建立時間與最後更新時間
  - status 以目前使用者的個人狀態解讀

### Admin

- `來源明文`
  - 新增
  - 修改
  - 刪除
- `已確認`
  - 採獨立路由：
    - /admin/work-items
    - /admin/work-items/new
    - /admin/work-items/:id/edit
  - admin list 與 admin edit 的讀取流程先重用一般 read API

## 權限與使用者切換

- `已確認`
  - Phase 1：Mock 權限 / user switcher
- `AI 推估 / 待覆核`
  - 前端右上角可放簡單 user switcher
  - admin / user 可先用 mock role 切換
  - Phase 2 再接 JWT 與真正登入

## 樣式方向

- `已確認`
  - Tailwind CSS
- `AI 推估 / 待覆核`
  - 優先做清楚、穩定、好掃讀的資訊型介面
  - 先不引入大型 UI library
  - 狀態、表單驗證、成功 / 失敗提示都需有明確視覺區分

## agent-first 開發前置規範

- `已確認`
  - 需要保留高層邏輯與決策理由
- `AI 推估 / 待覆核`
  - 在前端先固定：
    - query key 命名規則
    - API module 放置規則
    - feature hook 命名方式
    - QueryClient defaults
    - mutation invalidate 規則
  - 避免每個頁面各寫一套 request / loading / error 風格

## 待確認

- 分頁是否為必做項

## 開發模式

- `已確認`
  - 具體操作細節以既有 skill 為準
  - 本文件只保留高層流程
  - 開發順序先走：
    - 需求確認
    - 補 BDD / SDD / TDD 文件
    - 依文件實作
    - 補 code review 文件
- `AI 推估 / 待覆核`
  - 此專案前端也採 `文件先行 -> 實作 -> 回寫文件`
  - 前端目前不主張嚴格執行 executable test-first
  - 主要原因是目前優先順序仍是：
    - 路由對齊
    - 畫面流程對齊
    - API 串接對齊
    - server state 行為對齊
  - 前端較適合的方式是：

```text
確認需求
│
├─ 補齊未定義點與決策
├─ 寫 BDD
├─ 寫 SDD
├─ 寫 TDD 文件
├─ 選定一條要開發的垂直流程
├─ 依文件把該流程一次做完
│  ├─ route
│  ├─ page
│  ├─ feature hook
│  ├─ API 串接
│  ├─ loading / error / empty state
│  ├─ 必要的表單或互動驗證
│  └─ 該流程對應測試
├─ 跑測試
└─ 回寫 code review 文件
```

- `AI 推估 / 待覆核`
  - 這裡同樣採 `完整切片開發 + test-close-following`
  - 也就是：
    - 先寫文件
    - 每次只進一條流程
    - 但該流程一旦開始，就在既定範圍內一次做完
    - 接著立刻補齊該流程的測試或驗證
  - 不先要求前端把所有 executable test 都寫完才開始組頁面
  - 目前也不接受先鋪 route / page / hook 骨架，之後再慢慢補邏輯
  - 這樣比較能避免：
    - AI 只對測試樣板優化
    - 還沒確定畫面結構前就反覆重寫測試
    - request / loading / error 狀態邏輯和文件脫鉤
    - 畫面看起來有了，但實際互動與狀態細節長期處於未完成

## 開發順序

```text
Phase 1
│
├─ 建立 Vite React TS 專案
├─ 接 Tailwind / TanStack Query
├─ 定 router / query keys / fetch wrapper
├─ 先完成前台列表與詳情
├─ 再完成確認 / 撤銷確認
├─ 補 admin CRUD 頁面
└─ 接 mock user / role switcher

Phase 2
│
├─ JWT
├─ 真正登入流程
└─ 視需要調整 admin 權限入口
```
