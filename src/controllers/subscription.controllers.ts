import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { SUBSCRIPTION_MESSAGES } from '~/constants/messages'
import { AccountIdReqParams, TokenPayload } from '~/models/requests/Account.requests'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
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

// Lấy danh sách kênh đã đăng ký của tôi
export const getChannelsSubscribedOfMeController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const { channels, ...pagination } = await subscriptionService.getChannelsSubscribedOfMe({
    accountId,
    query: req.query
  })
  return res.json({
    message: SUBSCRIPTION_MESSAGES.GET_CHANNELS_SUBSCRIBED_OF_ME_SUCCEED,
    data: {
      channels,
      pagination
    }
  })
}
