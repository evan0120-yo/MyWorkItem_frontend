import { fireEvent, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { renderApp } from '../../../test/renderApp'
import {
  problemResponse,
  jsonResponse,
  mockFetchSequence,
} from '../../../test/mockFetch'
import { defaultMockUsers } from '../../../features/auth-mock/mockProfiles'

describe('WorkItemsPage', () => {
  it('WorkItemsPage_WhenLoaded_RendersListFieldsAndPendingStatus', async () => {
    mockFetchSequence([
      jsonResponse({
        items: [
          { id: 'wi-1', title: 'Work Item 1', status: 'Pending' },
          { id: 'wi-2', title: 'Work Item 2', status: 'Confirmed' },
        ],
      }),
    ])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    expect(screen.getByText('正在取得工作項目')).toBeInTheDocument()

    expect(await screen.findByText('Work Item 1')).toBeInTheDocument()
    expect(screen.getByText('Work Item 2')).toBeInTheDocument()
    expect(screen.getByText('wi-1')).toBeInTheDocument()
    expect(screen.getByText('wi-2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '確認選取項目' })).toBeDisabled()
    expect(screen.getAllByText('待確認')[0]).toBeInTheDocument()
  })

  it('WorkItemsPage_WhenSortChanges_RequestsAscendingList', async () => {
    const fetchMock = mockFetchSequence([
      jsonResponse({
        items: [{ id: 'wi-2', title: 'Newest Item', status: 'Pending' }],
      }),
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Oldest Item', status: 'Pending' }],
      }),
    ])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    await screen.findByText('Newest Item')
    fireEvent.click(screen.getByRole('button', { name: '最舊優先' }))
    await screen.findByText('Oldest Item')
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    expect(fetchMock.mock.calls[1]?.[0]).toContain('/api/work-items?sortDirection=asc')
  })

  it('WorkItemsPage_WhenNoItemsExist_RendersEmptyState', async () => {
    mockFetchSequence([jsonResponse({ items: [] })])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    expect(await screen.findByText('目前沒有工作項目。')).toBeInTheDocument()
  })

  it('WorkItemsPage_WhenListQueryFails_RendersPageErrorState', async () => {
    // Query retry = 1, so the error path is hit twice before the page settles.
    mockFetchSequence([
      problemResponse(500, 'Server Error', '工作項目清單請求失敗。'),
      problemResponse(500, 'Server Error', '工作項目清單請求失敗。'),
    ])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    expect(
      await screen.findByText('無法載入工作項目', {}, { timeout: 3000 }),
    ).toBeInTheDocument()
    expect(screen.getByText('工作項目清單請求失敗。')).toBeInTheDocument()
  })

  it('WorkItemsPage_WhenConfirmSucceeds_ClearsSelectionAndRefreshesList', async () => {
    const fetchMock = mockFetchSequence([
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Work Item 1', status: 'Pending' }],
      }),
      jsonResponse({ confirmedCount: 1, status: 'Confirmed' }),
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Work Item 1', status: 'Confirmed' }],
      }),
    ])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    await screen.findByText('Work Item 1')

    const checkbox = screen.getByLabelText('選取 Work Item 1')
    const row = screen.getByText('Work Item 1').closest('tr')

    fireEvent.click(checkbox)
    expect(row).toHaveClass('bg-amber-50')

    fireEvent.click(screen.getByRole('button', { name: '確認選取項目' }))
    await screen.findByText('已成功確認 1 筆工作項目。')
    await screen.findByText('已確認')

    expect(checkbox).not.toBeChecked()
    expect(fetchMock.mock.calls[1]?.[0]).toContain('/api/work-items/confirm')
    expect(fetchMock.mock.calls[1]?.[1]?.body).toBe(
      JSON.stringify({ workItemIds: ['wi-1'] }),
    )
  })

  it('WorkItemsPage_WhenRevertSucceeds_UpdatesTheRowAndShowsSuccessMessage', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    mockFetchSequence([
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Work Item 1', status: 'Confirmed' }],
      }),
      jsonResponse({ workItemId: 'wi-1', status: 'Pending' }),
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Work Item 1', status: 'Pending' }],
      }),
    ])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    const row = (await screen.findByText('Work Item 1')).closest('tr')
    expect(row).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '撤銷確認' }))

    await screen.findByText('已將所選工作項目改回待確認。')
    await screen.findAllByText('待確認')

    expect(window.confirm).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('button', { name: '撤銷確認' }),
    ).not.toBeInTheDocument()
  })

  it('WorkItemsPage_WhenConfirmFails_PreservesSelectionAndShowsError', async () => {
    mockFetchSequence([
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Work Item 1', status: 'Pending' }],
      }),
      problemResponse(404, 'Not Found', '部分已選工作項目已不存在。'),
    ])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    await screen.findByText('Work Item 1')

    const checkbox = screen.getByLabelText('選取 Work Item 1')
    fireEvent.click(checkbox)

    fireEvent.click(screen.getByRole('button', { name: '確認選取項目' }))
    await screen.findByText('部分已選工作項目已不存在。')

    expect(screen.getByText('部分已選工作項目已不存在。')).toBeInTheDocument()
    expect(checkbox).toBeChecked()
  })
})
