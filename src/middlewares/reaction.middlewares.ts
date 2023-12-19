import { Request } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { HttpStatusCode, ReactionContentType, ReactionType } from '~/constants/enum'
import { REACTION_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/lib/utils'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import databaseService from '~/services/database.services'

const reactionTypes = numberEnumToArray(ReactionType)
const contentTypes = numberEnumToArray(ReactionContentType)

const typeSchema: ParamSchema = {
  custom: {
    options: (value: number) => {
      if (value === undefined) {
        throw new ErrorWithStatus({
          message: REACTION_MESSAGES.REACTION_TYPE_IS_REQUIRED,
          status: HttpStatusCode.BadRequest
        })
      }
      if (!reactionTypes.includes(value)) {
        throw new ErrorWithStatus({
          message: REACTION_MESSAGES.REACTION_TYPE_IS_INVALID,
          status: HttpStatusCode.BadRequest
        })
      }
      return true
    }
  }
}

// Thêm một reaction (video, post, comment)
export const createReactionValidator = validate(
  checkSchema(
    {
      type: typeSchema,
      contentType: {
        custom: {
          options: (value: number) => {
            if (value === undefined) {
              throw new ErrorWithStatus({
                message: REACTION_MESSAGES.CONTENT_TYPE_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!contentTypes.includes(value)) {
              throw new ErrorWithStatus({
                message: REACTION_MESSAGES.CONTENT_TYPE_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            return true
          }
        }
      },
      contentId: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: REACTION_MESSAGES.CONTENT_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: REACTION_MESSAGES.CONTENT_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const video = await databaseService.videos.findOne({ _id: new ObjectId(value) })
            if (!video) {
              throw new ErrorWithStatus({
                message: REACTION_MESSAGES.CONTENT_ID_NOT_FOUND,
                status: HttpStatusCode.NotFound
              })
            }
            const { accountId } = (req as Request).decodedAuthorization as TokenPayload
            const reaction = await databaseService.reactions.findOne({
              accountId: new ObjectId(accountId),
              contentId: new ObjectId(value)
            })
            if (reaction) {
              throw new ErrorWithStatus({
                message: REACTION_MESSAGES.HAVE_REACTION_BEFORE,
                status: HttpStatusCode.BadRequest
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

// Cập nhật một reaction (video, post, comment)
export const updateReactionValidator = validate(
  checkSchema(
    {
      type: typeSchema
    },
    ['body']
  )
)

// Kiểm tra reaction id
export const reactionIdValidator = validate(
  checkSchema(
    {
      reactionId: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: REACTION_MESSAGES.REACTION_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: REACTION_MESSAGES.REACTION_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const reaction = await databaseService.reactions.findOne({ _id: new ObjectId(value) })
            if (!reaction) {
              throw new ErrorWithStatus({
                message: REACTION_MESSAGES.REACTION_NOT_FOUND,
                status: HttpStatusCode.NotFound
              })
            }
            const { accountId } = (req as Request).decodedAuthorization as TokenPayload
            if (reaction.accountId.toString() !== accountId) {
              throw new ErrorWithStatus({
                message: REACTION_MESSAGES.REACTION_AUTHOR_IS_INVALID,
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
