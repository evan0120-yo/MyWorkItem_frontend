import type { ChangeEvent } from 'react'
import { getRoleLabel } from '../app/displayText'
import { useMockAuth } from '../features/auth-mock/MockAuthContext'

export function UserSwitcher() {
  const { currentUser, users, setCurrentUser } = useMockAuth()

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextUser = users.find((user) => user.userId === event.target.value)

    if (nextUser) {
      setCurrentUser(nextUser)
    }
  }

  return (
    <label className="flex items-center gap-3 rounded-full border border-slate-900/10 bg-white/80 px-3 py-2 text-sm shadow-sm">
      <span className="font-semibold text-[var(--muted-ink)]">使用者</span>
      <select
        value={currentUser.userId}
        onChange={handleChange}
        className="min-w-32 border-none bg-transparent text-sm font-medium text-[var(--page-ink)] outline-none"
      >
        {users.map((user) => (
          <option key={user.userId} value={user.userId}>
            {user.userName}（{getRoleLabel(user.role)}）
          </option>
        ))}
      </select>
    </label>
  )
}
