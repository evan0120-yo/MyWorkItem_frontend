import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWorkItem } from '../../api/client/workItemsApi'
import { workItemQueryKeys } from '../../api/queryKeys/workItemQueryKeys'
import type { MockCurrentUser, WorkItemFormValues } from '../../types/work-item'

type MutationOptions = {
  onSuccess?: () => void
}

export function useCreateWorkItemMutation(
  currentUser: MockCurrentUser,
  options?: MutationOptions,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: WorkItemFormValues) => createWorkItem(currentUser, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workItemQueryKeys.allLists,
      })

      options?.onSuccess?.()
    },
  })
}
