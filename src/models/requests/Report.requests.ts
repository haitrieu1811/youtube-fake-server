import { ParamsDictionary, Query } from 'express-serve-static-core'

import { ReportContentType, ReportStatus } from '~/constants/enum'
import { PaginationReqQuery } from './Common.requests'

// Body: Gửi báo cáo
export type SendReportReqBody = {
  content: string
  contentId: string
  contentType: ReportContentType
}

// Params: Report id
export type ReportIdReqParams = ParamsDictionary & {
  reportId: string
}

// Body: Cập nhật trạng thái báo cáo
export type UpdateReportStatusReqBody = {
  status: ReportStatus
}

// Body: Xóa báo cáo
export type DeleteReportsReqBody = {
  reportIds: string[]
}

// Query: Lấy danh sách báo cáo
export type GetReportsReqQuery = Query &
  PaginationReqQuery & {
    status?: ReportStatus
  }
