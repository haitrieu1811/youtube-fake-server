import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { HttpStatusCode } from '~/constants/enum'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import databaseService from '~/services/database.services'

// Bookmark id validator
export const bookmarkIdValidator = validate(
  checkSchema(
    {
      bookmarkId: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: BOOKMARK_MESSAGES.BOOKMARK_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: BOOKMARK_MESSAGES.BOOKMARK_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const bookmark = await databaseService.bookmarks.findOne({ _id: new ObjectId(value) })
            if (!bookmark) {
              throw new ErrorWithStatus({
                message: BOOKMARK_MESSAGES.BOOKMARK_NOT_FOUND,
                status: HttpStatusCode.NotFound
              })
            }
            const { accountId } = (req as Request).decodedAuthorization as TokenPayload
            if (bookmark.accountId.toString() !== accountId) {
              throw new ErrorWithStatus({
                message: BOOKMARK_MESSAGES.BOOKMARK_AUTHOR_IS_INVALID,
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
