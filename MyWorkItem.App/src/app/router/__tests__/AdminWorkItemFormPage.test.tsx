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

    fireEvent.click(screen.getByRole('button', { name: '新增' }))
    await screen.findByText('請輸入標題。')

    expect(screen.getByText('請輸入標題。')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('AdminWorkItemCreatePage_WhenTitleIsTooLong_ShowsValidationErrorWithoutRequest', async () => {
    const fetchMock = mockFetchSequence([])

    renderApp('/admin/work-items/new', { currentUser: defaultMockUsers[2] })

    fireEvent.change(screen.getByLabelText('標題'), {
      target: { value: 'A'.repeat(201) },
    })

    fireEvent.click(screen.getByRole('button', { name: '新增' }))
    await screen.findByText('標題長度不可超過 200 個字元。')

    expect(
      screen.getByText('標題長度不可超過 200 個字元。'),
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

    fireEvent.change(screen.getByLabelText('標題'), {
      target: { value: 'Created Item' },
    })
    fireEvent.change(screen.getByLabelText('描述'), {
      target: { value: 'Created body' },
    })

    fireEvent.click(screen.getByRole('button', { name: '新增' }))
    await screen.findByText('工作項目管理清單')
    await screen.findByText('Created Item')
    await screen.findByText('已成功新增工作項目。')

    expect(screen.getByText('工作項目管理清單')).toBeInTheDocument()
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
      await screen.findByText('這筆工作項目已無法編輯。', {}, { timeout: 3000 }),
    ).toBeInTheDocument()
  })

  it('AdminWorkItemEditPage_WhenTitleIsEmpty_ShowsValidationErrorWithoutUpdateRequest', async () => {
    const fetchMock = mockFetchSequence([jsonResponse(createDetailResponse())])

    renderApp('/admin/work-items/wi-1/edit', { currentUser: defaultMockUsers[2] })

    expect(await screen.findByDisplayValue('Work Item 1')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('標題'), {
      target: { value: '   ' },
    })

    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }))
    await screen.findByText('請輸入標題。')

    expect(screen.getByText('請輸入標題。')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('AdminWorkItemEditPage_WhenDescriptionIsTooLong_ShowsValidationErrorWithoutUpdateRequest', async () => {
    const fetchMock = mockFetchSequence([jsonResponse(createDetailResponse())])

    renderApp('/admin/work-items/wi-1/edit', { currentUser: defaultMockUsers[2] })

    expect(await screen.findByDisplayValue('Work Item 1')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('描述'), {
      target: { value: 'D'.repeat(2001) },
    })

    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }))
    await screen.findByText('描述長度不可超過 2000 個字元。')

    expect(
      screen.getByText('描述長度不可超過 2000 個字元。'),
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

    expect(screen.getByText('正在載入待編輯的工作項目')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Work Item 1')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('標題'), {
      target: { value: 'Updated Item' },
    })

    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }))
    await screen.findByText('工作項目管理清單')
    await screen.findByText('Updated Item')
    await screen.findByText('已成功更新工作項目。')

    expect(screen.getByText('工作項目管理清單')).toBeInTheDocument()
    expect(screen.getByText('Updated Item')).toBeInTheDocument()
  })
})
