# Frontend Question Notes

## 目的

- 記錄目前討論過、但不屬於考題明文規範的前端選型與待確認事項
- 後續可作為討論與決策紀錄

## 目前已定

- 技術方向：React 前端，前後端分離
- React：TypeScript
- 建置工具：Vite
- 樣式方案：Tailwind CSS
- HTTP client：優先使用原生 fetch，不引入 axios
- 資料抓取方案：fetch + TanStack Query
- 權限策略：
  - Phase 1：Mock 權限 / user switcher
  - Phase 2：若有時間，再配合後端補 JWT

## 目前未定

- admin UI 是否放在同一個 React App 中

## 待確認

- 前台列表是否必須顯示「編號」欄
- 詳情頁是否一定要顯示「建立時間」與「最後更新時間」
- admin 端應做成單頁整合，還是拆成 /admin/work-items/new、/admin/work-items/{id}/edit
- 前台有 UI、後台只有 API 的情況，是否仍符合整體題目要求

## 待我們自己決定

- 是否由同一套前端處理前台與 admin 路由

## 討論筆記

- Vite 是 React 專案的開發與打包工具，不是 UI 框架
- Next.js 是 React framework，不只是 bundler
- Next.js 官方定位是用來建 full-stack web applications
- 選 Tailwind CSS 的理由：
  - 開發速度快
  - 列表 / 表單 / admin 頁很適合快速拼裝
  - 對 AI 閱讀畫面結構也相對直接
- 目前前後端仍以 RESTful API 溝通為前提
- 階層關係：
  - React 畫面
  - -> TanStack Query 或自寫 hooks
  - -> 呼叫原生 fetch
  - -> 打 RESTful API
  - -> ASP.NET Core Controllers
- axios 使用策略：
  - 團隊回饋是不優先使用 axios
  - 原因不是「axios 完全不能用」
  - 而是近期官方 advisory 持續出現，若本題沒有明確必要，不想為了 HTTP client 額外承擔套件風險與維護成本
  - 因此前端預設用瀏覽器原生 fetch
- TanStack Query 不是取代 RESTful API
- TanStack Query 是前端管理 server state 的工具：
  - 幫忙處理 loading
  - error
  - cache
  - refetch
  - mutation 後同步更新
- 為本題目前決定：
  - 使用原生 fetch
  - 搭配 TanStack Query
- 簡短理由：
  - 保留 RESTful API 邊界清楚
  - 不額外引入 axios
  - 以 TanStack Query 管理 CRUD 畫面的 server state
  - 對此題的 list / detail / admin CRUD 場景較合適
- Next.js 選型判斷：
  - 這題目前不優先選 Next.js
  - 原因是本題已明確採前後端分離，且後端已選 ASP.NET Core Web API
  - 若再引入 Next.js，會多出 SSR / Server Components / framework routing 的額外複雜度
  - 對本題核心價值不高，反而會稀釋重點

## fetch vs TanStack Query 評估

### 共同前提

- 不管最後選哪個，前後端仍然是 RESTful API 溝通
- fetch / axios / TanStack Query 不是同一層東西
- RESTful API 是後端介面風格
- fetch / axios 是 HTTP client
- TanStack Query 是前端 server state 管理工具

### 選項 A：fetch + 自寫 hooks

- 優點：
  - 依賴最少
  - 心智模型最直接
  - 沒有 TanStack Query 的預設 refetch / retry / staleTime 等隱性行為
  - 小型頁面與低複雜度專案很好控
- 缺點：
  - loading / error / refetch / optimistic update / mutation 後同步更新都要自己處理
  - list / detail / admin CRUD 一多時，重複碼容易快速增加
  - 若多人協作或 AI 持續補碼，容易出現每頁各寫一套資料抓取風格

### 選項 B：fetch + TanStack Query

- 優點：
  - 保留原生 fetch，避免 axios 額外依賴
  - 對 list / detail / create / update / delete 這種 CRUD 場景很友善
  - 內建 cache、background refetch、retry、mutation 後失效刷新
  - 若 query key、hook 命名規則固定，擴充速度會比純 fetch 快
- 缺點：
  - 需要理解 query key、invalidate、staleTime、retry 等概念
  - 預設行為若沒先講清楚，容易讓新手或 AI 誤判
  - 若設定不當，可能出現比預期更多的 refetch

### 高流量 / 高併發 / 複雜邏輯下的差異

- 對伺服器真正的高併發壓力，核心仍在後端 API、DB、索引、快取與部署
- 前端層面差異主要在：
  - 是否重複打相同請求
  - 是否有 cache
  - mutation 後是否能正確同步畫面
- fetch + 自寫 hooks：
  - 可以做得很好
  - 但所有 cache、dedupe、refetch policy 都要自己管
- fetch + TanStack Query：
  - 若設定合理，可降低重複請求與畫面同步成本
  - 但若直接吃預設值，不理解 staleTime / refetchOnWindowFocus / retry，可能出現額外流量

### AI 友善程度

- 一般情況：
  - fetch + 自寫 hooks：簡單，但容易分散
  - fetch + TanStack Query：若有固定 pattern，對 AI 更友善
- 原因：
  - query key、feature hook、mutation hook 可以把資料流集中成固定套路
  - AI 比較容易沿著同一模式擴寫

