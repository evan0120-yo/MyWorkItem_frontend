import type {
  AdminWorkItem,
  WorkItemDetail,
  WorkItemListItem,
  WorkItemsResponse,
} from '../../types/work-item'

export type BackendListItem = {
  id: string
  title: string
  status: 'Pending' | 'Confirmed'
}

export type BackendListResponse = {
  items: BackendListItem[]
}

export type BackendDetailResponse = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  status: 'Pending' | 'Confirmed'
}

export type BackendAdminWorkItemResponse = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

export function mapWorkItemsResponse(
  response: BackendListResponse,
): WorkItemsResponse {
  return {
    items: response.items.map((item): WorkItemListItem => ({
      id: item.id,
      title: item.title,
      status: item.status,
    })),
  }
}

export function mapWorkItemDetail(
  response: BackendDetailResponse,
): WorkItemDetail {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    status: response.status,
  }
}

export function mapAdminWorkItem(
  response: BackendAdminWorkItemResponse,
): AdminWorkItem {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  }
}
