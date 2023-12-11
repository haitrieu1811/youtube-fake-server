import { Router } from 'express'

import {
  changePasswordController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyAccountController,
  resetPasswordController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/account.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import {
  accessTokenValidator,
  changePasswordValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resendEmailVerifyAccountValidator,
  resetPasswordValidator,
  verifyEmailValidator
} from '~/middlewares/account.middlewares'

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

export default accountRouter
