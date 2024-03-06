import { Router } from 'express'

import {
  createBookmarkController,
  deleteBookmarkController,
  getBookmarkVideosController
} from '~/controllers/bookmark.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { bookmarkIdValidator, isUnbookmarkValidator } from '~/middlewares/bookmark.middlewares'
import { paginationValidator } from '~/middlewares/common.middlewares'
import { videoIdValidator } from '~/middlewares/video.middlewares'

const bookmarkRouter = Router()

// Add a bookmark video
bookmarkRouter.post(
  '/video/:videoId',
  accessTokenValidator,
  verifiedAccountValidator,
  videoIdValidator,
  isUnbookmarkValidator,
  wrapRequestHandler(createBookmarkController)
)

// Delete an bookmark video
bookmarkRouter.delete(
  '/:bookmarkId',
  accessTokenValidator,
  verifiedAccountValidator,
  bookmarkIdValidator,
  wrapRequestHandler(deleteBookmarkController)
)

// Get bookmark videos
bookmarkRouter.get(
  '/videos',
  accessTokenValidator,
  verifiedAccountValidator,
  paginationValidator,
  wrapRequestHandler(getBookmarkVideosController)
)

export default bookmarkRouter
