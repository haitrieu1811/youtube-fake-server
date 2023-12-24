import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { CommentType, HttpStatusCode } from '~/constants/enum'
import { COMMENT_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/lib/utils'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'

const commentTypes = numberEnumToArray(CommentType)

export const createCommentValidator = validate(
  checkSchema(
    {
      content: {
        trim: true,
        notEmpty: {
          errorMessage: COMMENT_MESSAGES.COMMENT_CONTENT_IS_REQUIRED
        }
      },
      type: {
        custom: {
          options: (value: number) => {
            if (value === undefined) {
              throw new ErrorWithStatus({
                message: COMMENT_MESSAGES.COMMENT_TYPE_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!commentTypes.includes(value)) {
              throw new ErrorWithStatus({
                message: COMMENT_MESSAGES.COMMENT_TYPE_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            return true
          }
        }
      },
      contentId: {
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: COMMENT_MESSAGES.COMMENT_CONTENT_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: COMMENT_MESSAGES.COMMENT_CONTENT_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const video = await databaseService.videos.findOne({ _id: new ObjectId(value) })
            if (!video) {
              throw new ErrorWithStatus({
                message: COMMENT_MESSAGES.COMMENT_CONTENT_ID_NOT_FOUND,
                status: HttpStatusCode.NotFound
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
