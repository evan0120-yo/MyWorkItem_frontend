import { ApiClientError } from '../types/api'

type ErrorNoticeProps = {
  error: unknown
}

export function ErrorNotice({ error }: ErrorNoticeProps) {
  const detail =
    error instanceof ApiClientError
      ? error.detail || error.message
      : error instanceof Error
        ? error.message
        : 'Something went wrong.'

  return (
    <div className="rounded-2xl border border-amber-900/20 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {detail}
    </div>
  )
}
