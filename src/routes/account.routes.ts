import { Router } from 'express'

import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  verifyEmailController
} from '~/controllers/account.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
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

// Verify email
accountRouter.post(
  '/verify-email',
  accessTokenValidator,
  verifyEmailValidator,
  wrapRequestHandler(verifyEmailController)
)

export default accountRouter
