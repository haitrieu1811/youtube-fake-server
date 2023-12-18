import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { HttpStatusCode, VideoAudience } from '~/constants/enum'
import { VIDEO_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/lib/utils'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import { VideoCategoryIdReqParams, VideoIdReqParams } from '~/models/requests/Video.requests'
import databaseService from '~/services/database.services'

const audiences = numberEnumToArray(VideoAudience)

const nameSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: VIDEO_MESSAGES.CATEGORY_NAME_IS_REQUIRED
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: VIDEO_MESSAGES.CATEGORY_NAME_LENGTH_IS_INVALID
  }
}

const descriptionSchema: ParamSchema = {
  optional: true,
  trim: true,
  isLength: {
    options: {
      min: 6,
      max: 255
    },
    errorMessage: VIDEO_MESSAGES.CATEGORY_DESCRIPTION_LENGTH_IS_INVALID
  }
}

const videoTitleSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: VIDEO_MESSAGES.TITLE_IS_REQUIRED
  },
  isLength: {
    options: {
      min: 6,
      max: 500
    },
    errorMessage: VIDEO_MESSAGES.TITLE_LENGTH_IS_INVALID
  }
}

const videoCategorySchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: VIDEO_MESSAGES.CATEGORY_IS_REQUIRED
  },
  isMongoId: {
    errorMessage: VIDEO_MESSAGES.CATEGORY_IS_INVALID
  },
  custom: {
    options: async (value: string) => {
      const videoCategory = await databaseService.videoCategories.findOne({ _id: new ObjectId(value) })
      if (!videoCategory) {
        throw new Error(VIDEO_MESSAGES.CATEGORY_NOT_FOUND)
      }
      return true
    }
  }
}

const videoDescriptionSchema: ParamSchema = {
  trim: true,
  optional: true
}

const videoAudienceSchema: ParamSchema = {
  optional: true,
  isIn: {
    options: [audiences],
    errorMessage: VIDEO_MESSAGES.AUDIENCE_IS_INVALID
  }
}

const videoThumbnailSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: VIDEO_MESSAGES.THUMBNAIL_IS_REQUIRED
  },
  isMongoId: {
    errorMessage: VIDEO_MESSAGES.THUMBNAIL_IS_INVALID
  }
}

// Tạo danh mục video
export const createVideoCategoryValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      description: descriptionSchema
    },
    ['body']
  )
)

// Kiểm tra video category id
export const videoCategoryIdValidator = validate(
  checkSchema(
    {
      videoCategoryId: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.VIDEO_CATEGORY_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.VIDEO_CATEGORY_ID_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const videoCategory = await databaseService.videoCategories.findOne({ _id: new ObjectId(value) })
            if (!videoCategory) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.VIDEO_CATEGORY_NOT_FOUND,
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

// Cập nhật danh mục video
export const updateVideoCategoryValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        notEmpty: undefined,
        optional: true
      },
      description: descriptionSchema
    },
    ['body']
  )
)

// Kiểm tra tác giả của danh mục video
export const authorOfVideoCategoryValidator = async (
  req: Request<VideoCategoryIdReqParams>,
  _: Response,
  next: NextFunction
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const videoCategory = await databaseService.videoCategories.findOne({
    _id: new ObjectId(req.params.videoCategoryId),
    accountId: new ObjectId(accountId)
  })
  if (!videoCategory) {
    next(
      new ErrorWithStatus({
        message: VIDEO_MESSAGES.VIDEO_CATEGORY_AUTHOR_IS_INVALID,
        status: HttpStatusCode.Forbidden
      })
    )
  }
  next()
}

// Tạo video
export const createVideoValidator = validate(
  checkSchema(
    {
      idName: {
        trim: true,
        custom: {
          options: (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.ID_NAME_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            return true
          }
        }
      },
      thumbnail: videoThumbnailSchema,
      title: videoTitleSchema,
      category: videoCategorySchema,
      description: videoDescriptionSchema,
      audience: videoAudienceSchema
    },
    ['body']
  )
)

// Cập nhật video
export const updateVideoValidator = validate(
  checkSchema(
    {
      thumbnail: {
        ...videoThumbnailSchema,
        notEmpty: undefined,
        optional: true
      },
      title: {
        ...videoTitleSchema,
        notEmpty: undefined,
        optional: true
      },
      category: {
        ...videoCategorySchema,
        notEmpty: undefined,
        optional: true
      },
      description: videoDescriptionSchema,
      audience: videoAudienceSchema
    },
    ['body']
  )
)

// Kiểm tra video id
export const videoIdValidator = validate(
  checkSchema(
    {
      videoId: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.VIDEO_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.VIDEO_ID_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const video = await databaseService.videos.findOne({ _id: new ObjectId(value) })
            if (!video) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.VIDEO_NOT_FOUND,
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

// Kiểm tra tác giả của video
export const authorOfVideoValidator = async (req: Request<VideoIdReqParams>, _: Response, next: NextFunction) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const video = await databaseService.videos.findOne({
    _id: new ObjectId(req.params.videoId),
    accountId: new ObjectId(accountId)
  })
  if (!video) {
    next(
      new ErrorWithStatus({
        message: VIDEO_MESSAGES.VIDEO_AUTHOR_IS_INVALID,
        status: HttpStatusCode.Forbidden
      })
    )
  }
  next()
}
