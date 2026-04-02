import { useMutation, useQueryClient } from '@tanstack/react-query'
import { revertWorkItemConfirmation } from '../../api/client/workItemsApi'
import { workItemQueryKeys } from '../../api/queryKeys/workItemQueryKeys'
import type { MockCurrentUser } from '../../types/work-item'

type RevertOptions = {
  onSuccess?: () => void
}

export function useRevertWorkItemConfirmationMutation(
  currentUser: MockCurrentUser,
  workItemId: string,
  options?: RevertOptions,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => revertWorkItemConfirmation(currentUser, workItemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workItemQueryKeys.allLists,
      })

      await queryClient.invalidateQueries({
        queryKey: workItemQueryKeys.detail(currentUser.userId, workItemId),
      })

      options?.onSuccess?.()
    },
  })
}
