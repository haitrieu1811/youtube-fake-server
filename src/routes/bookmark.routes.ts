import { Router } from 'express'

import { createBookmarkController } from '~/controllers/bookmark.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { videoIdValidator } from '~/middlewares/video.middlewares'

const bookmarkRouter = Router()

// Tạo một bookmark video
bookmarkRouter.post(
  '/video/:videoId',
  accessTokenValidator,
  verifiedAccountValidator,
  videoIdValidator,
  wrapRequestHandler(createBookmarkController)
)

export default bookmarkRouter
