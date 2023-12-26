import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { HttpStatusCode, PostAudience } from '~/constants/enum'
import { POST_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/lib/utils'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'

const postAudiences = numberEnumToArray(PostAudience)

// Tạo bài viết
export const createPostValidator = validate(
  checkSchema(
    {
      content: {
        trim: true,
        notEmpty: {
          errorMessage: POST_MESSAGES.CONTENT_IS_REQUIRED
        }
      },
      images: {
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
      },
      audience: {
        optional: true,
        isIn: {
          options: [postAudiences],
          errorMessage: POST_MESSAGES.AUDIENCE_IS_INVALID
        }
      }
    },
    ['body']
  )
)
