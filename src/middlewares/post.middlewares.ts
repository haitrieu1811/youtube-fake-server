import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId, WithId } from 'mongodb'

import { HttpStatusCode, PostAudience } from '~/constants/enum'
import { POST_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/lib/utils'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import { PostIdReqParams } from '~/models/requests/Post.requests'
import Post from '~/models/schemas/Post.schema'
import databaseService from '~/services/database.services'

const postAudiences = numberEnumToArray(PostAudience)

const contentSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: POST_MESSAGES.CONTENT_IS_REQUIRED
  }
}

const imagesSchema: ParamSchema = {
  optional: true,
  custom: {
    options: (value) => {
      if (!Array.isArray(value)) {
        throw new ErrorWithStatus({
          message: POST_MESSAGES.IMAGES_MUST_BE_AN_ARRAY,
          status: HttpStatusCode.BadRequest
        })
      }
      if (value.length === 0) {
        throw new ErrorWithStatus({
          message: POST_MESSAGES.IMAGES_CANNOT_BE_EMPTY,
          status: HttpStatusCode.BadRequest
        })
      }
      const isValid = value.every((item) => ObjectId.isValid(item))
      if (!isValid) {
        throw new ErrorWithStatus({
          message: POST_MESSAGES.IMAGES_IS_INVALID,
          status: HttpStatusCode.BadRequest
        })
      }
      return true
    }
  }
}

const audienceSchema: ParamSchema = {
  optional: true,
  isIn: {
    options: [postAudiences],
    errorMessage: POST_MESSAGES.AUDIENCE_IS_INVALID
  }
}

// Create a new post
export const createPostValidator = validate(
  checkSchema(
    {
      content: contentSchema,
      images: imagesSchema,
      audience: audienceSchema
    },
    ['body']
  )
)

// Post id validator
export const postIdValidator = validate(
  checkSchema(
    {
      postId: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: POST_MESSAGES.POST_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: POST_MESSAGES.POST_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const post = await databaseService.posts.findOne({ _id: new ObjectId(value) })
            if (!post) {
              throw new ErrorWithStatus({
                message: POST_MESSAGES.POST_NOT_FOUND,
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

// Check author of post
export const authorOfPostValidator = async (req: Request<PostIdReqParams>, res: Response, next: NextFunction) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const post = (await databaseService.posts.findOne({ _id: new ObjectId(req.params.postId) })) as WithId<Post>
  if (post.accountId.toString() !== accountId) {
    return next(
      new ErrorWithStatus({
        message: POST_MESSAGES.AUTHOR_IS_INVALID,
        status: HttpStatusCode.Forbidden
      })
    )
  }
  return next()
}

// Update a post
export const updatePostValidator = validate(
  checkSchema(
    {
      content: {
        ...contentSchema,
        notEmpty: undefined,
        optional: true
      },
      images: imagesSchema,
      audience: audienceSchema
    },
    ['body']
  )
)

// Delete posts
export const deletePostsValidator = validate(
  checkSchema(
    {
      postIds: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: POST_MESSAGES.POST_IDS_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!Array.isArray(value)) {
              throw new ErrorWithStatus({
                message: POST_MESSAGES.POST_IDS_MUST_BE_AN_ARRAY,
                status: HttpStatusCode.BadRequest
              })
            }
            if (value.length === 0) {
              throw new ErrorWithStatus({
                message: POST_MESSAGES.POST_IDS_CANNOT_BE_EMPTY,
                status: HttpStatusCode.BadRequest
              })
            }
            const isValid = value.every((item) => ObjectId.isValid(item))
            if (!isValid) {
              throw new ErrorWithStatus({
                message: POST_MESSAGES.POST_IDS_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const foundPosts = await Promise.all(
              value.map(async (postId) => {
                const post = await databaseService.posts.findOne({ _id: new ObjectId(postId) })
                return post
              })
            )
            const foundPostsConfig = foundPosts.filter((post) => post !== null)
            const { accountId } = (req as Request).decodedAuthorization as TokenPayload
            const _isValid = foundPostsConfig.every((post) => post?.accountId.toString() === accountId)
            if (!_isValid) {
              throw new ErrorWithStatus({
                message: POST_MESSAGES.POST_IDS_AUTHOR_IS_INVALID,
                status: HttpStatusCode.Forbidden
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
