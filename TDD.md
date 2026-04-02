# Frontend TDD

## 文件定位

- 本文件定義前端目前的測試設計與驗證策略。
- 本文件中的 `TDD` 代表本版測試驅動與測試設計規劃。
- 本文件目標不是要求先把所有 executable tests 寫完才開始做畫面。
- 本文件目標是：
  - 先把測試範圍定清楚
  - 每條前端流程做完時立刻補齊對應測試
  - 測試直接對應 BDD 與 route / page / hook 行為

## 本版測試原則

```text
先文件
│
├─ BDD
├─ SDD
└─ TDD

再進實作
│
├─ 每次只進一條垂直流程
├─ 該流程一次做到位
├─ 畫面 / hook / API 串接完成後立刻補測試
└─ 通過後再進下一條
```

- 不採「前端所有測試先寫滿再開始組頁」。
- 不採「頁面都寫完了最後才一起補測試」。
- 不接受只有 route / page 外型存在，但互動與狀態完全沒驗證。

## 本版測試工具基線

- `Vitest`
- `React Testing Library`
- `@testing-library/user-event`

API 隔離策略：

- 第一優先：mock `fetch`
- 若後續 API 模擬需求變多，再補 handler 層

## 測試範圍

### 第一優先

- route 與 page flow tests
- hook / utility 的關鍵規則測試
- mock auth switcher 測試
- form 與操作區的互動測試

### 第二優先

- 共用 component 的互動測試
- query key 與 invalidate 規則測試

### 目前不優先

- 純樣式快照測試
- E2E 瀏覽器自動化
- 對第三方 library 行為本身的測試

### 補充驗證層

- 除了預設的 mock fetch page flow tests，另補一條 live API smoke test。
- 這條 smoke test 的目的：
  - 直接渲染前端頁面
  - fetch 改打 live backend
  - 把 user flow、admin CRUD 與真資料庫一起驗證
- 這條 smoke test 不是完整瀏覽器 E2E。
- CORS 仍需另外用真 preflight 驗證。

## 測試檔案結構

```text
Frontend/MyWorkItem.App/src
├─ app
│  └─ router
│     └─ __tests__
├─ features
│  ├─ work-items
│  │  └─ __tests__
│  └─ auth-mock
│     └─ __tests__
└─ test
   ├─ renderApp.tsx
   ├─ mockFetch.ts
   └─ setup.ts
```

- 目前 page flow tests 都集中在 `app/router/__tests__`：
  - user list / detail
  - admin list
  - admin create / edit
- live API smoke test 也放在 `app/router/__tests__`
- feature 資料夾內的測試目前只保留：
  - query key / utility tests
  - auth mock tests

## 測試分層策略

### Route / Page flow tests

- 驗證 route 進入後的完整可見行為。
- 主要驗證：
  - loading
  - success
  - error
  - empty
  - forbidden
  - not found

### Feature hook / utility tests

- 驗證 query / mutation 行為，或其抽出的關鍵 utility。
- 主要驗證：
  - 呼叫參數
  - invalidate 規則
  - 成功 / 失敗時的 callback 行為
- 目前基線：
  - page flow tests 優先驗證可觀察行為
  - utility tests 補 query key 與 auth header 組裝
- 若同一條規則已在 page / auth flow test 內被明確觀察到：
  - 例如 refetch 後結果
  - 例如切換 user 後 header 與重新取數
  則可不重複再寫一份完全同構的 hook test。
- 若某條 invalidate / callback 規則無法從 page flow 清楚觀察：
  - 再補獨立 hook test。

### Auth mock tests

- 驗證 mock user switcher。
- 主要驗證：
  - profile 切換
  - localStorage 同步
  - request header 更新

## 測試資料策略

```text
測試資料來源
│
├─ work item list response
├─ work item detail response
├─ confirm / revert response
├─ create / update / delete response
└─ mock current user profiles
```

- 每個測試只準備最小必要資料。
- query client 不可讓案例彼此污染。
- 目前做法是共用 app query client，但在每個測試後：
  - `clear cache`
  - `cleanup`
  - `clear localStorage`
  - `restore mocks`

## 優先流程測試清單

### T-UI-001 WorkItemsPage

```text
要驗證
│
├─ 進頁先顯示 loading
├─ 成功後顯示列表欄位
├─ API 回傳 Pending 時正確顯示 Pending
├─ 勾選後該列會顯示 selected 狀態
├─ sortDirection 變更會觸發重新取數
├─ 成功但無資料時顯示 empty state
├─ 未勾選時 confirm 不可送出
├─ confirm 成功後會清空勾選並同步資料
├─ confirm 成功後顯示 success message
├─ 列表中 Confirmed 項目可執行 revert
├─ revert 成功後列表重新顯示 Pending
└─ confirm / revert 失敗時顯示操作錯誤且保留原狀態
```

### T-UI-002 WorkItemDetailPage

```text
要驗證
│
├─ 進頁先顯示 loading
├─ 成功時顯示 detail 欄位
├─ not found 時顯示 not found state
├─ status = Confirmed 時可執行 revert
├─ revert 前需先經過確認步驟
├─ revert 成功後 detail 重新顯示 Pending
├─ revert 成功後顯示 success message
├─ revert 失敗時顯示操作錯誤
└─ 返回列表時保留 sortDirection query
```

