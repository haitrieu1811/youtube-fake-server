import { Router } from 'express'

import { registerAccountController } from '~/controllers/account.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { registerAccountValidator } from '~/middlewares/account.middlewares'

const accountRouter = Router()

// Đăng ký tài khoản
accountRouter.post('/register', registerAccountValidator, wrapRequestHandler(registerAccountController))

export default accountRouter
