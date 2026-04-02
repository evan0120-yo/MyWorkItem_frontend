import { Outlet, useLocation } from 'react-router-dom'
import { StatePanel } from '../../components/StatePanel'
import { useMockAuth } from '../../features/auth-mock/MockAuthContext'

export function AdminRoute() {
  const { currentUser } = useMockAuth()
  const location = useLocation()

  if (currentUser.role !== 'Admin') {
    return (
      <StatePanel
        eyebrow="無權限"
        title="此區域僅限管理員使用。"
        description={`目前使用者無法開啟 ${location.pathname}。請切換為管理員角色後再試一次。`}
        tone="warning"
      />
    )
  }

  return <Outlet />
}
