import { Request, Response } from 'express'

import { SUBSCRIPTION_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import { SubscribeReqParams } from '~/models/requests/Subscription.requests'
import subscriptionService from '~/services/subscription.services'

// Đăng ký kênh
export const subscribeController = async (req: Request<SubscribeReqParams>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  await subscriptionService.subscribe({ fromAccountId: accountId, toAccountId: req.params.accountId })
  return res.json({
    message: SUBSCRIPTION_MESSAGES.SUBSCRIBE_SUCCEED
  })
}
