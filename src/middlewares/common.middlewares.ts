import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import pick from 'lodash/pick'

import { HttpStatusCode } from '~/constants/enum'
import { COMMON_MESSAGES } from '~/constants/messages'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'

type FilterKeys<T> = Array<keyof T>

// Lọc request body
export const filterReqBodyMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, _: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }

// Validate: Phân trang
export const paginationValidator = validate(
  checkSchema(
    {
      page: {
        optional: true,
        trim: true,
        custom: {
          options: async (value: string) => {
            const page = Number(value)
            if (!Number.isInteger(page) || page < 1) {
              throw new ErrorWithStatus({
                message: COMMON_MESSAGES.PAGE_MUST_BE_A_INTEGER_AND_POSITIVE,
                status: HttpStatusCode.BadRequest
              })
            }
            return true
          }
        }
      },
      limit: {
        optional: true,
        trim: true,
        custom: {
          options: async (value: string) => {
            const limit = Number(value)
            if (!Number.isInteger(limit) || limit < 0) {
              throw new ErrorWithStatus({
                message: COMMON_MESSAGES.LIMIT_MUST_BE_A_INTEGER_AND_POSITIVE,
                status: HttpStatusCode.BadRequest
              })
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
