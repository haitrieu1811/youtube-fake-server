import { Request, Response } from 'express'

import { WATCH_HISTORY_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import { VideoIdReqParams } from '~/models/requests/Video.requests'
import watchHistoryService from '~/services/watchHistory.services'

// Thêm một video vào lịch sử xem
export const createWatchHistoryController = async (req: Request<VideoIdReqParams>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  await watchHistoryService.createWatchHistory({ accountId, videoId: req.params.videoId })
  return res.json({
    message: WATCH_HISTORY_MESSAGES.CREATE_WATCH_HISTORY_SUCCEED
  })
}
