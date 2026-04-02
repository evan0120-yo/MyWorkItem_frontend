import { fireEvent, screen } from '@testing-library/react'
import { renderApp } from '../../../test/renderApp'
import { jsonResponse, mockFetchSequence, problemResponse } from '../../../test/mockFetch'
import { defaultMockUsers } from '../../../features/auth-mock/mockProfiles'

function createDetailResponse() {
  return {
    id: 'wi-1',
    title: 'Work Item 1',
    description: 'Editable body',
    createdAt: '2026-04-01T08:30:00Z',
    updatedAt: '2026-04-01T10:45:00Z',
    status: 'Pending',
  }
}

describe('AdminWorkItemFormPage', () => {
  it('AdminWorkItemCreatePage_WhenTitleIsEmpty_ShowsValidationErrorWithoutRequest', async () => {
    const fetchMock = mockFetchSequence([])

    renderApp('/admin/work-items/new', { currentUser: defaultMockUsers[2] })

    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    await screen.findByText('Title is required.')

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('AdminWorkItemCreatePage_WhenTitleIsTooLong_ShowsValidationErrorWithoutRequest', async () => {
    const fetchMock = mockFetchSequence([])

    renderApp('/admin/work-items/new', { currentUser: defaultMockUsers[2] })

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'A'.repeat(201) },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    await screen.findByText('Title must be 200 characters or fewer.')

    expect(
      screen.getByText('Title must be 200 characters or fewer.'),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('AdminWorkItemCreatePage_WhenSubmitSucceeds_NavigatesBackToAdminList', async () => {
    mockFetchSequence([
      jsonResponse({
        id: 'wi-3',
        title: 'Created Item',
        description: 'Created body',
        createdAt: '2026-04-01T10:45:00Z',
        updatedAt: '2026-04-01T10:45:00Z',
      }),
      jsonResponse({
        items: [{ id: 'wi-3', title: 'Created Item', status: 'Pending' }],
      }),
    ])

    renderApp('/admin/work-items/new', { currentUser: defaultMockUsers[2] })

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Created Item' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Created body' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    await screen.findByText('Work item admin list')
    await screen.findByText('Created Item')
    await screen.findByText('Created the work item successfully.')

    expect(screen.getByText('Work item admin list')).toBeInTheDocument()
    expect(screen.getByText('Created Item')).toBeInTheDocument()
  })

  it('AdminWorkItemEditPage_WhenItemNotFound_RendersNotFound', async () => {
    // Query retry = 1, so the 404 path is hit twice before the page settles.
    mockFetchSequence([
      problemResponse(404, 'Not Found', 'The work item does not exist anymore.'),
      problemResponse(404, 'Not Found', 'The work item does not exist anymore.'),
    ])

    renderApp('/admin/work-items/wi-404/edit', { currentUser: defaultMockUsers[2] })

    expect(
      await screen.findByText('This work item can no longer be edited.', {}, { timeout: 3000 }),
    ).toBeInTheDocument()
  })

  it('AdminWorkItemEditPage_WhenTitleIsEmpty_ShowsValidationErrorWithoutUpdateRequest', async () => {
    const fetchMock = mockFetchSequence([jsonResponse(createDetailResponse())])

    renderApp('/admin/work-items/wi-1/edit', { currentUser: defaultMockUsers[2] })

    expect(await screen.findByDisplayValue('Work Item 1')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '   ' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText('Title is required.')

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('AdminWorkItemEditPage_WhenDescriptionIsTooLong_ShowsValidationErrorWithoutUpdateRequest', async () => {
    const fetchMock = mockFetchSequence([jsonResponse(createDetailResponse())])

    renderApp('/admin/work-items/wi-1/edit', { currentUser: defaultMockUsers[2] })

    expect(await screen.findByDisplayValue('Work Item 1')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'D'.repeat(2001) },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText('Description must be 2000 characters or fewer.')

    expect(
      screen.getByText('Description must be 2000 characters or fewer.'),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('AdminWorkItemEditPage_WhenUpdateSucceeds_NavigatesBackToAdminList', async () => {
    mockFetchSequence([
      jsonResponse(createDetailResponse()),
      jsonResponse({
        id: 'wi-1',
        title: 'Updated Item',
        description: 'Editable body',
        createdAt: '2026-04-01T08:30:00Z',
        updatedAt: '2026-04-01T11:10:00Z',
      }),
      jsonResponse({
        id: 'wi-1',
        title: 'Updated Item',
        description: 'Editable body',
        createdAt: '2026-04-01T08:30:00Z',
        updatedAt: '2026-04-01T11:10:00Z',
        status: 'Pending',
      }),
      jsonResponse({
        items: [{ id: 'wi-1', title: 'Updated Item', status: 'Pending' }],
      }),
    ])

    renderApp('/admin/work-items/wi-1/edit', { currentUser: defaultMockUsers[2] })

    expect(screen.getByText('Fetching work item for editing')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Work Item 1')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Updated Item' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText('Work item admin list')
    await screen.findByText('Updated Item')
    await screen.findByText('Updated the work item successfully.')

    expect(screen.getByText('Work item admin list')).toBeInTheDocument()
    expect(screen.getByText('Updated Item')).toBeInTheDocument()
  })
})
