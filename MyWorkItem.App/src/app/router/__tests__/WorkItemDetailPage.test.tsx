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

    expect(screen.getByText('Fetching work item detail')).toBeInTheDocument()

    expect(await screen.findByText('Work Item 1')).toBeInTheDocument()
    expect(screen.getByText('Detail body')).toBeInTheDocument()
    expect(screen.getByText('Created At')).toBeInTheDocument()
    expect(screen.getByText('Updated At')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Revert confirmation' }),
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
      await screen.findByText('This work item does not exist anymore.', {}, { timeout: 3000 }),
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
      await user.click(screen.getByRole('button', { name: 'Revert confirmation' }))
    })
    await screen.findByText('Marked the selected work item back to pending.')
    await screen.findByText('This item is already pending for the current user.')

    expect(
      screen.getByText('This item is already pending for the current user.'),
    ).toBeInTheDocument()
    expect(window.confirm).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('button', { name: 'Revert confirmation' }),
    ).not.toBeInTheDocument()
  })

  it('WorkItemDetailPage_WhenRevertFails_ShowsOperationError', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockFetchSequence([
      jsonResponse(createDetailResponse('Confirmed')),
      problemResponse(404, 'Not Found', 'The confirmation record no longer exists.'),
    ])

    renderApp('/work-items/wi-1', { currentUser: defaultMockUsers[0] })

    await screen.findByText('Work Item 1')
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Revert confirmation' }))
    })
    await screen.findByText('The confirmation record no longer exists.')

    expect(
      screen.getByText('The confirmation record no longer exists.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Revert confirmation' }),
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
      await user.click(screen.getByRole('button', { name: 'Back to list' }))
    })
    await screen.findByRole('button', { name: 'Work Item 1' })

    expect(fetchMock.mock.calls[1]?.[0]).toContain('/api/work-items?sortDirection=asc')
  })
})
