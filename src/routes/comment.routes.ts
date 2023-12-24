import { Router } from 'express'

import {
  createCommentController,
  deleteCommentController,
  replyCommentController,
  updateCommentController
} from '~/controllers/comment.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator } from '~/middlewares/account.middlewares'
import {
  authorOfCommentValidator,
  commentIdValidator,
  createCommentValidator,
  replyCommentValidator,
  updateCommentValidator
} from '~/middlewares/comment.middlewares'

const commentRouter = Router()

// Thêm một bình luận
commentRouter.post('/', accessTokenValidator, createCommentValidator, wrapRequestHandler(createCommentController))

// Cập nhật bình luận
commentRouter.patch(
  '/:commentId',
  accessTokenValidator,
  commentIdValidator,
  authorOfCommentValidator,
  updateCommentValidator,
  wrapRequestHandler(updateCommentController)
)

// Xóa bình luận
commentRouter.delete(
  '/:commentId',
  accessTokenValidator,
  commentIdValidator,
  authorOfCommentValidator,
  wrapRequestHandler(deleteCommentController)
)

// Trả lời bình luận
commentRouter.post(
  '/:commentId/reply',
  accessTokenValidator,
  commentIdValidator,
  replyCommentValidator,
  wrapRequestHandler(replyCommentController)
)

export default commentRouter
