# Frontend SDD

## 文件定位

- 本文件定義前端的結構設計與模組責任。
- 本文件目標是讓後續實作時，能直接對應：
  - route
  - page
  - feature hooks
  - API client
  - mock auth
  - query keys
- 本文件不做 full-stack framework 設計，也不把前端寫成抽象教科書。

## 來源明文

- 技術方向：
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - native fetch
  - TanStack Query
- 互動方向：
  - 前台列表
  - 前台詳情
  - confirm / revert
  - admin create / update / delete
- 路由方向：
  - `/`
  - `/work-items`
  - `/work-items/:id`
  - `/admin/work-items`
  - `/admin/work-items/new`
  - `/admin/work-items/:id/edit`

## 本版設計總覽

```text
React SPA
│
├─ Router
│  ├─ user routes
│  └─ admin routes
│
├─ Page
│  ├─ 組頁面結構
│  ├─ 讀 route params / search params
│  └─ 串 feature hooks
│
├─ Feature hooks
│  ├─ query
│  ├─ mutation
│  └─ 畫面互動用 helper
│
├─ API module
│  ├─ fetch client
│  ├─ request / response mapping
│  └─ query key 規則
│
└─ ASP.NET Core RESTful API
```

## 專案結構

```text
Frontend/MyWorkItem.App/src
├─ app
│  ├─ layouts
│  ├─ providers
│  └─ router
├─ api
│  ├─ client
│  ├─ mappers
│  └─ queryKeys
├─ components
├─ features
│  ├─ admin-work-items
│  ├─ auth-mock
│  └─ work-items
├─ pages
├─ styles
└─ types
```

## 模組責任

### app

- 放全域初始化責任。
- 主要包含：
  - router 組裝
  - QueryClientProvider
  - mock auth provider
  - App layout

### api

- 放所有 HTTP 邊界邏輯。
- 主要包含：
  - `fetch` client
  - API request functions
  - response mapping
  - query key helper
- 原則：
  - page 不直接手寫 `fetch`
  - feature hooks 透過 api module 取資料

### features/work-items

- 放前台使用者流程。
- 主要包含：
  - list query
  - detail query
  - confirm mutation
  - revert mutation
  - list 選取狀態 helper

### features/admin-work-items

- 放 admin 寫入流程。
- 主要包含：
  - create mutation
  - update mutation
  - delete mutation
  - admin form helper
- read side 先重用 `work-items` feature 的 query，不另做重複 read flow。

### features/auth-mock

- 放 mock auth 與 user switcher。
- 主要包含：
  - mock user profiles
  - current mock user state
  - localStorage 同步
  - request header 注入來源
- UI 元件 `UserSwitcher` 放在 `components`。
- `features/auth-mock` 只負責 state 與行為，不承擔畫面外觀。

### pages

- page 只做組頁與互動編排。
- 不直接承擔完整資料抓取細節。
- page 主要責任：
  - route params / search params
  - 呼叫 feature hooks
  - loading / error / empty state 呈現

### components

- 放跨 page 可重用 UI 區塊。
- 例如：
  - AppShell
  - DataState 區塊
  - WorkItemTable
  - WorkItemForm
  - UserSwitcher

## Route 設計

```text
/
└─ redirect -> /work-items

/work-items
├─ 使用者列表頁
└─ search param
   └─ sortDirection=asc|desc

/work-items/:id
└─ 使用者詳情頁

/admin/work-items
└─ admin 列表頁

/admin/work-items/new
└─ admin 建立頁

/admin/work-items/:id/edit
└─ admin 編輯頁
```

## Layout 與導覽

```text
AppShell
│
├─ header
│  ├─ app title
│  ├─ user switcher
│  └─ admin nav entry (只有 Admin 顯示)
│
└─ main
   └─ route outlet
```

- 一般使用者只看得到 user routes 導航。
- Admin 額外看得到 admin 導航。
- 非 Admin 直接進 admin route 時，由 route guard 擋下。

## 狀態設計

### server state

```text
server state
│
├─ work-items list
├─ work-item detail
├─ create result
├─ update result
└─ delete / confirm / revert 後的重新同步結果
```

- 全部交由 TanStack Query 管理。
- server state 不手動複製到多份 local state。

### local UI state

```text
local UI state
│
├─ list 已勾選 ids
├─ create / edit form 值
├─ sort UI 控制值
└─ mock current user
```

- checkbox 選取保留在頁面本地。
- form state 保留在表單本地。
- mock current user 需同步到 localStorage。

## API 設計

### API base URL

- 來自：
  - `VITE_API_BASE_URL`
- 預設開發值：
  - `http://localhost:5032`

### request header 策略

```text
fetch request
│
├─ 讀目前 mock current user
├─ 注入 X-Mock-User-Id
├─ 注入 X-Mock-User-Name
└─ 注入 X-Mock-Role
```

- Phase 1 的 app 初始化一定會先解析出一個 mock current user：
  - localStorage 有合法值就沿用
  - 否則 fallback 到預設 `User A`
- 因此目前 request header 會一律跟隨已解析出的 mock current user。
- API response 錯誤由統一 API client 正規化後再交給 hooks / page。

