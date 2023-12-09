import { Router } from 'express'

import { loginController, registerController } from '~/controllers/account.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { loginValidator, registerAccountValidator } from '~/middlewares/account.middlewares'

const accountRouter = Router()

// Đăng ký tài khoản
accountRouter.post('/register', registerAccountValidator, wrapRequestHandler(registerController))

// Đăng nhập
accountRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

export default accountRouter
