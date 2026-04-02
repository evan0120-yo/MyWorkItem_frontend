export type AppRole = 'User' | 'Admin'

export type PersonalStatus = 'Pending' | 'Confirmed'

export type SortDirection = 'asc' | 'desc'

export type MockCurrentUser = {
  userId: string
  userName: string
  role: AppRole
}

export type WorkItemListItem = {
  id: string
  title: string
  status: PersonalStatus
}

export type WorkItemDetail = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  status: PersonalStatus
}

export type AdminWorkItem = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

export type WorkItemsResponse = {
  items: WorkItemListItem[]
}

export type ConfirmWorkItemsRequest = {
  workItemIds: string[]
}

export type ConfirmWorkItemsResponse = {
  confirmedCount: number
  status: PersonalStatus
}

export type RevertWorkItemConfirmationResponse = {
  workItemId: string
  status: PersonalStatus
}

export type WorkItemFormValues = {
  title: string
  description: string
}