### AI 偷懶指數升高時

- fetch + 自寫 hooks：
  - 好處是沒太多隱性框架行為
  - 壞處是 AI 很容易開始重複貼 request code、loading code、error code
- fetch + TanStack Query：
  - 好處是只要先定好模板，AI 比較不容易亂寫整套資料抓取流程
  - 風險是 AI 若忽略 defaults，可能忘記 staleTime、retry、invalidate 導致行為偏差

### 目前傾向

- 目前決定：
  - 原生 fetch
  - 搭配 TanStack Query
- 前提：
  - 需要先定好 query key、API module、feature hook 的固定寫法
  - 需要在專案一開始就明確設定 QueryClient defaults

## 完整分析紀錄

### 為什麼這題不優先用 Next.js

- Next.js 官方定位是 React framework，用來建 full-stack web applications
- App Router 又進一步引入：
  - Server Components
  - layouts
  - file-system routing
  - server / client component 邊界
- 如果這題本來就要由 ASP.NET Core 負責後端 API 與業務邏輯
- 那前端再上 Next.js，會產生兩個問題：
  - 你會多背一層 Next.js 框架心智負擔
  - 討論重點會被稀釋到 SSR / App Router / Server Components，而不是 Work Item 題目的流程與架構

### 什麼情況下我才會考慮 Next.js

- 需求非常重視：
  - SSR / SEO
  - server-side rendering 首屏體驗
  - BFF 模式
  - 站內內容頁很多
  - 需要用 framework 整合 server actions / middleware / auth
- 但這題目前重點是：
  - 前台列表
  - 詳情頁
  - admin CRUD
  - 使用者個人化狀態
  - .NET 後端能力
- 這些用 React SPA + ASP.NET Core Web API 就足夠，而且更聚焦

### 如果硬要用 Next.js，代價是什麼

- 需要額外說清楚：
  - 為什麼還要保留獨立 .NET API
  - 哪些資料在 Next.js server layer 取
  - 哪些資料直接由 client components 打 API
  - App Router / client component 邊界怎麼切
- 對這題來說，這些討論大多不是加分主軸

### 所以目前結論

- 這題不優先推薦 Next.js
- 目前更推薦：
  - React + TypeScript + Vite
  - Tailwind CSS
  - fetch + TanStack Query
  - ASP.NET Core Web API
- 這樣能把重點集中在：
  - 題目需求本身
  - 前後端分離
  - API 設計
  - UseCase 流程
  - 系統流程與實作表達

### 為什麼不是 axios

- 不是因為 axios 完全不能用
- 而是此題沒有明確需要 axios 的理由
- 近年 axios 官方 advisory 持續出現，若能用原生 fetch 解決，會希望先減少額外依賴
- 因此前端這題預設採原生 fetch

### 為什麼不是 fetch only

- fetch only 的優點是簡單、直接、依賴少
- 但這題不是只有單頁資料呈現
- 這題至少會有：
  - list
  - detail
  - admin create
  - admin update
  - admin delete
  - user confirm / revoke confirm
- 如果全部只靠 fetch + 自寫 hooks，loading、error、refetch、mutation 後同步刷新邏輯很容易重複分散

### 為什麼選 fetch + TanStack Query

- 保留原生 fetch，維持依賴面較小
- 用 TanStack Query 專門處理前端 server state
- 對 CRUD 型畫面特別有幫助：
  - query cache
  - background refetch
  - mutation 後 invalidate
  - loading / error 管理
- 這種模式很適合本題的：
  - Work Item list
  - Work Item detail
  - admin CRUD
  - 使用者狀態切換

### 在高流量 / 高併發 / 複雜邏輯下的判斷

- 真正的高流量高併發瓶頸，核心仍在：
  - 後端 API 設計
  - DB 索引
  - 查詢效率
  - 快取策略
  - 部署方式
- 前端方案的差異主要在：
  - 是否重複打相同 request
  - 是否有一致 cache 策略
  - mutation 後畫面是否穩定同步
- fetch only 可以做得很好，但 cache、dedupe、refresh policy 都要自己維護
- fetch + TanStack Query 若設定合理，通常更有利於中型 CRUD 專案的穩定性
- 但前提是：
  - 要先定義 query key 規則
  - 要明確設定 QueryClient defaults
  - 不可直接無腦吃預設值

### AI 友善程度

#### 一般情況

- fetch only：
  - 比較直觀
  - 但很容易分散在各頁自己寫一套 loading / error / request 邏輯
- fetch + TanStack Query：
  - 如果 query key、feature hook、API module pattern 先定好
  - 對 AI 補碼更友善

#### AI 偷懶指數升高時

- fetch only：
  - 優點是沒有太多隱性框架行為
  - 缺點是 AI 很容易開始大量複製貼上資料抓取與狀態處理碼
- fetch + TanStack Query：
  - 優點是只要模板先定好，AI 較容易沿著既有 pattern 擴寫
  - 風險是 AI 可能忽略：
    - staleTime
    - retry
    - invalidateQueries
    - query key 命名一致性

### 為了 agent-first 開發，後續要先定義的東西

- query key 命名規則
- API module 分層方式
- feature hook 命名方式
- QueryClient defaults
- mutation 後的 invalidate 規則
- 哪些頁面要用 query
- 哪些動作要用 mutation
