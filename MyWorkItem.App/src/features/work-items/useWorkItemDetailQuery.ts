import { useQuery } from '@tanstack/react-query'
import { getWorkItemDetail } from '../../api/client/workItemsApi'
import { workItemQueryKeys } from '../../api/queryKeys/workItemQueryKeys'
import type { MockCurrentUser } from '../../types/work-item'

export function useWorkItemDetailQuery(
  currentUser: MockCurrentUser,
  workItemId: string,
) {
  return useQuery({
    queryKey: workItemQueryKeys.detail(currentUser.userId, workItemId),
    queryFn: ({ signal }) => getWorkItemDetail(currentUser, workItemId, signal),
    enabled: Boolean(workItemId),
  })
}
