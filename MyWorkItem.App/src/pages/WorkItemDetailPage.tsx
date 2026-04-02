import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getStatusLabel } from '../app/displayText'
import { ErrorNotice } from '../components/ErrorNotice'
import { StatePanel } from '../components/StatePanel'
import { SuccessNotice } from '../components/SuccessNotice'
import { useMockAuth } from '../features/auth-mock/MockAuthContext'
import { useRevertWorkItemConfirmationMutation } from '../features/work-items/useRevertWorkItemConfirmationMutation'
import { useWorkItemDetailQuery } from '../features/work-items/useWorkItemDetailQuery'
import { ApiClientError } from '../types/api'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function WorkItemDetailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const { currentUser } = useMockAuth()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const detailQuery = useWorkItemDetailQuery(currentUser, id)
  const revertMutation = useRevertWorkItemConfirmationMutation(currentUser)
  const returnPath = location.search ? `/work-items${location.search}` : '/work-items'

  async function handleRevert() {
    const shouldRevert = window.confirm(
      '要將這筆工作項目對目前使用者改回待確認嗎？',
    )

    if (!shouldRevert) {
      return
    }

    try {
      setSuccessMessage(null)
      await revertMutation.mutateAsync(id)
      setSuccessMessage('已將所選工作項目改回待確認。')
    } catch {
      // Mutation state owns the UI error display.
    }
  }

  if (detailQuery.isPending) {
    return (
      <StatePanel
        eyebrow="載入中"
        title="正在取得工作項目詳情"
        description="詳情頁正在等待最新的工作項目資料與目前使用者的個人狀態。"
      />
    )
  }

  if (detailQuery.isError) {
    const status =
      detailQuery.error instanceof ApiClientError ? detailQuery.error.status : undefined

    if (status === 404) {
      return (
        <StatePanel
          eyebrow="找不到資料"
          title="這筆工作項目已不存在。"
          description="找不到你要求的工作項目，它可能已經被管理端刪除。"
          tone="warning"
          action={
            <button
              type="button"
              onClick={() => navigate(returnPath)}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              返回清單
            </button>
          }
        />
      )
    }

    return (
      <StatePanel
        eyebrow="錯誤"
        title="無法載入這筆工作項目"
        description="詳情請求失敗，請先查看下方回應內容。"
        tone="warning"
        action={<ErrorNotice error={detailQuery.error} />}
      />
    )
  }

  const item = detailQuery.data

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-[28px] border border-slate-900/10 bg-[var(--panel-bg)] p-6 shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
          工作項目詳情
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-[var(--page-ink)]">
              {item.title}
            </h2>
            <p className="mt-2 font-mono text-xs text-[var(--muted-ink)]">
              {item.id}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
              item.status === 'Confirmed'
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {getStatusLabel(item.status)}
          </span>
        </div>

        <div className="mt-6 rounded-[24px] bg-white/80 p-5">
          <p className="text-sm font-semibold text-[var(--page-ink)]">描述</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--muted-ink)]">
            {item.description || '未提供描述。'}
          </p>
        </div>

        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/70 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
              建立時間
            </dt>
            <dd className="mt-2 text-sm font-semibold text-[var(--page-ink)]">
              {formatDateTime(item.createdAt)}
            </dd>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
              更新時間
            </dt>
            <dd className="mt-2 text-sm font-semibold text-[var(--page-ink)]">
              {formatDateTime(item.updatedAt)}
            </dd>
          </div>
        </dl>
      </section>

      <aside className="rounded-[28px] border border-slate-900/10 bg-white/80 p-6 shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
          目前使用者操作
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--page-ink)]">
          個人狀態控制
        </h3>
        <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">
          此頁只顯示目前模擬使用者的個人狀態。撤銷確認不會變更全域的工作
          項目資料。
        </p>

        {successMessage ? (
          <div className="mt-4">
            <SuccessNotice message={successMessage} />
          </div>
        ) : null}

        {revertMutation.isError ? (
          <div className="mt-4">
            <ErrorNotice error={revertMutation.error} />
          </div>
        ) : null}

        {item.status === 'Confirmed' ? (
          <button
            type="button"
            onClick={handleRevert}
            disabled={revertMutation.isPending}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {revertMutation.isPending ? '撤銷中...' : '撤銷確認'}
          </button>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-900/10 bg-stone-100 px-4 py-4 text-sm text-[var(--muted-ink)]">
            這筆工作項目對目前使用者已是待確認狀態。
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate(returnPath)}
          className="mt-3 inline-flex w-full justify-center rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-[var(--page-ink)] transition hover:bg-slate-900 hover:text-white"
        >
          返回清單
        </button>
      </aside>
    </div>
  )
}
