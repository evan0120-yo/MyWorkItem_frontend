import { buildMockAuthHeaders } from '../../features/auth-mock/MockAuthContext'
import { ApiClientError, type ValidationProblemDetails } from '../../types/api'
import type { MockCurrentUser } from '../../types/work-item'

type RequestOptions = {
  path: string
  method?: string
  currentUser: MockCurrentUser
  body?: unknown
  signal?: AbortSignal
  expectJson?: boolean
}

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:5032'

async function parseProblemDetails(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return (await response.json()) as ValidationProblemDetails
  } catch {
    return null
  }
}

export function apiRequest(options: RequestOptions & { expectJson: false }): Promise<void>
export function apiRequest<T>(options: RequestOptions & { expectJson?: true }): Promise<T>
export async function apiRequest<T>({
  path,
  method = 'GET',
  currentUser,
  body,
  signal,
  expectJson = true,
}: RequestOptions): Promise<T | void> {
  const headers = new Headers(buildMockAuthHeaders(currentUser))

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    throw new ApiClientError('Unable to reach the API right now.', {
      detail: error instanceof Error ? error.message : 'Network request failed.',
    })
  }

  if (!response.ok) {
    const problem = await parseProblemDetails(response)

    throw new ApiClientError(
      problem?.detail || problem?.title || 'Request failed.',
      problem || { status: response.status },
    )
  }

  if (response.status === 204 || !expectJson) {
    return
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    throw new ApiClientError('The API returned a non-JSON success response.', {
      status: response.status,
    })
  }

  return (await response.json()) as T
}
