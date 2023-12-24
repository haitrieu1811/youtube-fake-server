import { Router } from 'express'

import { createCommentController } from '~/controllers/comment.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator } from '~/middlewares/account.middlewares'
import { createCommentValidator } from '~/middlewares/comment.middlewares'

const commentRouter = Router()

// Thêm một bình luận
commentRouter.post('/', accessTokenValidator, createCommentValidator, wrapRequestHandler(createCommentController))

export default commentRouter
