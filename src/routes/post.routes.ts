import { Router } from 'express'

import {
  createPostController,
  deletePostsController,
  getPostsInProfilePageController,
  updatePostController
} from '~/controllers/post.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import {
  accessTokenValidator,
  accountIdValidator,
  isLoggedAccountValidator,
  verifiedAccountValidator
} from '~/middlewares/account.middlewares'
import { paginationValidator } from '~/middlewares/common.middlewares'
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

// Lấy danh sách bài viết ở trang cá nhân
postRouter.get(
  '/account/:accountId',
  isLoggedAccountValidator(accessTokenValidator),
  isLoggedAccountValidator(verifiedAccountValidator),
  accountIdValidator,
  paginationValidator,
  wrapRequestHandler(getPostsInProfilePageController)
)

export default postRouter
