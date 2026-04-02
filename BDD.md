# Frontend BDD

## 文件定位

- 本文件定義前端目前要達成的可觀察行為。
- 本文件以 route、畫面互動、資料同步、權限切換、錯誤呈現為主。
- 本文件目標是讓後續頁面、feature hooks、測試案例能直接對應。
- 本文件不保留空章節，也不寫「之後再補」的 placeholder。

## 來源明文

- 需要提供可操作 UI。
- 前台需要：
  - Work Item 列表
  - Work Item 詳情
  - 確認
  - 撤銷確認
- 管理端需要：
  - 新增
  - 修改
  - 刪除
- 需要前後端分離。

## 本版實作基線

- 前端採單一 React SPA。
- 同一個 SPA 同時承載：
  - 一般使用者流程
  - admin 流程
- Phase 1 不做正式登入畫面。
- Phase 1 以前端 mock user switcher 提供目前使用者資訊：
  - `userId`
  - `userName`
  - `role`
- Phase 1 至少準備 3 組 mock profiles：
  - `User A`
  - `User B`
  - `Admin`
- mock user 資訊需保留在瀏覽器本地，重新整理後仍可沿用。
- 若 app 啟動時找不到已保存的 mock user：
  - 自動採用預設 `User A`
  - 讓 app 可直接進入主流程
- 前端 HTTP client 使用原生 `fetch`。
- 前端 server state 使用 `TanStack Query`。
- 前端不做 pagination / search / filter。
- admin 讀取面目前不依賴獨立 admin read API：
  - admin 列表頁重用 `GET /api/work-items`
  - admin 編輯頁重用 `GET /api/work-items/{id}`
- 路由基線如下：
  - `/`
  - `/work-items`
  - `/work-items/:id`
  - `/admin/work-items`
  - `/admin/work-items/new`
  - `/admin/work-items/:id/edit`

## 名詞定義

- `server state`
  - 來自 API 的資料，例如 Work Item 列表、詳情、確認結果。
- `local UI state`
  - 只存在前端畫面當下的狀態，例如 checkbox 選取、表單輸入值。
- `mock current user`
  - 前端目前用來模擬登入者的本地資料。
- `admin read reuse`
  - admin 的列表與編輯頁讀取資料時，先重用一般 read API，而非另做新 read endpoint。

## 系統總規則

```text
前端狀態責任
│
├─ server state
│  ├─ work item list
│  ├─ work item detail
│  ├─ confirm / revert 結果
│  └─ admin create / update / delete 結果
│
└─ local UI state
   ├─ list checkbox 選取
   ├─ form 輸入值
   ├─ route 當下互動狀態
   └─ mock user switcher 選擇
```

- 前台頁面顯示的 `status` 一律依目前 mock current user 視角解讀。
- checkbox 選取只屬於目前列表頁的 local UI state，不寫回後端。
- confirm 成功後，前端需以最新 server state 重算列表 / 詳情畫面。
- revert 成功後，前端需以最新 server state 重算列表 / 詳情畫面。
- admin flow 只改 Work Item 主資料，不直接操作其他使用者的個人狀態。
- admin 讀取頁若顯示 `status`，目前也只代表「目前 admin 自己的個人狀態」。
- admin 列表頁 Phase 1 固定使用 `desc` 排序，不另外提供排序切換 UI。

## 路由行為

### F-ROUTE-001 首頁導向

```text
Given
  使用者進入 `/`
When
  App 完成初始化
Then
  前端導向 `/work-items`
```

### F-ROUTE-002 非 admin 不可進入 admin route

```text
Given
  目前 mock current user 不是 Admin
When
  嘗試進入 `/admin/work-items` 或其子路由
Then
  不可進入 admin 頁面主內容
  畫面需明確顯示 forbidden 狀態
  不執行 admin mutation
```

## mock 使用者初始化

### F-AUTH-000 app 啟動時沒有已保存的 mock user

```text
Given
  使用者第一次打開 app
  或本地已沒有保存的 mock user
When
  App 完成初始化
Then
  前端自動採用預設 `User A`
  畫面可直接進入 `/work-items`
  後續 request header 使用預設使用者資訊
```

## 使用者流程

### F-USER-001 顯示 Work Item 列表

```text
Given
  目前 mock current user 已存在
When
  使用者進入 `/work-items`
Then
  畫面先顯示 loading 狀態
  取得資料後顯示列表
  每列至少包含：
    - id
    - title
    - status
    - checkbox
  畫面提供 confirm 操作入口
```

### F-USER-002 列表排序切換

```text
Given
  使用者位於 `/work-items`
When
  使用者切換排序方向
Then
  前端更新 route query 狀態
  並以新排序條件重新取得列表
  若未指定排序
    -> 使用 `desc`
```

### F-USER-003 列表顯示 Pending 狀態

```text
Given
  使用者位於 `/work-items`
  且 API 已回傳某筆 Work Item 的 status = Pending
When
  列表完成渲染
Then
  該筆狀態正確顯示為 `Pending`
```

### F-USER-004 勾選多筆並確認

```text
Given
  使用者位於 `/work-items`
  且已勾選至少一筆 Work Item
When
  使用者送出 confirm
Then
  前端送出 confirm request
  request 只帶目前勾選的 Work Item ids
  成功後：
    - 清空目前勾選
    - 重新同步列表資料
    - 已受影響的項目顯示為 Confirmed
```

### F-USER-004A confirm 失敗時保留目前畫面狀態

```text
Given
  使用者位於 `/work-items`
  且目前已有勾選資料
When
  confirm request 失敗
Then
  畫面顯示操作錯誤訊息
  不顯示假成功結果
  目前勾選內容保留
```

