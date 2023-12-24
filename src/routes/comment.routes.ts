import { Router } from 'express'

import {
  createCommentController,
  deleteCommentController,
  updateCommentController
} from '~/controllers/comment.controllers'
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

// Xóa bình luận
commentRouter.delete(
  '/:commentId',
  accessTokenValidator,
  commentIdValidator,
  wrapRequestHandler(deleteCommentController)
)

export default commentRouter
