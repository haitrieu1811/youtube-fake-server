import { Query } from 'express-serve-static-core'

import { PaginationReqQuery } from './Common.requests'

// Query: Tìm kiếm
export type SearchReqQuery = Query &
  PaginationReqQuery & {
    searchQuery: string
  }
