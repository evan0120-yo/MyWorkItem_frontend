import type { AppRole, PersonalStatus } from '../types/work-item'

export function getRoleLabel(role: AppRole) {
  return role === 'Admin' ? '管理員' : '一般使用者'
}

export function getStatusLabel(status: PersonalStatus) {
  return status === 'Confirmed' ? '已確認' : '待確認'
}
