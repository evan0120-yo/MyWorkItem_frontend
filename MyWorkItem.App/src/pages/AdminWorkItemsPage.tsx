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
      'Delete this work item? This will remove the item and its related personal statuses.',
    )

    if (!shouldDelete) {
      return
    }

    try {
      setSuccessMessage(null)
      setPendingDeleteWorkItemId(workItemId)
      await deleteMutation.mutateAsync(workItemId)
      setSuccessMessage('Deleted the work item successfully.')
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
              Admin
            </p>
            <h2 className="text-2xl font-semibold text-[var(--page-ink)]">
              Work item admin list
            </h2>
            <p className="text-sm leading-7 text-[var(--muted-ink)]">
              The read side is intentionally shared with the user list API. The
              status column still reflects the current admin user's personal
              status, not a global admin-only flag.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/work-items/new')}
            className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Create work item
          </button>
        </div>
      </section>

      {successMessage ? <SuccessNotice message={successMessage} /> : null}

      {deleteMutation.isError ? <ErrorNotice error={deleteMutation.error} /> : null}

      {workItemsQuery.isPending ? (
        <StatePanel
          eyebrow="Loading"
          title="Fetching admin list"
          description="The admin list reuses the shared work item read API and keeps the fixed desc ordering for Phase 1."
        />
      ) : null}

      {workItemsQuery.isError ? (
        <StatePanel
          eyebrow="Error"
          title="Unable to load the admin list"
          description="The shared read API failed while loading the admin list."
          tone="warning"
          action={<ErrorNotice error={workItemsQuery.error} />}
        />
      ) : null}

      {workItemsQuery.isSuccess && workItemsQuery.data.items.length === 0 ? (
        <StatePanel
          eyebrow="Empty"
          title="No work items exist yet."
          description="Create the first work item from the admin flow."
          action={
            <button
              type="button"
              onClick={() => navigate('/admin/work-items/new')}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Create the first item
            </button>
          }
        />
      ) : null}

      {workItemsQuery.isSuccess && workItemsQuery.data.items.length > 0 ? (
        <WorkItemTable
          items={workItemsQuery.data.items}
          showActions
          secondaryActionLabel="Edit"
          onSecondaryAction={(workItemId) =>
            navigate(`/admin/work-items/${workItemId}/edit`)
          }
          actionLabel="Delete"
          getActionLabel={(item) =>
            pendingDeleteWorkItemId === item.id ? 'Deleting...' : 'Delete'
          }
          isActionDisabled={() => deleteMutation.isPending}
          onAction={handleDelete}
        />
      ) : null}
    </div>
  )
}
