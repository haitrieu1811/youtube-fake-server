import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'

import { HttpStatusCode } from '~/constants/enum'
import { SUBSCRIPTION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import { SubscribeReqParams } from '~/models/requests/Subscription.requests'
import databaseService from '~/services/database.services'

// Kiểm tra đã đăng ký trước đó chưa
export const subscribeValidator = async (req: Request<SubscribeReqParams>, res: Response, next: NextFunction) => {
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
