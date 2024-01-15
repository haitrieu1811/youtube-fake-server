import { ParamsDictionary, Query } from 'express-serve-static-core'
import { PaginationReqQuery } from './Common.requests'

export type WatchHistoryIdReqParams = ParamsDictionary & {
  watchHistoryId: string
}

export type GetWatchHistoriesReqQuery = Query &
  PaginationReqQuery & {
    searchQuery?: string
  }
