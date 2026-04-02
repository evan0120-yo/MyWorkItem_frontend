import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProviders } from '../app/providers/AppProviders'
import { AppRoutes } from '../app/router/AppRouter'
import {
  defaultMockUser,
  mockAuthStorageKey,
} from '../features/auth-mock/mockProfiles'
import type { MockCurrentUser } from '../types/work-item'

type RenderAppOptions = {
  currentUser?: MockCurrentUser | null
}

export function renderApp(path: string, options?: RenderAppOptions) {
  const currentUser =
    options?.currentUser === undefined ? defaultMockUser : options.currentUser

  if (currentUser) {
    window.localStorage.setItem(mockAuthStorageKey, JSON.stringify(currentUser))
  } else {
    window.localStorage.removeItem(mockAuthStorageKey)
  }

  return render(
    <AppProviders>
      <MemoryRouter
        initialEntries={[path]}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>,
  )
}
