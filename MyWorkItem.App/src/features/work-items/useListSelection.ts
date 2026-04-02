import { useCallback, useState } from 'react'

export function useListSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelection = useCallback((workItemId: string) => {
    setSelectedIds((current) =>
      current.includes(workItemId)
        ? current.filter((item) => item !== workItemId)
        : [...current, workItemId],
    )
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const toggleSelectAll = useCallback((workItemIds: string[]) => {
    setSelectedIds((current) => {
      const areAllVisibleItemsSelected =
        workItemIds.length > 0 &&
        workItemIds.every((workItemId) => current.includes(workItemId))

      return areAllVisibleItemsSelected ? [] : workItemIds
    })
  }, [])

  return {
    selectedIds,
    toggleSelection,
    clearSelection,
    toggleSelectAll,
  }
}
