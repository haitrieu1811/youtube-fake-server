import { Router } from 'express'

import { createCommentController, updateCommentController } from '~/controllers/comment.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator } from '~/middlewares/account.middlewares'
import { commentIdValidator, createCommentValidator, updateCommentValidator } from '~/middlewares/comment.middlewares'

const commentRouter = Router()

// Thêm một bình luận
commentRouter.post('/', accessTokenValidator, createCommentValidator, wrapRequestHandler(createCommentController))

// Cập nhật bình luận
commentRouter.patch(
  '/:commentId',
  accessTokenValidator,
  commentIdValidator,
  updateCommentValidator,
  wrapRequestHandler(updateCommentController)
)

export default commentRouter
