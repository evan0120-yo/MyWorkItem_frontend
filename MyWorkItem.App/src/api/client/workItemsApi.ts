import {
  type BackendAdminWorkItemResponse,
  type BackendDetailResponse,
  type BackendListResponse,
  mapAdminWorkItem,
  mapWorkItemDetail,
  mapWorkItemsResponse,
} from '../mappers/workItemMappers'
import type {
  AdminWorkItem,
  ConfirmWorkItemsRequest,
  ConfirmWorkItemsResponse,
  MockCurrentUser,
  RevertWorkItemConfirmationResponse,
  SortDirection,
  WorkItemDetail,
  WorkItemFormValues,
  WorkItemsResponse,
} from '../../types/work-item'
import { apiRequest } from './apiClient'

function createListQueryString(sortDirection: SortDirection) {
  const params = new URLSearchParams({ sortDirection })
  return `?${params.toString()}`
}

export async function getWorkItems(
  currentUser: MockCurrentUser,
  sortDirection: SortDirection,
  signal?: AbortSignal,
): Promise<WorkItemsResponse> {
  const response = await apiRequest<BackendListResponse>({
    path: `/api/work-items${createListQueryString(sortDirection)}`,
    currentUser,
    signal,
  })

  return mapWorkItemsResponse(response)
}

export async function getWorkItemDetail(
  currentUser: MockCurrentUser,
  workItemId: string,
  signal?: AbortSignal,
): Promise<WorkItemDetail> {
  const response = await apiRequest<BackendDetailResponse>({
    path: `/api/work-items/${workItemId}`,
    currentUser,
    signal,
  })

  return mapWorkItemDetail(response)
}

export async function confirmWorkItems(
  currentUser: MockCurrentUser,
  request: ConfirmWorkItemsRequest,
): Promise<ConfirmWorkItemsResponse> {
  return apiRequest<ConfirmWorkItemsResponse>({
    path: '/api/work-items/confirm',
    method: 'POST',
    currentUser,
    body: request,
  })
}

export async function revertWorkItemConfirmation(
  currentUser: MockCurrentUser,
  workItemId: string,
): Promise<RevertWorkItemConfirmationResponse> {
  return apiRequest<RevertWorkItemConfirmationResponse>({
    path: `/api/work-items/${workItemId}/revert-confirmation`,
    method: 'POST',
    currentUser,
  })
}

export async function createWorkItem(
  currentUser: MockCurrentUser,
  values: WorkItemFormValues,
): Promise<AdminWorkItem> {
  const response = await apiRequest<BackendAdminWorkItemResponse>({
    path: '/api/admin/work-items',
    method: 'POST',
    currentUser,
    body: values,
  })

  return mapAdminWorkItem(response)
}

export async function updateWorkItem(
  currentUser: MockCurrentUser,
  workItemId: string,
  values: WorkItemFormValues,
): Promise<AdminWorkItem> {
  const response = await apiRequest<BackendAdminWorkItemResponse>({
    path: `/api/admin/work-items/${workItemId}`,
    method: 'PUT',
    currentUser,
    body: values,
  })

  return mapAdminWorkItem(response)
}

export async function deleteWorkItem(
  currentUser: MockCurrentUser,
  workItemId: string,
): Promise<void> {
  await apiRequest({
    path: `/api/admin/work-items/${workItemId}`,
    method: 'DELETE',
    currentUser,
    expectJson: false,
  })
}
