import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { HttpStatusCode, ReportContentType, ReportStatus } from '~/constants/enum'
import { REPORT_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/lib/utils'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'

const contentTypes = numberEnumToArray(ReportContentType)
const reportStatuses = numberEnumToArray(ReportStatus)

const statusSchema: ParamSchema = {
  custom: {
    options: (value: number) => {
      if (value === undefined) {
        throw new ErrorWithStatus({
          message: REPORT_MESSAGES.STATUS_IS_REQUIRED,
          status: HttpStatusCode.BadRequest
        })
      }
      if (!reportStatuses.includes(value)) {
        throw new ErrorWithStatus({
          message: REPORT_MESSAGES.STATUS_IS_INVALID,
          status: HttpStatusCode.BadRequest
        })
      }
      return true
    }
  }
}

// Gửi báo cáo
export const sendReportValidator = validate(
  checkSchema(
    {
      content: {
        trim: true,
        notEmpty: {
          errorMessage: REPORT_MESSAGES.CONTENT_IS_REQUIRED
        }
      },
      contentId: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.CONTENT_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.CONTENT_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const [video, comment] = await Promise.all([
              databaseService.videos.findOne({ _id: new ObjectId(value) }),
              databaseService.comments.findOne({ _id: new ObjectId(value) })
            ])
            if (!video && !comment) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.CONTENT_ID_IS_NOT_FOUND,
                status: HttpStatusCode.NotFound
              })
            }
            return true
          }
        }
      },
      contentType: {
        custom: {
          options: (value: number) => {
            if (value === undefined) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.CONTENT_TYPE_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!contentTypes.includes(value)) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.CONTENT_TYPE_IS_INVALID,
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

// Kiểm tra report Id
export const reportIdValidator = validate(
  checkSchema(
    {
      reportId: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.REPORT_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.REPORT_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const report = await databaseService.reports.findOne({ _id: new ObjectId(value) })
            if (!report) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.REPORT_NOT_FOUND,
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

// Cập nhật trạng thái báo cáo (admin)
export const updateReportStatusValidator = validate(
  checkSchema(
    {
      status: statusSchema
    },
    ['body']
  )
)

// Xóa báo cáo (admin)
export const deleteReportsValidator = validate(
  checkSchema(
    {
      reportIds: {
        custom: {
          options: (value: string[]) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.REPORT_IDS_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!Array.isArray(value)) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.REPORT_IDS_MUST_BE_AN_ARRAY,
                status: HttpStatusCode.BadRequest
              })
            }
            if (value.length === 0) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.REPORT_IDS_CANNOT_BE_EMPTY,
                status: HttpStatusCode.BadRequest
              })
            }
            const isValid = value.every((item) => ObjectId.isValid(item))
            if (!isValid) {
              throw new ErrorWithStatus({
                message: REPORT_MESSAGES.REPORT_IDS_IS_INVALID,
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

// Lấy danh sách báo cáo (admin)
export const getReportsValidator = validate(
  checkSchema(
    {
      status: {
        ...statusSchema,
        optional: true
      }
    },
    ['query']
  )
)
