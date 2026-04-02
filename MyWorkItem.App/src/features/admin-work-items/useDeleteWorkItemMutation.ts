import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteWorkItem } from '../../api/client/workItemsApi'
import { workItemQueryKeys } from '../../api/queryKeys/workItemQueryKeys'
import type { MockCurrentUser } from '../../types/work-item'

export function useDeleteWorkItemMutation(currentUser: MockCurrentUser) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workItemId: string) => deleteWorkItem(currentUser, workItemId),
    onSuccess: async (_, workItemId) => {
      await queryClient.invalidateQueries({
        queryKey: workItemQueryKeys.allLists,
      })

      queryClient.removeQueries({
        queryKey: workItemQueryKeys.detail(currentUser.userId, workItemId),
      })
    },
  })
}
