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
  trim: true,
  isLength: {
    options: {
      min: 6,
      max: 255
    },
    errorMessage: VIDEO_MESSAGES.CATEGORY_DESCRIPTION_LENGTH_IS_INVALID
  }
}

const titleSchema: ParamSchema = {
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

const categorySchema: ParamSchema = {
  trim: true,
  isMongoId: {
    errorMessage: VIDEO_MESSAGES.CATEGORY_IS_INVALID
  },
  custom: {
    options: async (value: string) => {
      const videoCategory = await databaseService.videoCategories.findOne({ _id: new ObjectId(value) })
      if (!videoCategory) {
        throw new ErrorWithStatus({
          message: VIDEO_MESSAGES.CATEGORY_NOT_FOUND,
          status: HttpStatusCode.NotFound
        })
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
  isIn: {
    options: [audiences],
    errorMessage: VIDEO_MESSAGES.AUDIENCE_IS_INVALID
  }
}

const thumbnailSchema: ParamSchema = {
  trim: true,
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
      title: titleSchema
    },
    ['body']
  )
)

// Cập nhật video
export const updateVideoValidator = validate(
  checkSchema(
    {
      thumbnail: {
        ...thumbnailSchema,
        optional: true
      },
      title: {
        ...titleSchema,
        notEmpty: undefined,
        optional: true
      },
      category: {
        ...categorySchema,
        optional: true
      },
      description: videoDescriptionSchema,
      audience: {
        ...videoAudienceSchema,
        optional: true
      }
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

// Xóa video (một hoặc nhiều)
export const deleteVideosValidator = validate(
  checkSchema(
    {
      videoIds: {
        custom: {
          options: (value: string[]) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.VIDEO_IDS_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!Array.isArray(value)) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.VIDEO_IDS_MUST_BE_AN_ARRAY,
                status: HttpStatusCode.BadRequest
              })
            }
            if (value.length === 0) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.VIDEO_IDS_HAVE_NOT_EMPTY,
                status: HttpStatusCode.BadRequest
              })
            }
            const isValid = value.every((item) => ObjectId.isValid(item))
            if (!isValid) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.VIDEO_IDS_IS_INVALID,
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

// Lấy danh sách video công khai
export const getPublicVideosValidator = validate(
  checkSchema(
    {
      category: {
        ...categorySchema,
        notEmpty: undefined,
        optional: true
      }
    },
    ['query']
  )
)

// Kiểm tra idName (nanoId)
export const idNameValidator = validate(
  checkSchema(
    {
      idName: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: VIDEO_MESSAGES.ID_NAME_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            const video = await databaseService.videos.findOne({ idName: value })
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
