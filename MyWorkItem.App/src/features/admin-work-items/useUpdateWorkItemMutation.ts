import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateWorkItem } from '../../api/client/workItemsApi'
import { workItemQueryKeys } from '../../api/queryKeys/workItemQueryKeys'
import type { MockCurrentUser, WorkItemFormValues } from '../../types/work-item'

type MutationOptions = {
  onSuccess?: () => void
}

export function useUpdateWorkItemMutation(
  currentUser: MockCurrentUser,
  workItemId: string,
  options?: MutationOptions,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: WorkItemFormValues) =>
      updateWorkItem(currentUser, workItemId, values),
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
