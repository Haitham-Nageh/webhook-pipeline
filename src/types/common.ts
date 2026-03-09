export type UUID = string

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginationQuery {
  page?: number
  limit?: number
}