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

// Lấy danh sách kênh tôi đã đăng ký
subscriptionRouter.get(
  '/of-me',
  accessTokenValidator,
  verifiedAccountValidator,
  paginationValidator,
  wrapRequestHandler(getChannelsSubscribedOfMeController)
)

// Lấy danh sách kênh đã đăng ký kênh của tôi
subscriptionRouter.get(
  '/for-me',
  accessTokenValidator,
  verifiedAccountValidator,
  paginationValidator,
  wrapRequestHandler(getChannelsSubscribedOfMeController)
)

export default subscriptionRouter
