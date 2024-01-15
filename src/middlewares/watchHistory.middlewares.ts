import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { HttpStatusCode } from '~/constants/enum'
import { WATCH_HISTORY_MESSAGES } from '~/constants/messages'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import databaseService from '~/services/database.services'

export const watchHistoryIdValidator = validate(
  checkSchema(
    {
      watchHistoryId: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: WATCH_HISTORY_MESSAGES.WATCH_HISTORY_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: WATCH_HISTORY_MESSAGES.WATCH_HISTORY_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const watchHistory = await databaseService.watchHistories.findOne({ _id: new ObjectId(value) })
            if (!watchHistory) {
              throw new ErrorWithStatus({
                message: WATCH_HISTORY_MESSAGES.WATCH_HISTORY_NOT_FOUND,
                status: HttpStatusCode.NotFound
              })
            }
            const { accountId } = (req as Request).decodedAuthorization as TokenPayload
            if (watchHistory.accountId.toString() !== accountId) {
              throw new ErrorWithStatus({
                message: WATCH_HISTORY_MESSAGES.WATCH_HISTORY_AUTHOR_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
