import { Router } from 'express'

import { createWatchHistoryController, getWatchHistoriesController } from '~/controllers/watchHistory.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator } from '~/middlewares/account.middlewares'
import { paginationValidator } from '~/middlewares/common.middlewares'
import { videoIdValidator } from '~/middlewares/video.middlewares'

const watchHistoryRouter = Router()

// Thêm một video vào lịch sử xem
watchHistoryRouter.post(
  '/video/:videoId',
  accessTokenValidator,
  videoIdValidator,
  wrapRequestHandler(createWatchHistoryController)
)

// Lấy lịch sử video đã xem
watchHistoryRouter.get('/', accessTokenValidator, paginationValidator, wrapRequestHandler(getWatchHistoriesController))

export default watchHistoryRouter
