import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import { BookmarkIdReqParams } from '~/models/requests/Bookmark.request'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import { VideoIdReqParams } from '~/models/requests/Video.requests'
import bookmarkService from '~/services/bookmark.services'

// Add a bookmark video
export const createBookmarkController = async (req: Request<VideoIdReqParams>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await bookmarkService.createBookmark({ accountId, videoId: req.params.videoId })
  return res.json({
    message: BOOKMARK_MESSAGES.CREATE_BOOKMARK_SUCCEED,
    data: result
  })
}

// Delete an bookmark video
export const deleteBookmarkController = async (req: Request<BookmarkIdReqParams>, res: Response) => {
  await bookmarkService.deleteBookmark(req.params.bookmarkId)
  return res.json({
    message: BOOKMARK_MESSAGES.DELETE_BOOKMARK_SUCCEED
  })
}

// Get bookmark videos
export const getBookmarkVideosController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const { videos, ...pagination } = await bookmarkService.getBookmarkVideos({ accountId, query: req.query })
  return res.json({
    message: BOOKMARK_MESSAGES.GET_BOOKMARK_VIDEOS_SUCCEED,
    data: {
      videos,
      pagination
    }
  })
}
