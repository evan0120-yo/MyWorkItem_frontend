# Frontend CODE REVIEW

## BLOCK 1: AI 對產品的想像

我現在看到的前端，比較像一個單頁式的內部 Work Item 操作台。

它的目標很直接：
- 一般使用者看列表、看詳情、做確認、做撤銷確認
- 管理者在同一個 SPA 裡新增、修改、刪除 Work Item

它刻意不把問題做大。前端現在的重點不是：
- 正式登入
- 多層角色系統
- 很厚的 component library
- 很重的全域狀態管理

它比較像是：
- 一個 React SPA
- 用 mock user switcher 取代正式登入
- 把 server state 交給 TanStack Query
- 把 local UI state 留在頁面本地
- 讓 admin 先重用 user read API，而不是先拆一套 admin read side

我對它的規模想像是小到中型前台，不像完整平台。

它不是什麼：
- 不是 Next.js / SSR / SEO 專案
- 不是正式 JWT / session auth 前端
- 不是有 pagination / search / filter 的成熟管理台
- 不是已經有 E2E 與完整 design system 的大型前端

## BLOCK 2: 讀者模式

### 1. 啟動與目前使用者

這個前端一打開，就是標準 React SPA 啟動流程。

```text
進 App
  │
  ├─ AppProviders
  │  ├─ QueryClientProvider
  │  └─ MockAuthProvider
  │
  └─ AppRouter
     └─ BrowserRouter + routes
```

目前沒有登入頁。

前端會先從 localStorage 找目前的 mock user。

```text
進 MockAuthProvider
  │
  ├─ localStorage 有已保存的 mock user？
  │    ├─ 有 -> 驗證是否仍符合目前 profiles
  │    │        ├─ 符合 -> 採用該 user
  │    │        └─ 不符合 -> fallback 預設 User A
  │    └─ 沒有 -> 預設 User A
  │
  └─ 後續切換 user 時，再同步寫回 localStorage
```

畫面上方永遠有 `UserSwitcher`。
如果目前角色是 `Admin`，header 內才會出現 admin 導航入口。

> 注意: 這不是正式登入，也沒有 token、session、refresh token。

> 注意: 首頁 `/` 會直接導到 `/work-items`，未知路由也會被導回 `/work-items`。

### 2. 前台列表

列表頁是這個前端最核心的讀寫混合畫面。

它一進來會先讀目前 mock user，再用 query string 決定排序方向，最後去打 `GET /api/work-items`。

```text
進 /work-items
  │
  ├─ 讀目前 mock user
  ├─ 讀 search param: sortDirection
  │    ├─ asc -> 用 asc
  │    └─ 其他 / 空白 -> 用 desc
  │
  ├─ useWorkItemsQuery
  │    └─ 打 /api/work-items?sortDirection=...
  │
  └─ 根據結果顯示
       ├─ pending -> loading panel
       ├─ error   -> error panel
       ├─ empty   -> empty panel
       └─ success -> WorkItemTable
```

這頁有兩種狀態：

- server state
  - work item list
- local UI state
  - checkbox 勾選
  - selected count

勾選不會寫回後端，只存在這個頁面本地。

送出 confirm 時，前端只把目前勾選的 ids 打出去。

```text
按 Confirm selected
  │
  ├─ 沒勾選 -> 按鈕 disabled，不送 request
  └─ 有勾選 -> POST /api/work-items/confirm
        │
        ├─ success
        │    ├─ invalidate 所有 list
        │    ├─ invalidate 受影響 detail
        │    └─ clearSelection
        │
        └─ fail
             ├─ 顯示 error notice
             └─ 保留目前勾選
```

> 注意: 這頁顯示的 `status` 是 API 已經回傳好的目前使用者個人狀態，前端沒有自己再做一套 Pending fallback 邏輯。

> 注意: 切換 user 或切換 sortDirection 時，這頁會主動清空目前勾選。

### 3. 前台詳情與撤銷確認

詳情頁是單筆 Work Item 的查看與單筆狀態操作。

```text
進 /work-items/:id
  │
  ├─ 讀 path param: id
  ├─ useWorkItemDetailQuery
  │    └─ 打 GET /api/work-items/{id}
  │
  └─ 根據結果顯示
       ├─ pending -> loading panel
       ├─ 404     -> not found panel
       ├─ error   -> error panel
       └─ success -> detail 畫面
```

這頁會顯示：
- id
- title
- description
- createdAt
- updatedAt
- status

