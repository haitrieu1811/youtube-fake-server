import { Router } from 'express'

import {
  deleteReportsController,
  getReportsController,
  sendReportController,
  updateReportStatusController
} from '~/controllers/report.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, adminRoleValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import {
  deleteReportsValidator,
  getReportsValidator,
  reportIdValidator,
  sendReportValidator,
  updateReportStatusValidator
} from '~/middlewares/report.middlewares'

const reportRouter = Router()

// Gửi báo cáo
reportRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  sendReportValidator,
  wrapRequestHandler(sendReportController)
)

// Cập nhật trạng thái báo cáo (admin)
reportRouter.patch(
  '/:reportId',
  accessTokenValidator,
  verifiedAccountValidator,
  adminRoleValidator,
  reportIdValidator,
  updateReportStatusValidator,
  wrapRequestHandler(updateReportStatusController)
)

// Xóa báo cáo (admin)
reportRouter.delete(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  adminRoleValidator,
  deleteReportsValidator,
  wrapRequestHandler(deleteReportsController)
)

// Lấy danh sách báo cáo (admin)
reportRouter.get(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  adminRoleValidator,
  getReportsValidator,
  wrapRequestHandler(getReportsController)
)

export default reportRouter
