type SuccessNoticeProps = {
  message: string
}

export function SuccessNotice({ message }: SuccessNoticeProps) {
  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
      {message}
    </div>
  )
}
