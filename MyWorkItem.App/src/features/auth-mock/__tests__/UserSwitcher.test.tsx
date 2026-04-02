import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../../../test/renderApp'
import {
  getRequestHeaders,
  jsonResponse,
  mockFetchSequence,
} from '../../../test/mockFetch'
import { defaultMockUsers } from '../mockProfiles'

describe('UserSwitcher', () => {
  it('App_WhenNoStoredMockUser_UsesDefaultUserAForHeaders', async () => {
    const fetchMock = mockFetchSequence([jsonResponse({ items: [] })])

    renderApp('/work-items', { currentUser: null })

    expect(screen.getByText('正在取得工作項目')).toBeInTheDocument()
    await screen.findByText('目前沒有工作項目。')

    const headers = getRequestHeaders(fetchMock)

    expect(headers.get('X-Mock-User-Id')).toBe('user-a')
    expect(headers.get('X-Mock-User-Name')).toBe('User A')
    expect(headers.get('X-Mock-Role')).toBe('User')
    expect(screen.getByRole('combobox')).toHaveValue('user-a')
  })

  it('UserSwitcher_WhenProfileChanges_UpdatesStoredMockUserAndShowsAdminEntry', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Work Item 1', status: 'Pending' }],
      }),
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Work Item 1', status: 'Pending' }],
      }),
    ])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    await screen.findByText('Work Item 1')

    await act(async () => {
      await user.selectOptions(screen.getByRole('combobox'), 'admin-1')
    })
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    const headers = getRequestHeaders(fetchMock, 1)

    expect(headers.get('X-Mock-User-Id')).toBe('admin-1')
    expect(headers.get('X-Mock-User-Name')).toBe('Admin')
    expect(headers.get('X-Mock-Role')).toBe('Admin')
    expect(screen.getByRole('link', { name: '管理區' })).toBeInTheDocument()
  })
})
