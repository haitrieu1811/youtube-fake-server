import { Router } from 'express'

import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyAccountController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/account.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resendEmailVerifyAccountValidator,
  verifyEmailValidator,
  verifyForgotPasswordTokenValidator
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
  '/verify-forgot-password-token',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordTokenController)
)

export default accountRouter
