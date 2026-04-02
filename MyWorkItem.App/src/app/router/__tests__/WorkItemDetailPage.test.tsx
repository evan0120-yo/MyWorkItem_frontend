import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderApp } from '../../../test/renderApp'
import {
  problemResponse,
  jsonResponse,
  mockFetchSequence,
} from '../../../test/mockFetch'
import { defaultMockUsers } from '../../../features/auth-mock/mockProfiles'

function createDetailResponse(status: 'Pending' | 'Confirmed') {
  return {
    id: 'wi-1',
    title: 'Work Item 1',
    description: 'Detail body',
    createdAt: '2026-04-01T08:30:00Z',
    updatedAt: '2026-04-01T10:45:00Z',
    status,
  }
}

describe('WorkItemDetailPage', () => {
  it('WorkItemDetailPage_WhenItemExists_RendersDetailFields', async () => {
    mockFetchSequence([jsonResponse(createDetailResponse('Confirmed'))])

    renderApp('/work-items/wi-1', { currentUser: defaultMockUsers[0] })

    expect(screen.getByText('正在取得工作項目詳情')).toBeInTheDocument()

    expect(await screen.findByText('Work Item 1')).toBeInTheDocument()
    expect(screen.getByText('Detail body')).toBeInTheDocument()
    expect(screen.getByText('建立時間')).toBeInTheDocument()
    expect(screen.getByText('更新時間')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '撤銷確認' }),
    ).toBeInTheDocument()
  })

  it('WorkItemDetailPage_WhenItemDoesNotExist_RendersNotFound', async () => {
    // Query retry = 1, so the 404 path is hit twice before the page settles.
    mockFetchSequence([
      problemResponse(404, 'Not Found', 'The requested work item could not be found.'),
      problemResponse(404, 'Not Found', 'The requested work item could not be found.'),
    ])

    renderApp('/work-items/wi-404', { currentUser: defaultMockUsers[0] })

    expect(
      await screen.findByText('這筆工作項目已不存在。', {}, { timeout: 3000 }),
    ).toBeInTheDocument()
  })

  it('WorkItemDetailPage_WhenRevertSucceeds_RendersPendingState', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockFetchSequence([
      jsonResponse(createDetailResponse('Confirmed')),
      jsonResponse({ workItemId: 'wi-1', status: 'Pending' }),
      jsonResponse(createDetailResponse('Pending')),
    ])

    renderApp('/work-items/wi-1', { currentUser: defaultMockUsers[0] })

    await screen.findByText('Work Item 1')
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '撤銷確認' }))
    })
    await screen.findByText('已將所選工作項目改回待確認。')
    await screen.findByText('這筆工作項目對目前使用者已是待確認狀態。')

    expect(
      screen.getByText('這筆工作項目對目前使用者已是待確認狀態。'),
    ).toBeInTheDocument()
    expect(window.confirm).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('button', { name: '撤銷確認' }),
    ).not.toBeInTheDocument()
  })

  it('WorkItemDetailPage_WhenRevertFails_ShowsOperationError', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockFetchSequence([
      jsonResponse(createDetailResponse('Confirmed')),
      problemResponse(404, 'Not Found', '確認紀錄已不存在。'),
    ])

    renderApp('/work-items/wi-1', { currentUser: defaultMockUsers[0] })

    await screen.findByText('Work Item 1')
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '撤銷確認' }))
    })
    await screen.findByText('確認紀錄已不存在。')

    expect(
      screen.getByText('確認紀錄已不存在。'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '撤銷確認' }),
    ).toBeInTheDocument()
  })

  it('WorkItemDetailPage_WhenBackClicked_RestoresTheOriginalSortQuery', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      jsonResponse(createDetailResponse('Pending')),
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Work Item 1', status: 'Pending' }],
      }),
    ])

    renderApp('/work-items/wi-1?sortDirection=asc', {
      currentUser: defaultMockUsers[0],
    })

    await screen.findByText('Work Item 1')
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '返回清單' }))
    })
    await screen.findByRole('button', { name: 'Work Item 1' })

    expect(fetchMock.mock.calls[1]?.[0]).toContain('/api/work-items?sortDirection=asc')
  })
})
