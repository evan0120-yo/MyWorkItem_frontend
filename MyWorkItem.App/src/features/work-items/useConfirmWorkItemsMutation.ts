import { useMutation, useQueryClient } from '@tanstack/react-query'
import { confirmWorkItems } from '../../api/client/workItemsApi'
import { workItemQueryKeys } from '../../api/queryKeys/workItemQueryKeys'
import type { MockCurrentUser } from '../../types/work-item'

type ConfirmOptions = {
  onSuccess?: () => void
}

export function useConfirmWorkItemsMutation(
  currentUser: MockCurrentUser,
  options?: ConfirmOptions,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workItemIds: string[]) =>
      confirmWorkItems(currentUser, { workItemIds }),
    onSuccess: async (_, workItemIds) => {
      await queryClient.invalidateQueries({
        queryKey: workItemQueryKeys.allLists,
      })

      await Promise.all(
        workItemIds.map((workItemId) =>
          queryClient.invalidateQueries({
            queryKey: workItemQueryKeys.detail(currentUser.userId, workItemId),
          }),
        ),
      )

      options?.onSuccess?.()
    },
  })
}
