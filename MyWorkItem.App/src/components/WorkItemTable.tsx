import type { WorkItemListItem } from '../types/work-item'

type WorkItemTableProps = {
  items: WorkItemListItem[]
  selectedIds?: string[]
  onToggleSelection?: (workItemId: string) => void
  onToggleSelectAll?: () => void
  showActions?: boolean
  actionLabel?: string
  getActionLabel?: (item: WorkItemListItem) => string
  isActionDisabled?: (item: WorkItemListItem) => boolean
  onAction?: (workItemId: string) => void
  secondaryActionLabel?: string
  onSecondaryAction?: (workItemId: string) => void
  onTitleClick?: (workItemId: string) => void
}

function getStatusClassName(status: WorkItemListItem['status']) {
  return status === 'Confirmed'
    ? 'bg-emerald-100 text-emerald-900'
    : 'bg-stone-200 text-stone-700'
}

export function WorkItemTable({
  items,
  selectedIds = [],
  onToggleSelection,
  onToggleSelectAll,
  showActions = false,
  actionLabel,
  getActionLabel,
  isActionDisabled,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  onTitleClick,
}: WorkItemTableProps) {
  const allSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id))

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-900/10 bg-[var(--panel-bg)] shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-white/70 text-left text-xs uppercase tracking-[0.24em] text-[var(--muted-ink)]">
            <tr>
              {onToggleSelection ? (
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => onToggleSelectAll?.()}
                    aria-label="Select all work items"
                    className="h-4 w-4 rounded border-slate-400"
                  />
                </th>
              ) : null}
              <th className="px-4 py-4">ID</th>
              <th className="px-4 py-4">Title</th>
              <th className="px-4 py-4">Status</th>
              {showActions ? <th className="px-4 py-4 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-900/8">
                {onToggleSelection ? (
                  <td className="px-4 py-4 align-middle">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => onToggleSelection(item.id)}
                      aria-label={`Select ${item.title}`}
                      className="h-4 w-4 rounded border-slate-400"
                    />
                  </td>
                ) : null}
                <td className="px-4 py-4 text-sm text-[var(--muted-ink)]">
                  <span className="font-mono text-xs">{item.id}</span>
                </td>
                <td className="px-4 py-4">
                  {onTitleClick ? (
                    <button
                      type="button"
                      onClick={() => onTitleClick(item.id)}
                      className="text-left text-sm font-semibold text-[var(--page-ink)] underline-offset-4 hover:underline"
                    >
                      {item.title}
                    </button>
                  ) : (
                    <span className="text-sm font-semibold text-[var(--page-ink)]">
                      {item.title}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(item.status)}`}
                  >
                    {item.status}
                  </span>
                </td>
                {showActions ? (
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {secondaryActionLabel && onSecondaryAction ? (
                        <button
                          type="button"
                          onClick={() => onSecondaryAction(item.id)}
                          className="rounded-full border border-slate-900/10 px-3 py-2 text-xs font-semibold text-[var(--page-ink)] transition hover:bg-slate-900 hover:text-white"
                        >
                          {secondaryActionLabel}
                        </button>
                      ) : null}
                      {actionLabel && onAction ? (
                        <button
                          type="button"
                          onClick={() => onAction(item.id)}
                          disabled={isActionDisabled?.(item)}
                          className="rounded-full border border-amber-700/20 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                        >
                          {getActionLabel ? getActionLabel(item) : actionLabel}
                        </button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
