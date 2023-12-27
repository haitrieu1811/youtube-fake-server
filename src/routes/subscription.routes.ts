import { Router } from 'express'

import {
  getChannelsSubscribedOfMeController,
  subscribeController,
  unsubscribeController
} from '~/controllers/subscription.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, accountIdValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { paginationValidator } from '~/middlewares/common.middlewares'
import { subscribeValidator, unsubscribeValidator } from '~/middlewares/subscription.middlewares'

const subscriptionRouter = Router()

// Đăng ký kênh
subscriptionRouter.post(
  '/subscribe/account/:accountId',
  accessTokenValidator,
  verifiedAccountValidator,
  accountIdValidator,
  subscribeValidator,
  wrapRequestHandler(subscribeController)
)

// Hủy đăng ký kênh
subscriptionRouter.delete(
  '/unsubscribe/account/:accountId',
  accessTokenValidator,
  verifiedAccountValidator,
  accountIdValidator,
  unsubscribeValidator,
  wrapRequestHandler(unsubscribeController)
)

// Lấy danh sách kênh đã đăng ký của tôi
subscriptionRouter.get(
  '/me',
  accessTokenValidator,
  verifiedAccountValidator,
  paginationValidator,
  wrapRequestHandler(getChannelsSubscribedOfMeController)
)

export default subscriptionRouter
