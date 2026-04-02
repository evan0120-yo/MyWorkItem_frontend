import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
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
      "Mark this work item back to 'Pending' for the current user?",
    )

    if (!shouldRevert) {
      return
    }

    try {
      setSuccessMessage(null)
      await revertMutation.mutateAsync(id)
      setSuccessMessage('Marked the selected work item back to pending.')
    } catch {
      // Mutation state owns the UI error display.
    }
  }

  if (detailQuery.isPending) {
    return (
      <StatePanel
        eyebrow="Loading"
        title="Fetching work item detail"
        description="The detail page is waiting for the latest item data and the current user's personal status."
      />
    )
  }

  if (detailQuery.isError) {
    const status =
      detailQuery.error instanceof ApiClientError ? detailQuery.error.status : undefined

    if (status === 404) {
      return (
        <StatePanel
          eyebrow="Not Found"
          title="This work item does not exist anymore."
          description="The requested item could not be found. It may have been deleted from the admin side."
          tone="warning"
          action={
            <button
              type="button"
              onClick={() => navigate(returnPath)}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Back to list
            </button>
          }
        />
      )
    }

    return (
      <StatePanel
        eyebrow="Error"
        title="Unable to load this work item"
        description="The detail request failed. Review the API response below."
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
          Work Item Detail
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
            {item.status}
          </span>
        </div>

        <div className="mt-6 rounded-[24px] bg-white/80 p-5">
          <p className="text-sm font-semibold text-[var(--page-ink)]">Description</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--muted-ink)]">
            {item.description || 'No description provided.'}
          </p>
        </div>

        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/70 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
              Created At
            </dt>
            <dd className="mt-2 text-sm font-semibold text-[var(--page-ink)]">
              {formatDateTime(item.createdAt)}
            </dd>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
              Updated At
            </dt>
            <dd className="mt-2 text-sm font-semibold text-[var(--page-ink)]">
              {formatDateTime(item.updatedAt)}
            </dd>
          </div>
        </dl>
      </section>

      <aside className="rounded-[28px] border border-slate-900/10 bg-white/80 p-6 shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
          Current User Action
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--page-ink)]">
          Personal status control
        </h3>
        <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">
          This page only shows the current mock user's personal status. Revert
          does not touch the global work item data.
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
            {revertMutation.isPending ? 'Reverting...' : 'Revert confirmation'}
          </button>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-900/10 bg-stone-100 px-4 py-4 text-sm text-[var(--muted-ink)]">
            This item is already pending for the current user.
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate(returnPath)}
          className="mt-3 inline-flex w-full justify-center rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-[var(--page-ink)] transition hover:bg-slate-900 hover:text-white"
        >
          Back to list
        </button>
      </aside>
    </div>
  )
}
