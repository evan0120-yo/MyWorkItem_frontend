import { NavLink, Outlet } from 'react-router-dom'
import { getRoleLabel } from '../displayText'
import { UserSwitcher } from '../../components/UserSwitcher'
import { useMockAuth } from '../../features/auth-mock/MockAuthContext'

function navClassName(isActive: boolean) {
  return isActive
    ? 'rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white'
    : 'rounded-full px-4 py-2 text-sm font-semibold text-[var(--muted-ink)] transition hover:bg-white/80 hover:text-[var(--page-ink)]'
}

export function AppShell() {
  const { currentUser } = useMockAuth()

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[32px] border border-slate-900/10 bg-white/70 px-6 py-6 shadow-[var(--shadow-soft)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--muted-ink)]">
                我的工作項目
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--page-ink)]">
                在同一個單頁應用程式中處理工作項目、個人狀態與管理操作
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-[var(--muted-ink)]">
                使用者流程會透過共用介面讀取個人狀態；管理流程則沿用讀取介面，
                並透過專用的管理操作寫入資料。
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="flex items-center gap-3">
                <UserSwitcher />
                <span className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  {getRoleLabel(currentUser.role)}
                </span>
              </div>
              <p className="text-sm text-[var(--muted-ink)]">
                目前使用者：{' '}
                <span className="font-semibold">{currentUser.userName}</span>
              </p>
            </div>
          </div>

          <nav className="mt-6 flex flex-wrap gap-2">
            <NavLink to="/work-items" className={({ isActive }) => navClassName(isActive)}>
              工作項目
            </NavLink>
            {currentUser.role === 'Admin' ? (
              <NavLink
                to="/admin/work-items"
                className={({ isActive }) => navClassName(isActive)}
              >
                管理區
              </NavLink>
            ) : null}
          </nav>
        </header>

        <main className="py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
