import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ErrorNotice } from '../components/ErrorNotice'
import { StatePanel } from '../components/StatePanel'
import { SuccessNotice } from '../components/SuccessNotice'
import { WorkItemTable } from '../components/WorkItemTable'
import { useDeleteWorkItemMutation } from '../features/admin-work-items/useDeleteWorkItemMutation'
import { useMockAuth } from '../features/auth-mock/MockAuthContext'
import { useWorkItemsQuery } from '../features/work-items/useWorkItemsQuery'

type AdminNavigationState = {
  successMessage?: string
}

export function AdminWorkItemsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useMockAuth()
  const workItemsQuery = useWorkItemsQuery(currentUser, 'desc')
  const deleteMutation = useDeleteWorkItemMutation(currentUser)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pendingDeleteWorkItemId, setPendingDeleteWorkItemId] = useState<
    string | null
  >(null)

  useEffect(() => {
    const navigationState = location.state as AdminNavigationState | null

    if (!navigationState?.successMessage) {
      return
    }

    setSuccessMessage(navigationState.successMessage)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  async function handleDelete(workItemId: string) {
    if (deleteMutation.isPending) {
      return
    }

    const shouldDelete = window.confirm(
      '要刪除這筆工作項目嗎？這會一併移除相關的個人狀態。',
    )

    if (!shouldDelete) {
      return
    }

    try {
      setSuccessMessage(null)
      setPendingDeleteWorkItemId(workItemId)
      await deleteMutation.mutateAsync(workItemId)
      setSuccessMessage('已成功刪除工作項目。')
    } catch {
      // Mutation state owns the UI error display.
    } finally {
      setPendingDeleteWorkItemId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-900/10 bg-[var(--panel-bg)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
              管理區
            </p>
            <h2 className="text-2xl font-semibold text-[var(--page-ink)]">
              工作項目管理清單
            </h2>
            <p className="text-sm leading-7 text-[var(--muted-ink)]">
              這裡刻意沿用使用者清單介面。狀態欄顯示的仍是目前管理員的個人狀
              態，不是額外的全域管理旗標。
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/work-items/new')}
            className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            新增工作項目
          </button>
        </div>
      </section>

      {successMessage ? <SuccessNotice message={successMessage} /> : null}

      {deleteMutation.isError ? <ErrorNotice error={deleteMutation.error} /> : null}

      {workItemsQuery.isPending ? (
        <StatePanel
          eyebrow="載入中"
          title="正在取得管理清單"
          description="管理清單會沿用共用的工作項目讀取介面，並在第一階段固定使用由新到舊排序。"
        />
      ) : null}

      {workItemsQuery.isError ? (
        <StatePanel
          eyebrow="錯誤"
          title="無法載入管理清單"
          description="載入管理清單時，共用讀取介面發生錯誤。"
          tone="warning"
          action={<ErrorNotice error={workItemsQuery.error} />}
        />
      ) : null}

      {workItemsQuery.isSuccess && workItemsQuery.data.items.length === 0 ? (
        <StatePanel
          eyebrow="無資料"
          title="目前尚無工作項目。"
          description="請從管理流程建立第一筆工作項目。"
          action={
            <button
              type="button"
              onClick={() => navigate('/admin/work-items/new')}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              建立第一筆項目
            </button>
          }
        />
      ) : null}

      {workItemsQuery.isSuccess && workItemsQuery.data.items.length > 0 ? (
        <WorkItemTable
          items={workItemsQuery.data.items}
          showActions
          secondaryActionLabel="編輯"
          onSecondaryAction={(workItemId) =>
            navigate(`/admin/work-items/${workItemId}/edit`)
          }
          actionLabel="刪除"
          getActionLabel={(item) =>
            pendingDeleteWorkItemId === item.id ? '刪除中...' : '刪除'
          }
          isActionDisabled={() => deleteMutation.isPending}
          onAction={handleDelete}
        />
      ) : null}
    </div>
  )
}