### T-UI-003 AdminWorkItemsPage

```text
要驗證
│
├─ 只有 Admin 可進入
├─ 進頁先顯示 loading
├─ 可顯示 admin 列表與 action
├─ 會以 desc 條件讀取列表
├─ delete 前需先經過確認步驟
├─ delete 成功後列表同步更新
├─ delete 成功後顯示 success message
├─ delete 失敗時顯示操作錯誤
└─ 非 Admin 進入時顯示 forbidden state
```

### T-UI-004 AdminWorkItemCreatePage

```text
要驗證
│
├─ title 空白時顯示表單錯誤
├─ 合法提交時送出 create mutation
└─ 成功後導回 admin 列表並顯示 success message
```

### T-UI-005 AdminWorkItemEditPage

```text
要驗證
│
├─ 進頁先讀目標資料
├─ 進頁先顯示 loading
├─ 目標不存在時顯示 not found state
├─ title 空白時顯示表單錯誤
└─ 更新成功後導回 admin 列表並顯示 success message
```

### T-UI-006 UserSwitcher

```text
要驗證
│
├─ app 在沒有 localStorage 時會採用預設 User A
├─ 可切換不同 mock user
├─ 切換後 localStorage 同步更新
├─ 後續 request 會使用新 header
└─ user / admin 導航可見性正確切換
```

## 關鍵 hook / utility 測試點

### work-items query / mutation 規則

- `workItemQueryKeys`
  - list key 是否包含 `userId` 與 `sortDirection`
  - detail key 是否包含 `userId` 與 `workItemId`
- `useWorkItemsQuery`
  - 排序參數是否正確帶入 API
  - list 行為目前主要由 page flow test 觀察
- `useConfirmWorkItemsMutation`
  - 成功後是否清空勾選
  - 是否 invalidate list 與相關 detail
  - 目前主要由 page flow test 觀察 confirm 後同步結果
- `useRevertWorkItemConfirmationMutation`
  - 是否 invalidate list 與目標 detail
  - 目前主要由 detail page flow test 觀察 revert 後同步結果

### admin-work-items mutation 規則

- `useCreateWorkItemMutation`
  - 成功後是否導回 admin 列表
  - 是否 invalidate list
  - 目前主要由 create page flow test 觀察
- `useUpdateWorkItemMutation`
  - 成功後是否 invalidate list 與目標 detail
  - 是否導回 admin 列表
  - 目前主要由 edit page flow test 觀察
- `useDeleteWorkItemMutation`
  - 成功後是否 invalidate list
  - 目前主要由 admin list flow test 觀察

### auth-mock 規則

- `useMockCurrentUser`
  - 預設值是否正確載入
  - 切換後是否同步 localStorage
- `buildMockAuthHeaders`
  - 是否輸出正確 header

## 錯誤測試矩陣

```text
列表 query 失敗
  -> 顯示頁面級 error state

詳情 404
  -> 顯示 not found state

admin route 非 Admin
  -> 顯示 forbidden state

create / update validation 失敗
  -> 顯示表單錯誤
  -> 目前包含 title required / title max 200 / description max 2000

confirm / revert 失敗
  -> 顯示操作錯誤訊息

delete 失敗
  -> 列表保留原資料並顯示操作錯誤
```

## 測試命名規則

```text
方法名格式
  Subject_Scenario_ExpectedResult
```

範例：

- `WorkItemsPage_WhenNoStatusExists_RendersPending`
- `WorkItemsPage_WhenNoSelection_DisablesConfirmAction`
- `AdminWorkItemEditPage_WhenItemNotFound_RendersNotFound`
- `UserSwitcher_WhenProfileChanges_UpdatesStoredMockUser`

## 測試實作原則

- 主要 user / admin flow 整體至少覆蓋：
  - 成功案例
  - 錯誤案例
  - 權限案例
- 測試名稱直接對應 BDD 行為。
- render helper 必須固定，避免每個測試自己重建一套 provider。
- 目前使用共用 app query client，但每個測試後必須 clear cache，避免案例彼此污染。
- 不把所有互動都堆進單一超長 page test。
- 可以：
  - page flow 測試主要畫面行為
  - hook / utility 測試精準驗證 query key、header、invalidate 與 callback

## 執行順序建議

```text
先做
│
├─ UserSwitcher
├─ WorkItemsPage
├─ WorkItemDetailPage
├─ AdminWorkItemsPage
├─ AdminWorkItemCreatePage
└─ AdminWorkItemEditPage
```

- 這個順序先穩住：
  - mock auth
  - user read flow
  - user write flow
  - admin write flow

## 測試完成定義

- route / page flow 測試通過。
- 主要 mutation 都有成功與錯誤覆蓋。
- mock auth 切換行為有覆蓋。
- 測試名稱能直接對應 BDD 的 Given / When / Then。
- 測試結果能回頭驗證：
  - route
  - UI state
  - API 互動
  - invalidate 行為

## 待確認但不阻塞本版

- 是否在本版就補真正瀏覽器層 E2E。
- delete 是否需要獨立確認彈窗測試。
- 若之後加入 pagination / search，需補列表 query tests。
