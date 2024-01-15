import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { WATCH_HISTORY_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import { VideoIdReqParams } from '~/models/requests/Video.requests'
import { WatchHistoryIdReqParams } from '~/models/requests/WatchHistory.requests'
import watchHistoryService from '~/services/watchHistory.services'

// Thêm một video vào lịch sử xem
export const createWatchHistoryController = async (req: Request<VideoIdReqParams>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  await watchHistoryService.createWatchHistory({ accountId, videoId: req.params.videoId })
  return res.json({
    message: WATCH_HISTORY_MESSAGES.CREATE_WATCH_HISTORY_SUCCEED
  })
}

// Lấy lịch sử video đã xem
export const getWatchHistoriesController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const { videos, ...pagination } = await watchHistoryService.getWatchHistories({ accountId, query: req.query })
  return res.json({
    message: WATCH_HISTORY_MESSAGES.GET_WATCH_HISTORIES_SUCCEED,
    data: {
      videos,
      pagination
    }
  })
}

// Xóa một lịch sử xem
export const deleteWatchHistoryController = async (req: Request<WatchHistoryIdReqParams>, res: Response) => {
  await watchHistoryService.deleteWatchHistory(req.params.watchHistoryId)
  return res.json({
    message: WATCH_HISTORY_MESSAGES.DELETE_WATCH_HISTORY_SUCCEED
  })
}

// Xóa toàn bộ lịch sử xem
export const deleteAllWatchHistoriesController = async (req: Request, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  await watchHistoryService.deleteAllWatchHistories(accountId)
  return res.json({
    message: WATCH_HISTORY_MESSAGES.DELETE_ALL_WATCH_HISTORIES_SUCCEED
  })
}
