export type ProblemDetails = {
  status?: number
  title?: string
  detail?: string
  instance?: string
}

export type ValidationProblemDetails = ProblemDetails & {
  errors?: Record<string, string[]>
}

export class ApiClientError extends Error {
  status?: number
  title?: string
  detail?: string
  errors?: Record<string, string[]>

  constructor(message: string, options?: ValidationProblemDetails) {
    super(message)
    this.name = 'ApiClientError'
    this.status = options?.status
    this.title = options?.title
    this.detail = options?.detail
    this.errors = options?.errors
  }
}
