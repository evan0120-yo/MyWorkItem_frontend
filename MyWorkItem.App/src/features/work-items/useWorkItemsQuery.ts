import { useQuery } from '@tanstack/react-query'
import { getWorkItems } from '../../api/client/workItemsApi'
import { workItemQueryKeys } from '../../api/queryKeys/workItemQueryKeys'
import type { MockCurrentUser, SortDirection } from '../../types/work-item'

export function useWorkItemsQuery(
  currentUser: MockCurrentUser,
  sortDirection: SortDirection,
) {
  return useQuery({
    queryKey: workItemQueryKeys.lists(currentUser.userId, sortDirection),
    queryFn: ({ signal }) => getWorkItems(currentUser, sortDirection, signal),
  })
}
