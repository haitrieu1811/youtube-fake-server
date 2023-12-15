import { Router } from 'express'

import { subscribeController, unsubscribeController } from '~/controllers/subscription.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, accountIdValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
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

export default subscriptionRouter
