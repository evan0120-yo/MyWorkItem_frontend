import { NavLink, Outlet } from 'react-router-dom'
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
                My Work Item
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--page-ink)]">
                Work items, personal status, and admin actions in one SPA
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-[var(--muted-ink)]">
                The user flow reads personal status from shared APIs. The admin
                flow reuses those read APIs and writes through dedicated admin
                mutations.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="flex items-center gap-3">
                <UserSwitcher />
                <span className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-sm text-[var(--muted-ink)]">
                Current user: <span className="font-semibold">{currentUser.userName}</span>
              </p>
            </div>
          </div>

          <nav className="mt-6 flex flex-wrap gap-2">
            <NavLink to="/work-items" className={({ isActive }) => navClassName(isActive)}>
              Work Items
            </NavLink>
            {currentUser.role === 'Admin' ? (
              <NavLink
                to="/admin/work-items"
                className={({ isActive }) => navClassName(isActive)}
              >
                Admin
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
