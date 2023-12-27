import { Router } from 'express'

import { createPostController, deletePostsController, updatePostController } from '~/controllers/post.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import {
  authorOfPostValidator,
  createPostValidator,
  deletePostsValidator,
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

// Xóa bài viết
postRouter.delete(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  deletePostsValidator,
  wrapRequestHandler(deletePostsController)
)

export default postRouter
