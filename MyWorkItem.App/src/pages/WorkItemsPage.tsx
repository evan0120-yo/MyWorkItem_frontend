import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorNotice } from '../components/ErrorNotice'
import { StatePanel } from '../components/StatePanel'
import { SuccessNotice } from '../components/SuccessNotice'
import { WorkItemTable } from '../components/WorkItemTable'
import { useMockAuth } from '../features/auth-mock/MockAuthContext'
import { useConfirmWorkItemsMutation } from '../features/work-items/useConfirmWorkItemsMutation'
import { useListSelection } from '../features/work-items/useListSelection'
import { useRevertWorkItemConfirmationMutation } from '../features/work-items/useRevertWorkItemConfirmationMutation'
import { useWorkItemsQuery } from '../features/work-items/useWorkItemsQuery'
import type { SortDirection } from '../types/work-item'

function resolveSortDirection(value: string | null): SortDirection {
  return value === 'asc' ? 'asc' : 'desc'
}

export function WorkItemsPage() {
  const navigate = useNavigate()
  const { currentUser } = useMockAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pendingRevertId, setPendingRevertId] = useState<string | null>(null)
  const sortDirection = resolveSortDirection(searchParams.get('sortDirection'))
  const { selectedIds, toggleSelection, clearSelection, toggleSelectAll } =
    useListSelection()
  const workItemsQuery = useWorkItemsQuery(currentUser, sortDirection)
  const confirmMutation = useConfirmWorkItemsMutation(currentUser, {
    onSuccess: clearSelection,
  })
  const revertMutation = useRevertWorkItemConfirmationMutation(currentUser)

  const items = workItemsQuery.data?.items ?? []

  useEffect(() => {
    clearSelection()
    setSuccessMessage(null)
  }, [clearSelection, currentUser.userId, sortDirection])

  async function handleConfirm() {
    const confirmedCount = selectedIds.length

    try {
      setSuccessMessage(null)
      await confirmMutation.mutateAsync(selectedIds)
      setSuccessMessage(
        confirmedCount === 1
          ? '已成功確認 1 筆工作項目。'
          : `已成功確認 ${confirmedCount} 筆工作項目。`,
      )
    } catch {
      // Mutation state owns the UI error display.
    }
  }

  async function handleRevert(workItemId: string) {
    if (revertMutation.isPending) {
      return
    }

    const shouldRevert = window.confirm(
      '要將這筆工作項目對目前使用者改回待確認嗎？',
    )

    if (!shouldRevert) {
      return
    }

    try {
      setSuccessMessage(null)
      setPendingRevertId(workItemId)
      await revertMutation.mutateAsync(workItemId)
      setSuccessMessage('已將所選工作項目改回待確認。')
    } catch {
      // Mutation state owns the UI error display.
    } finally {
      setPendingRevertId(null)
    }
  }

  const detailSearch = searchParams.toString()

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-900/10 bg-[var(--panel-bg)] p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
                使用者流程
              </p>
              <h2 className="text-2xl font-semibold text-[var(--page-ink)]">
                工作項目清單
              </h2>
              <p className="text-sm leading-7 text-[var(--muted-ink)]">
                清單畫面會依目前模擬使用者顯示個人狀態。按下確認只會更新這位
                使用者選取的工作項目。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSearchParams({ sortDirection: 'desc' })}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  sortDirection === 'desc'
                    ? 'bg-[var(--accent)] text-white'
                    : 'border border-slate-900/10 bg-white text-[var(--page-ink)]'
                }`}
              >
                最新優先
              </button>
              <button
                type="button"
                onClick={() => setSearchParams({ sortDirection: 'asc' })}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  sortDirection === 'asc'
                    ? 'bg-[var(--accent)] text-white'
                    : 'border border-slate-900/10 bg-white text-[var(--page-ink)]'
                }`}
              >
                最舊優先
              </button>
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-slate-900/10 bg-white/80 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
            選取區
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--page-ink)]">
            確認已選項目
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">
            已選項目只保存在這個頁面的本地狀態。每次操作成功後，個人狀態都會從
            後端重新整理。
          </p>
          <div className="mt-6 rounded-2xl bg-[var(--accent-soft)] px-4 py-4">
            <p className="text-sm text-[var(--muted-ink)]">已選數量</p>
            <p className="mt-1 text-3xl font-semibold text-[var(--page-ink)]">
              {selectedIds.length}
            </p>
          </div>

          {successMessage ? (
            <div className="mt-4">
              <SuccessNotice message={successMessage} />
            </div>
          ) : null}

          {confirmMutation.isError ? (
            <div className="mt-4">
              <ErrorNotice error={confirmMutation.error} />
            </div>
          ) : null}

          {revertMutation.isError ? (
            <div className="mt-4">
              <ErrorNotice error={revertMutation.error} />
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedIds.length === 0 || confirmMutation.isPending}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmMutation.isPending ? '確認中...' : '確認選取項目'}
          </button>
        </aside>
      </section>

      {workItemsQuery.isPending ? (
        <StatePanel
          eyebrow="載入中"
          title="正在取得工作項目"
          description="頁面正在等待最新的工作項目清單與個人狀態。"
        />
      ) : null}

      {workItemsQuery.isError ? (
        <StatePanel
          eyebrow="錯誤"
          title="無法載入工作項目"
          description="清單請求失敗。請先查看下方回應內容，再重新嘗試。"
          tone="warning"
          action={<ErrorNotice error={workItemsQuery.error} />}
        />
      ) : null}

      {workItemsQuery.isSuccess && items.length === 0 ? (
        <StatePanel
          eyebrow="無資料"
          title="目前沒有工作項目。"
          description="後端回傳的是空清單。若切換成管理員使用者，可從管理區建立第一筆資料。"
        />
      ) : null}

      {workItemsQuery.isSuccess && items.length > 0 ? (
        <WorkItemTable
          items={items}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onToggleSelectAll={() => toggleSelectAll(items.map((item) => item.id))}
          showActions
          actionLabel="撤銷確認"
          shouldShowAction={(item) => item.status === 'Confirmed'}
          getActionLabel={(item) =>
            pendingRevertId === item.id ? '撤銷中...' : '撤銷確認'
          }
          isActionDisabled={(item) =>
            revertMutation.isPending && pendingRevertId === item.id
          }
          onAction={handleRevert}
          onTitleClick={(workItemId) =>
            navigate({
              pathname: `/work-items/${workItemId}`,
              search: detailSearch ? `?${detailSearch}` : '',
            })
          }
        />
      ) : null}
    </div>
  )
}
