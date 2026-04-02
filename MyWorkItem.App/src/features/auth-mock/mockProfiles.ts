import type { MockCurrentUser } from '../../types/work-item'

export const defaultMockUsers: MockCurrentUser[] = [
  {
    userId: 'user-a',
    userName: 'User A',
    role: 'User',
  },
  {
    userId: 'user-b',
    userName: 'User B',
    role: 'User',
  },
  {
    userId: 'admin-1',
    userName: 'Admin',
    role: 'Admin',
  },
]

export const defaultMockUser = defaultMockUsers[0]

export const mockAuthStorageKey = 'my-work-item.mock-current-user'
