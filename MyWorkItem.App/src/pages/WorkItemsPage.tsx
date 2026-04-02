import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorNotice } from '../components/ErrorNotice'
import { StatePanel } from '../components/StatePanel'
import { WorkItemTable } from '../components/WorkItemTable'
import { useMockAuth } from '../features/auth-mock/MockAuthContext'
import { useConfirmWorkItemsMutation } from '../features/work-items/useConfirmWorkItemsMutation'
import { useListSelection } from '../features/work-items/useListSelection'
import { useWorkItemsQuery } from '../features/work-items/useWorkItemsQuery'
import type { SortDirection } from '../types/work-item'

function resolveSortDirection(value: string | null): SortDirection {
  return value === 'asc' ? 'asc' : 'desc'
}

export function WorkItemsPage() {
  const navigate = useNavigate()
  const { currentUser } = useMockAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const sortDirection = resolveSortDirection(searchParams.get('sortDirection'))
  const { selectedIds, toggleSelection, clearSelection, toggleSelectAll } =
    useListSelection()
  const workItemsQuery = useWorkItemsQuery(currentUser, sortDirection)
  const confirmMutation = useConfirmWorkItemsMutation(currentUser, {
    onSuccess: clearSelection,
  })

  const items = workItemsQuery.data?.items ?? []

  useEffect(() => {
    clearSelection()
  }, [clearSelection, currentUser.userId, sortDirection])

  async function handleConfirm() {
    try {
      await confirmMutation.mutateAsync(selectedIds)
    } catch {
      // Mutation state owns the UI error display.
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-900/10 bg-[var(--panel-bg)] p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
                User Flow
              </p>
              <h2 className="text-2xl font-semibold text-[var(--page-ink)]">
                Work item list
              </h2>
              <p className="text-sm leading-7 text-[var(--muted-ink)]">
                The list view always reflects the current mock user's personal
                status. Confirm only updates the selected items for this user.
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
                Newest first
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
                Oldest first
              </button>
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-slate-900/10 bg-white/80 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
            Selection
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--page-ink)]">
            Confirm selected items
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">
            Selected items are stored locally in the page. The actual personal
            status is refreshed from the API after each successful mutation.
          </p>
          <div className="mt-6 rounded-2xl bg-[var(--accent-soft)] px-4 py-4">
            <p className="text-sm text-[var(--muted-ink)]">Selected count</p>
            <p className="mt-1 text-3xl font-semibold text-[var(--page-ink)]">
              {selectedIds.length}
            </p>
          </div>

          {confirmMutation.isError ? (
            <div className="mt-4">
              <ErrorNotice error={confirmMutation.error} />
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedIds.length === 0 || confirmMutation.isPending}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmMutation.isPending ? 'Confirming...' : 'Confirm selected'}
          </button>
        </aside>
      </section>

      {workItemsQuery.isPending ? (
        <StatePanel
          eyebrow="Loading"
          title="Fetching work items"
          description="The page is waiting for the latest list and personal statuses."
        />
      ) : null}

      {workItemsQuery.isError ? (
        <StatePanel
          eyebrow="Error"
          title="Unable to load work items"
          description="The list request failed. Review the API response details below and try again."
          tone="warning"
          action={<ErrorNotice error={workItemsQuery.error} />}
        />
      ) : null}

      {workItemsQuery.isSuccess && items.length === 0 ? (
        <StatePanel
          eyebrow="Empty"
          title="There are no work items yet."
          description="The API returned an empty list. If you switch to an admin user, you can create the first item from the admin area."
        />
      ) : null}

      {workItemsQuery.isSuccess && items.length > 0 ? (
        <WorkItemTable
          items={items}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onToggleSelectAll={() => toggleSelectAll(items.map((item) => item.id))}
          onTitleClick={(workItemId) => navigate(`/work-items/${workItemId}`)}
        />
      ) : null}
    </div>
  )
}
