import type { SortDirection } from '../../types/work-item'

export const workItemQueryKeys = {
  lists: (userId: string, sortDirection: SortDirection) =>
    ['work-items', { userId, sortDirection }] as const,
  detail: (userId: string, workItemId: string) =>
    ['work-item', { userId, workItemId }] as const,
  allLists: ['work-items'] as const,
}