### F-USER-005 未勾選時不可確認

```text
Given
  使用者位於 `/work-items`
  且目前沒有勾選任何 Work Item
When
  畫面渲染 confirm 操作區
Then
  confirm 操作應呈現不可送出狀態
  不應發送 API request
```

### F-USER-006 顯示 Work Item 詳情

```text
Given
  目前 mock current user 已存在
  且目標 Work Item 存在
When
  使用者進入 `/work-items/:id`
Then
  畫面先顯示 loading 狀態
  成功後顯示：
    - id
    - title
    - description
    - createdAt
    - updatedAt
    - status
```

### F-USER-007 顯示不存在的 Work Item 詳情

```text
Given
  目前 mock current user 已存在
  且目標 Work Item 不存在
When
  使用者進入 `/work-items/:id`
Then
  畫面顯示 not found 狀態
  不顯示假資料
```

### F-USER-008 在詳情頁撤銷確認

```text
Given
  使用者位於 `/work-items/:id`
  且目前 status 為 Confirmed
When
  使用者送出撤銷確認
Then
  前端送出 revert request
  成功後：
    - 詳情頁 status 更新為 Pending
    - 列表資料同步更新
```

### F-USER-008A 撤銷確認失敗時保留原畫面

```text
Given
  使用者位於 `/work-items/:id`
  且目前 status 為 Confirmed
When
  revert request 失敗
Then
  畫面顯示操作錯誤訊息
  詳情頁維持原本狀態
```

### F-USER-009 詳情頁沒有已確認狀態時不可撤銷

```text
Given
  使用者位於 `/work-items/:id`
  且目前 status 不是 Confirmed
When
  畫面渲染操作區
Then
  不顯示或不可使用撤銷確認操作
```

## 管理流程

### F-ADMIN-001 顯示 admin 列表頁

```text
Given
  目前 mock current user 為 Admin
When
  使用者進入 `/admin/work-items`
Then
  畫面顯示 admin 列表
  每列至少有：
    - id
    - title
    - status
    - edit action
    - delete action
  並提供前往新增頁的入口
  其中 status 若顯示，語意仍是目前 admin 自己的個人狀態
  不代表全域管理狀態
  本版列表固定使用 `desc` 排序
```

### F-ADMIN-002 建立 Work Item

```text
Given
  目前 mock current user 為 Admin
When
  使用者進入 `/admin/work-items/new`
  並提交合法表單
Then
  前端送出 create request
  成功後導回 admin 列表頁
  並可看到新資料
```

### F-ADMIN-003 建立 Work Item 時 title 為空

```text
Given
  目前 mock current user 為 Admin
When
  使用者在建立頁提交空白 title
Then
  表單顯示驗證錯誤
  不發送 create request
```

### F-ADMIN-004 更新 Work Item

```text
Given
  目前 mock current user 為 Admin
  且目標 Work Item 存在
When
  使用者進入 `/admin/work-items/:id/edit`
  並提交合法表單
Then
  前端先載入目標資料
  再送出 update request
  成功後導回 admin 列表頁
  並可看到更新後結果
  編輯表單只使用：
    - title
    - description
  不把 detail response 內的 status 當成可編輯欄位
```

### F-ADMIN-005 更新不存在的 Work Item

```text
Given
  目前 mock current user 為 Admin
  且目標 Work Item 不存在
When
  使用者進入 `/admin/work-items/:id/edit`
Then
  畫面顯示 not found 狀態
  不顯示可提交的主表單
```

### F-ADMIN-006 刪除 Work Item

```text
Given
  目前 mock current user 為 Admin
  且目標 Work Item 存在
When
  使用者在 admin 列表頁執行 delete
Then
  畫面先要求一次刪除確認
  使用者確認後才送出 delete request
  成功後重新同步列表
  被刪除資料不再顯示
```

### F-ADMIN-006A 刪除失敗時保留目前列表

```text
Given
  目前 mock current user 為 Admin
  且目標 Work Item 原本顯示在 admin 列表內
When
  delete request 失敗
Then
  畫面顯示操作錯誤訊息
  該筆資料仍留在列表中
```

## mock 使用者切換

### F-AUTH-001 切換使用者後重算資料視角

```text
Given
  App 目前已有 mock current user
When
  使用者透過 user switcher 切換到另一個 user
Then
  前端更新本地 mock auth 狀態
  後續 request header 使用新的 user 資訊
  work item list / detail query 需重新同步
```

### F-AUTH-002 切換成 Admin 後可見 admin 入口

```text
Given
  App 目前顯示一般使用者畫面
When
  使用者切換 role 為 Admin
Then
  畫面顯示 admin 導航入口
  可進入 admin routes
```

## 共通畫面狀態

### F-UI-001 loading 狀態

```text
Given
  任一 page 正在等待 query 回應
When
  畫面尚未取得資料
Then
  頁面需顯示可辨識的 loading 狀態
  不直接顯示空白頁
```

### F-UI-002 API error 狀態

```text
Given
  query 或 mutation 發生 API error
When
  前端接收到錯誤回應
Then
  頁面需顯示可辨識的錯誤訊息
  不吞錯
```

### F-UI-003 empty 狀態

```text
Given
  列表查詢成功
  但沒有任何資料
When
  畫面完成渲染
Then
  頁面需顯示 empty state
  不把 empty 與 loading 混在一起
```

## 待確認但不阻塞本版

- 前台列表的排序 UI 最終採按鈕、下拉、或表頭切換。
- admin 列表頁欄位是否需要額外顯示 description / updatedAt。
- create / update 成功後是否顯示 toast，或只靠頁面導回表達成功。
