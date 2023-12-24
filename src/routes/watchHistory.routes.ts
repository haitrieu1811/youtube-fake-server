import { Router } from 'express'

import { createWatchHistoryController } from '~/controllers/watchHistory.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator } from '~/middlewares/account.middlewares'
import { videoIdValidator } from '~/middlewares/video.middlewares'

const watchHistoryRouter = Router()

// Thêm một video vào lịch sử xem
watchHistoryRouter.post(
  '/video/:videoId',
  accessTokenValidator,
  videoIdValidator,
  wrapRequestHandler(createWatchHistoryController)
)

export default watchHistoryRouter
