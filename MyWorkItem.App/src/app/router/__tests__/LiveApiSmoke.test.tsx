import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { deleteWorkItem, getWorkItems } from '../../../api/client/workItemsApi'
import { appQueryClient } from '../../providers/queryClient'
import { defaultMockUsers } from '../../../features/auth-mock/mockProfiles'
import { renderApp } from '../../../test/renderApp'
import type { MockCurrentUser } from '../../../types/work-item'

const describeLive = process.env.LIVE_API_SMOKE === '1' ? describe : describe.skip

const userA = defaultMockUsers[0]
const userB = defaultMockUsers[1]
const adminUser = defaultMockUsers[2]
const trackedWorkItemIds = new Set<string>()

function rerenderRoute(path: string, currentUser: MockCurrentUser) {
  cleanup()
  appQueryClient.clear()
  renderApp(path, { currentUser })
}

function requireRowFromElement(element: HTMLElement) {
  const row = element.closest('tr')

  if (!row) {
    throw new Error('Expected element to be rendered inside a table row.')
  }

  return row
}

async function findWorkItemIdByTitle(title: string) {
  const response = await getWorkItems(adminUser, 'desc')
  const matched = response.items.find((item) => item.title === title)

  if (!matched) {
    throw new Error(`Unable to find work item id for title '${title}'.`)
  }

  return matched.id
}

async function cleanupTrackedWorkItems() {
  const pendingIds = [...trackedWorkItemIds]
  trackedWorkItemIds.clear()

  await Promise.all(
    pendingIds.map(async (workItemId) => {
      try {
        await deleteWorkItem(adminUser, workItemId)
      } catch {
        // Best-effort cleanup for live smoke data.
      }
    }),
  )
}

afterEach(async () => {
  await cleanupTrackedWorkItems()
})

describeLive('Live API smoke', () => {
  it('runs the user and admin flows against the live backend', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const marker = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
    const createdTitle = `live-create-${marker}`
    const updatedTitle = `live-update-${marker}`
    const createdDescription = `live-description-${marker}`
    const updatedDescription = `live-description-updated-${marker}`

    rerenderRoute('/admin/work-items/new', adminUser)

    fireEvent.change(screen.getByLabelText('標題'), {
      target: { value: createdTitle },
    })
    fireEvent.change(screen.getByLabelText('描述'), {
      target: { value: createdDescription },
    })
    fireEvent.click(screen.getByRole('button', { name: '新增' }))

    await screen.findByText('工作項目管理清單')
    await screen.findByText(createdTitle)

    const workItemId = await findWorkItemIdByTitle(createdTitle)
    trackedWorkItemIds.add(workItemId)

    const createdRow = requireRowFromElement(screen.getByText(createdTitle))
    fireEvent.click(within(createdRow).getByRole('button', { name: '編輯' }))

    await screen.findByDisplayValue(createdTitle)
    fireEvent.change(screen.getByLabelText('標題'), {
      target: { value: updatedTitle },
    })
    fireEvent.change(screen.getByLabelText('描述'), {
      target: { value: updatedDescription },
    })
    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }))

    await screen.findByText('工作項目管理清單')
    await screen.findByText(updatedTitle)

    rerenderRoute('/work-items', userA)

    await screen.findByRole('button', { name: updatedTitle })
    let userARow = requireRowFromElement(
      screen.getByRole('button', { name: updatedTitle }),
    )
    expect(within(userARow).getByText('待確認')).toBeInTheDocument()

    fireEvent.click(within(userARow).getByLabelText(`選取 ${updatedTitle}`))
    fireEvent.click(screen.getByRole('button', { name: '確認選取項目' }))
    await screen.findByText('已成功確認 1 筆工作項目。')

    await waitFor(() => {
      userARow = requireRowFromElement(screen.getByRole('button', { name: updatedTitle }))
      expect(within(userARow).getByText('已確認')).toBeInTheDocument()
    })

    rerenderRoute('/work-items', userA)

    await screen.findByRole('button', { name: updatedTitle })
    userARow = requireRowFromElement(screen.getByRole('button', { name: updatedTitle }))
    expect(within(userARow).getByText('已確認')).toBeInTheDocument()
    expect(within(userARow).getByLabelText(`選取 ${updatedTitle}`)).not.toBeChecked()

    fireEvent.click(within(userARow).getByRole('button', { name: '撤銷確認' }))

    await screen.findByText('已將所選工作項目改回待確認。')
    await waitFor(() => {
      userARow = requireRowFromElement(screen.getByRole('button', { name: updatedTitle }))
      expect(within(userARow).getByText('待確認')).toBeInTheDocument()
    })

    rerenderRoute('/work-items', userB)

    await screen.findByRole('button', { name: updatedTitle })
    const userBRow = requireRowFromElement(
      screen.getByRole('button', { name: updatedTitle }),
    )
    expect(within(userBRow).getByText('待確認')).toBeInTheDocument()

    rerenderRoute(`/work-items/${workItemId}`, userA)

    await screen.findByText(updatedTitle)
    expect(screen.getByText(updatedDescription)).toBeInTheDocument()
    expect(screen.getByText('待確認')).toBeInTheDocument()
    expect(
      screen.getByText('這筆工作項目對目前使用者已是待確認狀態。'),
    ).toBeInTheDocument()

    rerenderRoute('/admin/work-items', adminUser)

    await screen.findByText(updatedTitle)
    const updatedRow = requireRowFromElement(screen.getByText(updatedTitle))
    fireEvent.click(within(updatedRow).getByRole('button', { name: '刪除' }))

    await waitFor(() => {
      expect(screen.queryByText(updatedTitle)).not.toBeInTheDocument()
    })
    expect(
      screen.getByText('已成功刪除工作項目。'),
    ).toBeInTheDocument()

    trackedWorkItemIds.delete(workItemId)

    rerenderRoute(`/work-items/${workItemId}`, userA)

    await screen.findByText('這筆工作項目已不存在。', {}, { timeout: 4000 })
  })
})
