import { workItemQueryKeys } from '../../../api/queryKeys/workItemQueryKeys'

describe('workItemQueryKeys', () => {
  it('workItemQueryKeys_WhenBuildingListKey_IncludesUserIdAndSortDirection', () => {
    expect(workItemQueryKeys.lists('user-a', 'asc')).toEqual([
      'work-items',
      { userId: 'user-a', sortDirection: 'asc' },
    ])
  })

  it('workItemQueryKeys_WhenBuildingDetailKey_IncludesUserIdAndWorkItemId', () => {
    expect(workItemQueryKeys.detail('user-a', 'wi-1')).toEqual([
      'work-item',
      { userId: 'user-a', workItemId: 'wi-1' },
    ])
  })
})
