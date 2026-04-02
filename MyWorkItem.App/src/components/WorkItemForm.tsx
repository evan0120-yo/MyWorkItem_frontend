import { useEffect, useState, type FormEvent } from 'react'
import { ErrorNotice } from './ErrorNotice'
import type { WorkItemFormValues } from '../types/work-item'

type WorkItemFormProps = {
  mode: 'create' | 'edit'
  initialValues?: WorkItemFormValues
  isSubmitting: boolean
  submitError?: unknown
  onSubmit: (values: WorkItemFormValues) => Promise<void> | void
}

type FieldErrors = {
  title?: string
  description?: string
}

const titleMaxLength = 200
const descriptionMaxLength = 2000

export function WorkItemForm({
  mode,
  initialValues,
  isSubmitting,
  submitError,
  onSubmit,
}: WorkItemFormProps) {
  const [values, setValues] = useState<WorkItemFormValues>({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    setValues({
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
    })
  }, [initialValues?.description, initialValues?.title])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {}
    const trimmedTitle = values.title.trim()
    const trimmedDescription = values.description.trim()

    if (!trimmedTitle) {
      nextErrors.title = '請輸入標題。'
    } else if (trimmedTitle.length > titleMaxLength) {
      nextErrors.title = `標題長度不可超過 ${titleMaxLength} 個字元。`
    }

    if (trimmedDescription.length > descriptionMaxLength) {
      nextErrors.description = `描述長度不可超過 ${descriptionMaxLength} 個字元。`
    }

    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      await onSubmit({
        title: trimmedTitle,
        description: trimmedDescription,
      })
    } catch {
      // Mutation state owns the UI error display.
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-slate-900/10 bg-[var(--panel-bg)] p-6 shadow-[var(--shadow-soft)]"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
          {mode === 'create' ? '新增工作項目' : '編輯工作項目'}
        </p>
        <h2 className="text-2xl font-semibold text-[var(--page-ink)]">
          {mode === 'create'
            ? '建立新的工作項目'
            : '更新目前選定的工作項目'}
        </h2>
      </div>

      <div className="mt-6 space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--page-ink)]">標題</span>
          <input
            type="text"
            value={values.title}
            maxLength={titleMaxLength}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            placeholder="請輸入工作項目標題"
          />
          {fieldErrors.title ? (
            <p className="text-sm text-amber-900">{fieldErrors.title}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--page-ink)]">
            描述
          </span>
          <textarea
            value={values.description}
            maxLength={descriptionMaxLength}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows={6}
            className="w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            placeholder="請描述工作項目內容"
          />
          {fieldErrors.description ? (
            <p className="text-sm text-amber-900">{fieldErrors.description}</p>
          ) : null}
        </label>

        {submitError ? <ErrorNotice error={submitError} /> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? mode === 'create'
              ? '建立中...'
              : '更新中...'
            : mode === 'create'
              ? '新增'
              : '儲存變更'}
        </button>
      </div>
    </form>
  )
}
