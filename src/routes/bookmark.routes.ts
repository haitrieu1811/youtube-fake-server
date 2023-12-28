import { Router } from 'express'

import { createBookmarkController, deleteBookmarkController } from '~/controllers/bookmark.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { bookmarkIdValidator, isUnbookmarkValidator } from '~/middlewares/bookmark.middlewares'
import { videoIdValidator } from '~/middlewares/video.middlewares'

const bookmarkRouter = Router()

// Tạo một bookmark video
bookmarkRouter.post(
  '/video/:videoId',
  accessTokenValidator,
  verifiedAccountValidator,
  videoIdValidator,
  isUnbookmarkValidator,
  wrapRequestHandler(createBookmarkController)
)

// Xóa một bookmark video
bookmarkRouter.delete(
  '/:bookmarkId',
  accessTokenValidator,
  verifiedAccountValidator,
  bookmarkIdValidator,
  wrapRequestHandler(deleteBookmarkController)
)

export default bookmarkRouter
