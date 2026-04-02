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
          successMessage: '已成功新增工作項目。',
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
          successMessage: '已成功更新工作項目。',
        },
      }),
  })

  if (detailQuery.isPending) {
    return (
      <StatePanel
        eyebrow="載入中"
        title="正在載入待編輯的工作項目"
        description="頁面會先載入共用的詳情介面，再開啟編輯表單。"
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
          title="這筆工作項目已無法編輯。"
          description="目標工作項目已不存在。"
          tone="warning"
        />
      )
    }

    return (
      <StatePanel
        eyebrow="錯誤"
        title="無法開啟編輯表單"
        description="共用詳情介面在表單初始化前就失敗了。"
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
          管理備註
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--page-ink)]">
          只編輯主資料
        </h3>
        <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">
          這個表單只會編輯工作項目的主資料欄位。即使在編輯模式下，共用詳情
          API 可能帶回個人狀態，但那不是管理表單的一部分。
        </p>

        <button
          type="button"
          onClick={() => navigate('/admin/work-items')}
          className="mt-6 inline-flex w-full justify-center rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-[var(--page-ink)] transition hover:bg-slate-900 hover:text-white"
        >
          返回管理清單
        </button>
      </aside>
    </div>
  )
}
