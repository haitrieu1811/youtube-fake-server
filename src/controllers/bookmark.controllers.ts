import { Request, Response } from 'express'

import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import { BookmarkIdReqParams } from '~/models/requests/Bookmark.request'
import { VideoIdReqParams } from '~/models/requests/Video.requests'
import bookmarkService from '~/services/bookmark.services'

// Tạo một bookmark video
export const createBookmarkController = async (req: Request<VideoIdReqParams>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await bookmarkService.createBookmark({ accountId, videoId: req.params.videoId })
  return res.json({
    message: BOOKMARK_MESSAGES.CREATE_BOOKMARK_SUCCEED,
    data: result
  })
}

// Xóa một bookmark video
export const deleteBookmarkController = async (req: Request<BookmarkIdReqParams>, res: Response) => {
  await bookmarkService.deleteBookmark(req.params.bookmarkId)
  return res.json({
    message: BOOKMARK_MESSAGES.DELETE_BOOKMARK_SUCCEED
  })
}
