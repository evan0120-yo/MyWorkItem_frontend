import { fireEvent, screen, waitFor } from '@testing-library/react'
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

    expect(screen.getByText('Fetching work items')).toBeInTheDocument()

    expect(await screen.findByText('Work Item 1')).toBeInTheDocument()
    expect(screen.getByText('Work Item 2')).toBeInTheDocument()
    expect(screen.getByText('wi-1')).toBeInTheDocument()
    expect(screen.getByText('wi-2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm selected' })).toBeDisabled()
    expect(screen.getAllByText('Pending')[0]).toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button', { name: 'Oldest first' }))
    await screen.findByText('Oldest Item')
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    expect(fetchMock.mock.calls[1]?.[0]).toContain('/api/work-items?sortDirection=asc')
  })

  it('WorkItemsPage_WhenNoItemsExist_RendersEmptyState', async () => {
    mockFetchSequence([jsonResponse({ items: [] })])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    expect(await screen.findByText('There are no work items yet.')).toBeInTheDocument()
  })

  it('WorkItemsPage_WhenListQueryFails_RendersPageErrorState', async () => {
    // Query retry = 1, so the error path is hit twice before the page settles.
    mockFetchSequence([
      problemResponse(500, 'Server Error', 'The work item list request failed.'),
      problemResponse(500, 'Server Error', 'The work item list request failed.'),
    ])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    expect(
      await screen.findByText('Unable to load work items', {}, { timeout: 3000 }),
    ).toBeInTheDocument()
    expect(screen.getByText('The work item list request failed.')).toBeInTheDocument()
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

    const checkbox = screen.getByLabelText('Select Work Item 1')
    fireEvent.click(checkbox)

    fireEvent.click(screen.getByRole('button', { name: 'Confirm selected' }))
    await screen.findByText('Confirmed')

    expect(checkbox).not.toBeChecked()
    expect(fetchMock.mock.calls[1]?.[0]).toContain('/api/work-items/confirm')
    expect(fetchMock.mock.calls[1]?.[1]?.body).toBe(
      JSON.stringify({ workItemIds: ['wi-1'] }),
    )
  })

  it('WorkItemsPage_WhenConfirmFails_PreservesSelectionAndShowsError', async () => {
    mockFetchSequence([
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Work Item 1', status: 'Pending' }],
      }),
      problemResponse(404, 'Not Found', 'Some selected work items no longer exist.'),
    ])

    renderApp('/work-items', { currentUser: defaultMockUsers[0] })

    await screen.findByText('Work Item 1')

    const checkbox = screen.getByLabelText('Select Work Item 1')
    fireEvent.click(checkbox)

    fireEvent.click(screen.getByRole('button', { name: 'Confirm selected' }))
    await screen.findByText('Some selected work items no longer exist.')

    expect(screen.getByText('Some selected work items no longer exist.')).toBeInTheDocument()
    expect(checkbox).toBeChecked()
  })
})