## Query Key 設計

```text
work-items list
  -> ['work-items', { userId, sortDirection }]

work-item detail
  -> ['work-item', { userId, workItemId }]
```

- `userId` 必須進 query key。
- 原因：
  - status 是個人化資料
  - 切換 mock user 後，不能沿用舊使用者 cache
- admin read page 若重用一般 read API，也直接沿用同一組 query key 規則。

## QueryClient defaults

本版基線：

- `retry = 1`
- `refetchOnWindowFocus = false`
- `refetchOnReconnect = false`
- `staleTime = 30 seconds`

目的：
- 避免開發期被 query 預設行為干擾
- 降低切頁與切 focus 時的意外 refetch
- 讓 agent 擴寫時有固定基線

## API 與頁面對應

### 使用者列表頁

```text
/work-items
│
├─ 讀取 search param: sortDirection
├─ useWorkItemsQuery
│  └─ GET /api/work-items
├─ 本地維護 selectedWorkItemIds
└─ useConfirmWorkItemsMutation
   └─ POST /api/work-items/confirm
```

### 使用者詳情頁

```text
/work-items/:id
│
├─ 讀取 path param: id
├─ useWorkItemDetailQuery
│  └─ GET /api/work-items/{id}
└─ useRevertWorkItemConfirmationMutation
   └─ POST /api/work-items/{id}/revert-confirmation
```

### admin 列表頁

```text
/admin/work-items
│
├─ route guard: Admin only
├─ useWorkItemsQuery
│  └─ 重用 GET /api/work-items
│     └─ Phase 1 固定帶 sortDirection=desc
└─ useDeleteWorkItemMutation
   └─ DELETE /api/admin/work-items/{id}
```

- 若列表顯示 `status`，其來源仍是 shared read API。
- 也就是說，status 代表目前 admin 自己的個人狀態，不是全域管理狀態。
- delete action 在 Phase 1 先走一次原生確認步驟，再真的送出 mutation。

### admin 建立頁

```text
/admin/work-items/new
│
├─ route guard: Admin only
├─ WorkItemForm
└─ useCreateWorkItemMutation
   └─ POST /api/admin/work-items
```

### admin 編輯頁

```text
/admin/work-items/:id/edit
│
├─ route guard: Admin only
├─ useWorkItemDetailQuery
│  └─ 重用 GET /api/work-items/{id}
├─ WorkItemForm
└─ useUpdateWorkItemMutation
   └─ PUT /api/admin/work-items/{id}
```

- edit page 讀 detail API 主要是為了拿：
  - `title`
  - `description`
- detail response 內的 `status` 不進表單，也不是 admin 可編輯欄位。

## Mutation 後同步規則

### confirm

```text
confirm 成功
│
├─ 清空 selectedWorkItemIds
├─ invalidate ['work-items', *]
└─ invalidate 受影響的 ['work-item', { userId, workItemId }]
```

### revert

```text
revert 成功
│
├─ invalidate ['work-items', *]
└─ invalidate ['work-item', { userId, workItemId }]
```

### create

```text
create 成功
│
├─ invalidate ['work-items', *]
└─ navigate -> /admin/work-items
```

### update

```text
update 成功
│
├─ invalidate ['work-items', *]
├─ invalidate ['work-item', { userId, workItemId }]
└─ navigate -> /admin/work-items
```

### delete

```text
delete 成功
│
├─ invalidate ['work-items', *]
├─ remove / ignore deleted detail cache
└─ stay on admin list page
```

## 表單設計

### WorkItemForm

欄位：
- `title`
- `description`

規則：
- `title`
  - required
  - trim 後不可空
- `description`
  - 可空

表單用途：
- create 與 update 共用同一個表單元件
- page 層只決定：
  - 初始值
  - submit 時打哪支 mutation

## 錯誤呈現設計

```text
query error
  -> 頁面級 error state

mutation validation error
  -> 表單欄位或操作區顯示錯誤

not found
  -> 頁面級 not found state

forbidden
  -> route guard 顯示 forbidden state
```

- 不吞錯。
- 不把 loading / empty / error 混成同一種狀態。

## mock auth 設計

### 本版 mock profiles

至少提供：
- 一位一般使用者 A
- 一位一般使用者 B
- 一位管理者

### cold start 行為

```text
App 初始化
│
├─ 先讀 localStorage
│  ├─ 有已保存 mock user -> 直接使用
│  └─ 沒有 -> 採用預設 User A
│
└─ 後續 fetch header 一律跟隨目前 mock user
```

### 切換效果

```text
切換 mock user
│
├─ 更新 context state
├─ 寫入 localStorage
├─ 後續 fetch header 改用新值
└─ 觸發使用者相關 query 重取
```

## 非功能方向

- 不使用 Next.js。
- 不使用 axios。
- 不先導入大型 UI library。
- 先優先穩定：
  - route
  - state
  - API 邊界
  - mutation 後同步

## 待確認但不阻塞本版

- 列表排序 UI 最終元件形式。
- 是否需要顯示全選功能。
- admin 列表是否需要更多欄位。
- 是否要在 admin create / update / delete 成功後顯示 toast。
