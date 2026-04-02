import { vi } from 'vitest'

type JsonResponseDefinition = {
  type?: 'json'
  status?: number
  body?: unknown
}

type NetworkErrorDefinition = {
  type: 'network-error'
  message?: string
}

export type MockResponseDefinition =
  | JsonResponseDefinition
  | NetworkErrorDefinition

export function jsonResponse(
  body: unknown,
  status = 200,
): MockResponseDefinition {
  return {
    type: 'json',
    status,
    body,
  }
}

export function problemResponse(
  status: number,
  title: string,
  detail?: string,
  errors?: Record<string, string[]>,
): MockResponseDefinition {
  return jsonResponse(
    {
      status,
      title,
      detail,
      errors,
    },
    status,
  )
}

export function networkError(message = 'Network request failed.') {
  return {
    type: 'network-error',
    message,
  } satisfies MockResponseDefinition
}

export function mockFetchSequence(definitions: MockResponseDefinition[]) {
  const queue = [...definitions]
  const fetchMock = vi.fn(async () => {
    if (queue.length === 0) {
      throw new Error('Unexpected fetch call.')
    }

    const next = queue.shift()!

    if (next.type === 'network-error') {
      throw new Error(next.message ?? 'Network request failed.')
    }

    const body =
      next.body === undefined ? undefined : JSON.stringify(next.body)
    const headers = new Headers()

    if (next.body !== undefined) {
      headers.set('Content-Type', 'application/json')
    }

    return new Response(body, {
      status: next.status ?? 200,
      headers,
    })
  })

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

export function getRequestHeaders(fetchMock: ReturnType<typeof vi.fn>, index = 0) {
  const requestInit = fetchMock.mock.calls[index]?.[1] as RequestInit | undefined
  return new Headers(requestInit?.headers)
}
