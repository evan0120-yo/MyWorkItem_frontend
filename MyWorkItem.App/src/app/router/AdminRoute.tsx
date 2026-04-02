import { Outlet, useLocation } from 'react-router-dom'
import { StatePanel } from '../../components/StatePanel'
import { useMockAuth } from '../../features/auth-mock/MockAuthContext'

export function AdminRoute() {
  const { currentUser } = useMockAuth()
  const location = useLocation()

  if (currentUser.role !== 'Admin') {
    return (
      <StatePanel
        eyebrow="Forbidden"
        title="This area is reserved for admin users."
        description={`The current user cannot open ${location.pathname}. Switch the mock role to Admin and try again.`}
        tone="warning"
      />
    )
  }

  return <Outlet />
}
