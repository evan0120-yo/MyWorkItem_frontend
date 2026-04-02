import type { ReactNode } from 'react'

type StatePanelProps = {
  eyebrow: string
  title: string
  description: string
  tone?: 'default' | 'warning'
  action?: ReactNode
}

export function StatePanel({
  eyebrow,
  title,
  description,
  tone = 'default',
  action,
}: StatePanelProps) {
  const toneClassName =
    tone === 'warning'
      ? 'border-amber-700/20 bg-amber-50 text-amber-950'
      : 'border-slate-900/10 bg-[var(--panel-bg)] text-[var(--page-ink)]'

  return (
    <section
      className={`rounded-[28px] border px-6 py-8 shadow-[var(--shadow-soft)] ${toneClassName}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-ink)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-ink)]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  )
}
