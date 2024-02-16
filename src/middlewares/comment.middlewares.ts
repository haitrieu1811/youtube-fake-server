import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { CommentType, HttpStatusCode } from '~/constants/enum'
import { ACCOUNT_MESSAGES, COMMENT_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/lib/utils'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import { CommentIdReqParams } from '~/models/requests/Comment.requests'
import databaseService from '~/services/database.services'

const commentTypes = numberEnumToArray(CommentType)

const contentSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: COMMENT_MESSAGES.COMMENT_CONTENT_IS_REQUIRED
  }
}

// Add a comment
export const createCommentValidator = validate(
  checkSchema(
    {
      content: contentSchema,
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
            const [video, post] = await Promise.all([
              databaseService.videos.findOne({ _id: new ObjectId(value) }),
              databaseService.posts.findOne({ _id: new ObjectId(value) })
            ])
            if (!video && !post) {
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

// Comment id
export const commentIdValidator = validate(
  checkSchema(
    {
      commentId: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: COMMENT_MESSAGES.COMMENT_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: COMMENT_MESSAGES.COMMENT_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const comment = await databaseService.comments.findOne({ _id: new ObjectId(value) })
            if (!comment) {
              throw new ErrorWithStatus({
                message: COMMENT_MESSAGES.COMMENT_NOT_FOUND,
                status: HttpStatusCode.NotFound
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

// Check author of a post
export const authorOfCommentValidator = async (req: Request<CommentIdReqParams>, res: Response, next: NextFunction) => {
  const { commentId } = req.params
  const comment = await databaseService.comments.findOne({ _id: new ObjectId(commentId) })
  const { accountId } = req.decodedAuthorization as TokenPayload
  if (comment && comment.accountId.toString() !== accountId) {
    return next(
      new ErrorWithStatus({
        message: COMMENT_MESSAGES.COMMENT_AUTHOR_IS_INVALID,
        status: HttpStatusCode.Forbidden
      })
    )
  }
  return next()
}

// Update a post
export const updateCommentValidator = validate(
  checkSchema(
    {
      content: contentSchema
    },
    ['body']
  )
)

// Reply a comment
export const replyCommentValidator = validate(
  checkSchema(
    {
      content: contentSchema,
      replyAccountId: {
        optional: true,
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ACCOUNT_MESSAGES.ACCOUNT_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: ACCOUNT_MESSAGES.ACCOUNT_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const account = await databaseService.accounts.findOne({ _id: new ObjectId(value) })
            if (!account) {
              throw new ErrorWithStatus({
                message: ACCOUNT_MESSAGES.ACCOUNT_NOT_FOUND,
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
