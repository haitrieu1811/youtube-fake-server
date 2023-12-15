import { Router } from 'express'

import { subscribeController } from '~/controllers/subscription.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, accountIdValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { subscribeValidator } from '~/middlewares/subscription.middlewares'

const subscriptionRouter = Router()

// Đăng ký kênh
subscriptionRouter.post(
  '/subscribe/account/:accountId',
  accessTokenValidator,
  accountIdValidator,
  verifiedAccountValidator,
  subscribeValidator,
  wrapRequestHandler(subscribeController)
)

export default subscriptionRouter
