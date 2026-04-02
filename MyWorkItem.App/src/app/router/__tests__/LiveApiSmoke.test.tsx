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

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: createdTitle },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: createdDescription },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await screen.findByText('Work item admin list')
    await screen.findByText(createdTitle)

    const workItemId = await findWorkItemIdByTitle(createdTitle)
    trackedWorkItemIds.add(workItemId)

    const createdRow = requireRowFromElement(screen.getByText(createdTitle))
    fireEvent.click(within(createdRow).getByRole('button', { name: 'Edit' }))

    await screen.findByDisplayValue(createdTitle)
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: updatedTitle },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: updatedDescription },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await screen.findByText('Work item admin list')
    await screen.findByText(updatedTitle)

    rerenderRoute('/work-items', userA)

    await screen.findByRole('button', { name: updatedTitle })
    let userARow = requireRowFromElement(
      screen.getByRole('button', { name: updatedTitle }),
    )
    expect(within(userARow).getByText('Pending')).toBeInTheDocument()

    fireEvent.click(within(userARow).getByLabelText(`Select ${updatedTitle}`))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm selected' }))
    await screen.findByText('Successfully confirmed 1 work item.')

    await waitFor(() => {
      userARow = requireRowFromElement(screen.getByRole('button', { name: updatedTitle }))
      expect(within(userARow).getByText('Confirmed')).toBeInTheDocument()
    })

    rerenderRoute('/work-items', userA)

    await screen.findByRole('button', { name: updatedTitle })
    userARow = requireRowFromElement(screen.getByRole('button', { name: updatedTitle }))
    expect(within(userARow).getByText('Confirmed')).toBeInTheDocument()
    expect(within(userARow).getByLabelText(`Select ${updatedTitle}`)).not.toBeChecked()

    fireEvent.click(within(userARow).getByRole('button', { name: 'Revert confirmation' }))

    await screen.findByText('Marked the selected work item back to pending.')
    await waitFor(() => {
      userARow = requireRowFromElement(screen.getByRole('button', { name: updatedTitle }))
      expect(within(userARow).getByText('Pending')).toBeInTheDocument()
    })

    rerenderRoute('/work-items', userB)

    await screen.findByRole('button', { name: updatedTitle })
    const userBRow = requireRowFromElement(
      screen.getByRole('button', { name: updatedTitle }),
    )
    expect(within(userBRow).getByText('Pending')).toBeInTheDocument()

    rerenderRoute(`/work-items/${workItemId}`, userA)

    await screen.findByText(updatedTitle)
    expect(screen.getByText(updatedDescription)).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(
      screen.getByText('This item is already pending for the current user.'),
    ).toBeInTheDocument()

    rerenderRoute('/admin/work-items', adminUser)

    await screen.findByText(updatedTitle)
    const updatedRow = requireRowFromElement(screen.getByText(updatedTitle))
    fireEvent.click(within(updatedRow).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(screen.queryByText(updatedTitle)).not.toBeInTheDocument()
    })
    expect(
      screen.getByText('Deleted the work item successfully.'),
    ).toBeInTheDocument()

    trackedWorkItemIds.delete(workItemId)

    rerenderRoute(`/work-items/${workItemId}`, userA)

    await screen.findByText('This work item does not exist anymore.', {}, { timeout: 4000 })
  })
})
