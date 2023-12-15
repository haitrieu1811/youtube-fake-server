import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'

import { HttpStatusCode } from '~/constants/enum'
import { SUBSCRIPTION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { AccountIdReqParams, TokenPayload } from '~/models/requests/Account.requests'
import databaseService from '~/services/database.services'

// Đăng ký kênh
export const subscribeValidator = async (req: Request<AccountIdReqParams>, res: Response, next: NextFunction) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const subscribe = await databaseService.subscriptions.findOne({
    fromAccountId: new ObjectId(accountId),
    toAccountId: new ObjectId(req.params.accountId)
  })
  if (subscribe) {
    next(
      new ErrorWithStatus({
        message: SUBSCRIPTION_MESSAGES.ALREADY_SUBSCRIBE,
        status: HttpStatusCode.BadRequest
      })
    )
  }
  next()
}

// Hủy đăng ký kênh
export const unsubscribeValidator = async (req: Request<AccountIdReqParams>, res: Response, next: NextFunction) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const subscribe = await databaseService.subscriptions.findOne({
    fromAccountId: new ObjectId(accountId),
    toAccountId: new ObjectId(req.params.accountId)
  })
  if (!subscribe) {
    next(
      new ErrorWithStatus({
        message: SUBSCRIPTION_MESSAGES.NOT_SUBSCRIBED,
        status: HttpStatusCode.BadRequest
      })
    )
  }
  next()
}
