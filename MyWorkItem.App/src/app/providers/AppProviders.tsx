import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { MockAuthProvider } from '../../features/auth-mock/MockAuthContext'
import { appQueryClient } from './queryClient'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={appQueryClient}>
      <MockAuthProvider>{children}</MockAuthProvider>
    </QueryClientProvider>
  )
}
