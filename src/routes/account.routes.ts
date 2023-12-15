import { Router } from 'express'

import {
  adminUpdateAccountUserController,
  changePasswordController,
  deleteAccountsController,
  forgotPasswordController,
  getAllAccountsController,
  getMeController,
  getProfilePageController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyAccountController,
  resetPasswordController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/account.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import {
  accessTokenValidator,
  accountIdValidator,
  adminRoleValidator,
  adminUpdateAccountUserValidator,
  changePasswordValidator,
  deleteAccountsValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resendEmailVerifyAccountValidator,
  resetPasswordValidator,
  updateMeValidator,
  usernameValidator,
  verifiedAccountValidator,
  verifyEmailValidator
} from '~/middlewares/account.middlewares'
import { filterReqBodyMiddleware, paginationValidator } from '~/middlewares/common.middlewares'
import { AdminUpdateAccountUserReqBody, UpdateMeReqBody } from '~/models/requests/Account.requests'

const accountRouter = Router()

// Đăng ký tài khoản
accountRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

// Đăng nhập
accountRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

// Đăng xuất
accountRouter.post('/logout', refreshTokenValidator, wrapRequestHandler(logoutController))

// Refresh token
accountRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

// Xác thực tài khoản
accountRouter.post(
  '/verify-email',
  accessTokenValidator,
  verifyEmailValidator,
  wrapRequestHandler(verifyEmailController)
)

// Gửi lại email xác thực tài khoản
accountRouter.post(
  '/resend-email-verify-account',
  accessTokenValidator,
  resendEmailVerifyAccountValidator,
  wrapRequestHandler(resendEmailVerifyAccountController)
)

// Gửi yêu cầu quên mật khẩu
accountRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

// Xác thực forgot password token
accountRouter.post(
  '/reset-password/verify-token/:forgotPasswordToken',
  forgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordTokenController)
)

// Đặt lại mật khẩu
accountRouter.patch(
  '/reset-password',
  forgotPasswordTokenValidator,
  resetPasswordValidator,
  wrapRequestHandler(resetPasswordController)
)

// Thay đổi mật khẩu
accountRouter.patch(
  '/change-password',
  accessTokenValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

// Thông tin tài khoản đăng nhập
accountRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

// Cập nhật tài khoản đăng nhập
accountRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedAccountValidator,
  updateMeValidator,
  filterReqBodyMiddleware<UpdateMeReqBody>(['username', 'channelName', 'bio', 'avatar', 'bio']),
  wrapRequestHandler(updateMeController)
)

// Lấy thông tin trang cá nhân
accountRouter.get('/profile/:username', usernameValidator, wrapRequestHandler(getProfilePageController))

// Lấy danh sách toàn bộ account trên hệ thống (chỉ admin)
accountRouter.get(
  '/all',
  accessTokenValidator,
  verifiedAccountValidator,
  adminRoleValidator,
  paginationValidator,
  wrapRequestHandler(getAllAccountsController)
)

// Admin cập nhật account user (chỉ admin)
accountRouter.patch(
  '/:accountId',
  accessTokenValidator,
  verifiedAccountValidator,
  adminRoleValidator,
  accountIdValidator,
  adminUpdateAccountUserValidator,
  filterReqBodyMiddleware<AdminUpdateAccountUserReqBody>(['tick', 'role', 'status']),
  wrapRequestHandler(adminUpdateAccountUserController)
)

// Xóa vĩnh viễn tài khoản (chỉ admin)
accountRouter.delete(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  adminRoleValidator,
  deleteAccountsValidator,
  wrapRequestHandler(deleteAccountsController)
)

export default accountRouter
