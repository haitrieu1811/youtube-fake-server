import { Request, Response } from 'express'

import { SUBSCRIPTION_MESSAGES } from '~/constants/messages'
import { AccountIdReqParams, TokenPayload } from '~/models/requests/Account.requests'
import subscriptionService from '~/services/subscription.services'

// Đăng ký kênh
export const subscribeController = async (req: Request<AccountIdReqParams>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  await subscriptionService.subscribe({ fromAccountId: accountId, toAccountId: req.params.accountId })
  return res.json({
    message: SUBSCRIPTION_MESSAGES.SUBSCRIBE_SUCCEED
  })
}

// Hủy đăng ký kênh
export const unsubscribeController = async (req: Request<AccountIdReqParams>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  await subscriptionService.unsubscribe({ fromAccountId: accountId, toAccountId: req.params.accountId })
  return res.json({
    message: SUBSCRIPTION_MESSAGES.UNSUBSCRIBE_SUCCEED
  })
}
