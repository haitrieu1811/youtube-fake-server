import { Router } from 'express'

import {
  createWatchHistoryController,
  deleteAllWatchHistoriesController,
  deleteWatchHistoryController,
  getWatchHistoriesController
} from '~/controllers/watchHistory.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { paginationValidator } from '~/middlewares/common.middlewares'
import { videoIdValidator } from '~/middlewares/video.middlewares'
import { watchHistoryIdValidator } from '~/middlewares/watchHistory.middlewares'

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

// Xóa toàn bộ lịch sử xem
watchHistoryRouter.delete(
  '/all',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(deleteAllWatchHistoriesController)
)

// Xóa một lịch sử xem
watchHistoryRouter.delete(
  '/:watchHistoryId',
  accessTokenValidator,
  verifiedAccountValidator,
  watchHistoryIdValidator,
  wrapRequestHandler(deleteWatchHistoryController)
)

export default watchHistoryRouter
