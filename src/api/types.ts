export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  perPage: number
  total: number
  pageCount: number
}

export interface ResponseError {
  message: string
  statusCode: number
  error: string
}

export function isResponseError(error: unknown): error is ResponseError {
  return typeof error === 'object' && error !== null && 'message' in error
}
