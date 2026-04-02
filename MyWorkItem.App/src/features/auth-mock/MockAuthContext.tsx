import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type { MockCurrentUser } from '../../types/work-item'
import {
  defaultMockUser,
  defaultMockUsers,
  mockAuthStorageKey,
} from './mockProfiles'

type MockAuthContextValue = {
  currentUser: MockCurrentUser
  users: MockCurrentUser[]
  setCurrentUser: (user: MockCurrentUser) => void
}

const MockAuthContext = createContext<MockAuthContextValue | null>(null)

function readStoredMockUser() {
  if (typeof window === 'undefined') {
    return defaultMockUser
  }

  const rawValue = window.localStorage.getItem(mockAuthStorageKey)

  if (!rawValue) {
    return defaultMockUser
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<MockCurrentUser>
    const matchedUser = defaultMockUsers.find(
      (candidate) =>
        candidate.userId === parsed.userId &&
        candidate.role === parsed.role &&
        candidate.userName === parsed.userName,
    )

    return matchedUser ?? defaultMockUser
  } catch {
    return defaultMockUser
  }
}

export function MockAuthProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<MockCurrentUser>(() =>
    readStoredMockUser(),
  )

  useEffect(() => {
    window.localStorage.setItem(mockAuthStorageKey, JSON.stringify(currentUser))
  }, [currentUser])

  return (
    <MockAuthContext.Provider
      value={{
        currentUser,
        users: defaultMockUsers,
        setCurrentUser,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  )
}

export function useMockAuth() {
  const context = useContext(MockAuthContext)

  if (!context) {
    throw new Error('useMockAuth must be used within MockAuthProvider.')
  }

  return context
}

export function buildMockAuthHeaders(currentUser: MockCurrentUser) {
  return {
    'X-Mock-User-Id': currentUser.userId,
    'X-Mock-User-Name': currentUser.userName,
    'X-Mock-Role': currentUser.role,
  }
}
