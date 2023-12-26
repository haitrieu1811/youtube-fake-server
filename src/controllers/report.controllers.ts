import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { REPORT_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import {
  DeleteReportsReqBody,
  GetReportsReqQuery,
  ReportIdReqParams,
  SendReportReqBody,
  UpdateReportStatusReqBody
} from '~/models/requests/Report.requests'
import reportService from '~/services/report.services'

// Gửi báo cáo
export const sendReportController = async (req: Request<ParamsDictionary, any, SendReportReqBody>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await reportService.sendReport({ body: req.body, accountId })
  return res.json({
    message: REPORT_MESSAGES.SEND_REPORT_SUCCEED,
    data: result
  })
}

// Cập nhật trạng thái báo cáo (admin)
export const updateReportStatusController = async (
  req: Request<ReportIdReqParams, any, UpdateReportStatusReqBody>,
  res: Response
) => {
  const result = await reportService.updateReportStatus({ reportId: req.params.reportId, status: req.body.status })
  return res.json({
    message: REPORT_MESSAGES.UPDATE_REPORT_SUCCEED,
    data: result
  })
}

// Xóa báo cáo (admin)
export const deleteReportsController = async (
  req: Request<ParamsDictionary, any, DeleteReportsReqBody>,
  res: Response
) => {
  const { deletedCount } = await reportService.deleteReports(req.body.reportIds)
  return res.json({
    message: `Xóa ${deletedCount} báo cáo thành công`
  })
}

// Lấy danh sách báo cáo (admin)
export const getReportsController = async (
  req: Request<ParamsDictionary, any, any, GetReportsReqQuery>,
  res: Response
) => {
  const { reports, ...pagination } = await reportService.getReports(req.query)
  return res.json({
    message: REPORT_MESSAGES.GET_REPORTS_SUCCEED,
    data: {
      reports,
      pagination
    }
  })
}
