import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderApp } from '../../../test/renderApp'
import {
  problemResponse,
  jsonResponse,
  mockFetchSequence,
} from '../../../test/mockFetch'
import { defaultMockUsers } from '../../../features/auth-mock/mockProfiles'

describe('AdminWorkItemsPage', () => {
  it('AdminWorkItemsPage_WhenUserIsNotAdmin_RendersForbiddenWithoutFetching', async () => {
    const fetchMock = mockFetchSequence([])

    renderApp('/admin/work-items', { currentUser: defaultMockUsers[0] })

    expect(
      await screen.findByText('此區域僅限管理員使用。'),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('AdminWorkItemsPage_WhenAdminEnters_UsesFixedDescQueryAndShowsActions', async () => {
    const fetchMock = mockFetchSequence([
      jsonResponse({
        items: [{ id: 'wi-2', title: 'Work Item 2', status: 'Pending' }],
      }),
    ])

    renderApp('/admin/work-items', { currentUser: defaultMockUsers[2] })

    expect(screen.getByText('正在取得管理清單')).toBeInTheDocument()
    expect(await screen.findByText('Work Item 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '新增工作項目' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '編輯' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '刪除' })).toBeInTheDocument()
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/api/work-items?sortDirection=desc')
  })

  it('AdminWorkItemsPage_WhenDeleteSucceeds_RefreshesTheList', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockFetchSequence([
      jsonResponse({
        items: [
          { id: 'wi-1', title: 'Work Item 1', status: 'Pending' },
          { id: 'wi-2', title: 'Work Item 2', status: 'Confirmed' },
        ],
      }),
      jsonResponse(undefined, 204),
      jsonResponse({
        items: [{ id: 'wi-2', title: 'Work Item 2', status: 'Confirmed' }],
      }),
    ])

    renderApp('/admin/work-items', { currentUser: defaultMockUsers[2] })

    await screen.findByText('Work Item 1')

    const firstRow = screen.getByText('Work Item 1').closest('tr')
    expect(firstRow).not.toBeNull()

    await act(async () => {
      await user.click(within(firstRow!).getByRole('button', { name: '刪除' }))
    })
    await waitFor(() => {
      expect(screen.queryByText('Work Item 1')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Work Item 2')).toBeInTheDocument()
    expect(
      screen.getByText('已成功刪除工作項目。'),
    ).toBeInTheDocument()
    expect(window.confirm).toHaveBeenCalledTimes(1)
  })

  it('AdminWorkItemsPage_WhenDeleteFails_ShowsErrorAndKeepsRow', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockFetchSequence([
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Work Item 1', status: 'Pending' }],
      }),
      problemResponse(404, 'Not Found', '這筆工作項目已被刪除。'),
    ])

    renderApp('/admin/work-items', { currentUser: defaultMockUsers[2] })

    const row = (await screen.findByText('Work Item 1')).closest('tr')
    expect(row).not.toBeNull()

    await act(async () => {
      await user.click(within(row!).getByRole('button', { name: '刪除' }))
    })
    await screen.findByText('這筆工作項目已被刪除。')

    expect(
      screen.getByText('這筆工作項目已被刪除。'),
    ).toBeInTheDocument()
    expect(screen.getByText('Work Item 1')).toBeInTheDocument()
  })
})
