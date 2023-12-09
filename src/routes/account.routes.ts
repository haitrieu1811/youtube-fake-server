import { Router } from 'express'

import { loginController, logoutController, registerController } from '~/controllers/account.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { loginValidator, refreshTokenValidator, registerAccountValidator } from '~/middlewares/account.middlewares'

const accountRouter = Router()

// Đăng ký tài khoản
accountRouter.post('/register', registerAccountValidator, wrapRequestHandler(registerController))

// Đăng nhập
accountRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

// Đăng xuất
accountRouter.post('/logout', refreshTokenValidator, wrapRequestHandler(logoutController))

export default accountRouter
