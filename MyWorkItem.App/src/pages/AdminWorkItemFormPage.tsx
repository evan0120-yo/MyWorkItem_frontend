import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { StatePanel } from '../components/StatePanel'
import { WorkItemForm } from '../components/WorkItemForm'
import { useCreateWorkItemMutation } from '../features/admin-work-items/useCreateWorkItemMutation'
import { useUpdateWorkItemMutation } from '../features/admin-work-items/useUpdateWorkItemMutation'
import { useMockAuth } from '../features/auth-mock/MockAuthContext'
import { useWorkItemDetailQuery } from '../features/work-items/useWorkItemDetailQuery'
import { ApiClientError } from '../types/api'
import type { MockCurrentUser } from '../types/work-item'

export function AdminWorkItemFormPage() {
  const { id } = useParams()
  const { currentUser } = useMockAuth()

  if (id) {
    return (
      <AdminWorkItemEditContent
        currentUser={currentUser}
        workItemId={id}
      />
    )
  }

  return <AdminWorkItemCreateContent currentUser={currentUser} />
}

function AdminWorkItemCreateContent({
  currentUser,
}: {
  currentUser: MockCurrentUser
}) {
  const navigate = useNavigate()
  const createMutation = useCreateWorkItemMutation(currentUser, {
    onSuccess: () =>
      navigate('/admin/work-items', {
        state: {
          successMessage: 'Created the work item successfully.',
        },
      }),
  })

  return (
    <AdminWorkItemFormLayout>
      <WorkItemForm
        mode="create"
        isSubmitting={createMutation.isPending}
        submitError={createMutation.error}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values)
        }}
      />
    </AdminWorkItemFormLayout>
  )
}

function AdminWorkItemEditContent({
  currentUser,
  workItemId,
}: {
  currentUser: MockCurrentUser
  workItemId: string
}) {
  const navigate = useNavigate()
  const detailQuery = useWorkItemDetailQuery(currentUser, workItemId)
  const updateMutation = useUpdateWorkItemMutation(currentUser, workItemId, {
    onSuccess: () =>
      navigate('/admin/work-items', {
        state: {
          successMessage: 'Updated the work item successfully.',
        },
      }),
  })

  if (detailQuery.isPending) {
    return (
      <StatePanel
        eyebrow="Loading"
        title="Fetching work item for editing"
        description="The page is loading the shared detail API before opening the edit form."
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
          title="This work item can no longer be edited."
          description="The target work item does not exist anymore."
          tone="warning"
        />
      )
    }

    return (
      <StatePanel
        eyebrow="Error"
        title="Unable to open the edit form"
        description="The shared detail API failed before the form could be initialized."
        tone="warning"
      />
    )
  }

  return (
    <AdminWorkItemFormLayout>
      <WorkItemForm
        mode="edit"
        initialValues={{
          title: detailQuery.data.title,
          description: detailQuery.data.description,
        }}
        isSubmitting={updateMutation.isPending}
        submitError={updateMutation.error}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values)
        }}
      />
    </AdminWorkItemFormLayout>
  )
}

function AdminWorkItemFormLayout({
  children,
}: {
  children: ReactNode
}) {
  const navigate = useNavigate()

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {children}

      <aside className="rounded-[28px] border border-slate-900/10 bg-white/80 p-6 shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
          Admin Notes
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--page-ink)]">
          Main data only
        </h3>
        <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">
          This form only edits the main work item fields. Even in edit mode, the
          shared detail API may contain a personal status, but that value is not
          part of the admin form.
        </p>

        <button
          type="button"
          onClick={() => navigate('/admin/work-items')}
          className="mt-6 inline-flex w-full justify-center rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-[var(--page-ink)] transition hover:bg-slate-900 hover:text-white"
        >
          Back to admin list
        </button>
      </aside>
    </div>
  )
}
