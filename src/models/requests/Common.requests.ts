import { Query } from 'express-serve-static-core'

// Query: Phân trang
export type PaginationReqQuery = Query & {
  page?: string
  limit?: string
}