只有當 `status === Confirmed` 時，畫面才會顯示 `Revert confirmation` 按鈕。

```text
按 Revert confirmation
  │
  ├─ POST /api/work-items/{id}/revert-confirmation
  │
  ├─ success
  │    ├─ invalidate 所有 list
  │    └─ invalidate 目前 detail
  │
  └─ fail
       └─ 顯示 error notice
```

如果目前已經是 `Pending`，右側不會有按鈕，而是顯示提示文字。

> 注意: 這頁的 `status` 依然只是目前 mock user 的個人狀態，不是全域 Work Item 狀態。

### 4. admin 列表與刪除

admin route 不會 redirect 回一般頁面，而是直接渲染 forbidden 狀態。

```text
進 AdminRoute
  │
  ├─ currentUser.role === Admin ?
  │    ├─ 否 -> forbidden panel
  │    └─ 是 -> render child route
```

admin 列表頁本身沒有獨立 read API，它直接重用一般列表 API，而且固定帶 `desc`。

```text
進 /admin/work-items
  │
  ├─ route guard: Admin only
  ├─ useWorkItemsQuery(currentUser, 'desc')
  └─ 根據結果顯示
       ├─ pending -> loading panel
       ├─ error   -> error panel
       ├─ empty   -> empty panel + create CTA
       └─ success -> WorkItemTable + Edit/Delete
```

delete 現在先走一次原生 `window.confirm`。

```text
按 Delete
  │
  ├─ window.confirm
  │    ├─ false -> 直接結束
  │    └─ true  -> DELETE /api/admin/work-items/{id}
  │
  ├─ success
  │    ├─ invalidate 所有 list
  │    └─ remove 目標 detail cache
  │
  └─ fail
       └─ 顯示 error notice
```

目前刪除中的 loading 文案只會顯示在正在刪的那一列，不會整張表一起變成 `Deleting...`。
但只要 delete request 尚未完成，其他 delete 按鈕也會先一併 disabled，避免在同一張列表上重複觸發第二次刪除。

> 注意: admin 列表上的 `status` 仍然是「目前 admin 自己」的個人狀態，不是管理者視角的全域欄位。

> 注意: 現在沒有 admin 專用 read endpoint，也沒有 admin 列表排序切換 UI。

### 5. admin 建立與編輯

create 和 edit 共用同一個 route component，但現在內部已經拆成兩個模式元件：
- create mode
- edit mode

```text
進 AdminWorkItemFormPage
  │
  ├─ 有 id ?
  │    ├─ 否 -> AdminWorkItemCreateContent
  │    └─ 是 -> AdminWorkItemEditContent
```

create mode 只初始化 create mutation，不會再去建立 edit 專用 query / mutation。

```text
/admin/work-items/new
  │
  ├─ WorkItemForm
  ├─ title 空白？-> 表單錯誤
  └─ 合法 -> POST /api/admin/work-items
        └─ success -> 回 admin list
```

edit mode 會先用共享 detail API 讀既有資料，再把 `title` / `description` 帶進表單。

```text
/admin/work-items/:id/edit
  │
  ├─ 先讀 GET /api/work-items/{id}
  │    ├─ pending -> loading panel
  │    ├─ 404     -> not found panel
  │    ├─ error   -> error panel
  │    └─ success -> 開表單
  │
  └─ 送出 PUT /api/admin/work-items/{id}
       └─ success -> 回 admin list
```

這個表單目前只有一條前端驗證：
- `title` 不可空白

送出前會先 trim：
- `title`
- `description`

> 注意: edit mode 雖然是用共享 detail API 進來，但 detail response 內的 `status` 不進表單，也不是可編輯欄位。

### 6. 錯誤與畫面狀態

這個前端的頁面狀態相對一致，幾乎都收斂成：

```text
query / mutation
  │
  ├─ pending -> StatePanel
  ├─ error   -> StatePanel / ErrorNotice
  ├─ empty   -> StatePanel
  └─ success -> 正常畫面
```

API 錯誤會先被 `apiClient` 正規化成 `ApiClientError`，頁面通常不直接處理 `fetch` 的細節。

```text
apiRequest
  │
  ├─ network error -> ApiClientError("Unable to reach the API right now.")
  ├─ !ok           -> 讀 ProblemDetails -> ApiClientError
  ├─ 204 / 不期待 JSON -> void
  └─ JSON success  -> 交給 mapper / caller
```

