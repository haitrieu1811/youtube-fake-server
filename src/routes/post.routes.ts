import { Router } from 'express'

import { createPostController, updatePostController } from '~/controllers/post.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import {
  authorOfPostValidator,
  createPostValidator,
  postIdValidator,
  updatePostValidator
} from '~/middlewares/post.middlewares'

const postRouter = Router()

// Tạo bài viết
postRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  createPostValidator,
  wrapRequestHandler(createPostController)
)

// Cập nhật bài viết
postRouter.patch(
  '/:postId',
  accessTokenValidator,
  verifiedAccountValidator,
  postIdValidator,
  authorOfPostValidator,
  updatePostValidator,
  wrapRequestHandler(updatePostController)
)

export default postRouter