> 注意: 畫面上的錯誤文字大多直接取 `ApiClientError.detail` 或 `message`。

> 注意: 現在沒有 optimistic UI；所有 mutation 成功後都是靠 invalidate / refetch 回同步畫面。

## BLOCK 3: 技術補充

### 1. 啟動 wiring

```text
main.tsx
  -> React.StrictMode
  -> App

App.tsx
  -> AppProviders
     -> QueryClientProvider
     -> MockAuthProvider
  -> AppRouter
```

Router：

```text
/
  -> redirect /work-items

/work-items
/work-items/:id
/admin/work-items
/admin/work-items/new
/admin/work-items/:id/edit

*
  -> redirect /work-items
```

目前使用 `BrowserRouter`，並開了 React Router future flags：
- `v7_startTransition`
- `v7_relativeSplatPath`

### 2. mock auth

profiles 目前固定 3 組：

```text
User A
User B
Admin
```

localStorage key：
- `my-work-item.mock-current-user`

request headers：
- `X-Mock-User-Id`
- `X-Mock-User-Name`
- `X-Mock-Role`

目前 mock user 的驗證比較嚴格，會同時比：
- `userId`
- `userName`
- `role`

如果 localStorage 內容和目前 profiles 對不上，就 fallback 回預設 `User A`。

### 3. QueryClient 與 query keys

QueryClient defaults：
- `retry = 1`
- `staleTime = 30s`
- `refetchOnWindowFocus = false`
- `refetchOnReconnect = false`
- mutation `retry = 0`

query keys：

```text
list
  -> ['work-items', { userId, sortDirection }]

detail
  -> ['work-item', { userId, workItemId }]

all lists prefix
  -> ['work-items']
```

`userId` 被刻意放進 key。
這樣切換 mock user 之後，不會把前一個人的 personal status cache 誤拿來顯示。

### 4. API module

API base URL：
- `VITE_API_BASE_URL`
- 沒設時預設 `http://localhost:5032`

目前 API module 的責任是：

```text
apiRequest
  ├─ 補 mock auth headers
  ├─ 做 fetch
  ├─ 正規化錯誤
  └─ 回傳 JSON 或 void

workItemsApi
  ├─ getWorkItems
  ├─ getWorkItemDetail
  ├─ confirmWorkItems
  ├─ revertWorkItemConfirmation
  ├─ createWorkItem
  ├─ updateWorkItem
  └─ deleteWorkItem

workItemMappers
  ├─ list response mapping
  ├─ detail response mapping
  └─ admin item mapping
```

目前 mapper 只是做欄位整理，不做 runtime schema validation。

### 5. mutation 後同步規則

```text
confirm
  -> invalidate all lists
  -> invalidate affected details
  -> clear selection

revert
  -> invalidate all lists
  -> invalidate current detail

create
  -> invalidate all lists
  -> navigate /admin/work-items

update
  -> invalidate all lists
  -> invalidate current detail
  -> navigate /admin/work-items

delete
  -> invalidate all lists
  -> remove current detail cache
```

這套規則現在主要靠 page flow tests 觀察，不是每一條都拆成獨立 hook test。

### 6. 共用 UI 元件

`WorkItemTable`
- 可同時支援 user list 與 admin list
- user 模式可勾選
- admin 模式可顯示 `Edit` / `Delete`
- 現在支援 per-row action label 與 disable 狀態

`WorkItemForm`
- create / edit 共用
- 只做 title required 驗證
- 會在 `initialValues` 改變時重置表單值

`StatePanel`
- 統一 loading / empty / not found / forbidden / error 這類面板

`ErrorNotice`
- 統一 mutation / query 的細節錯誤顯示

### 7. 自動化測試現況

目前前端測試重心是：
- route / page flow tests
- auth mock tests
- query key / header utility tests

現在已有的自動化範圍包含：
- 列表 loading / success / error / empty / confirm
- 詳情 loading / not found / revert
- admin forbidden / list / delete
- admin create / edit
- mock user cold start / 切換 user
- query keys
- mock auth headers

目前沒有：
- E2E
- 視覺回歸
- 純樣式 snapshot

### 8. 目前限制

目前真相如下：
- 沒有正式 auth
- 沒有 JWT
- 沒有 pagination / search / filter
- 沒有 admin 專用 read API
- 沒有 optimistic update
- delete 確認仍是原生 `window.confirm`
- `status` 在前台與 admin 讀取畫面都只代表目前使用者自己的 personal status
