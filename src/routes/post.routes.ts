import { Router } from 'express'

import {
  createPostController,
  deletePostsController,
  getMyPostsController,
  getPostByUsernameController,
  getPostDetailController,
  updatePostController
} from '~/controllers/post.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import {
  accessTokenValidator,
  isLoggedAccountValidator,
  usernameValidator,
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

// Create a new post
postRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  createPostValidator,
  wrapRequestHandler(createPostController)
)

// Update a post
postRouter.patch(
  '/:postId',
  accessTokenValidator,
  verifiedAccountValidator,
  postIdValidator,
  authorOfPostValidator,
  updatePostValidator,
  wrapRequestHandler(updatePostController)
)

// Delete post
postRouter.delete(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  deletePostsValidator,
  wrapRequestHandler(deletePostsController)
)

// Get posts by username
postRouter.get(
  '/username/:username',
  isLoggedAccountValidator(accessTokenValidator),
  isLoggedAccountValidator(verifiedAccountValidator),
  usernameValidator,
  paginationValidator,
  wrapRequestHandler(getPostByUsernameController)
)

// Get my posts
postRouter.get(
  '/my',
  accessTokenValidator,
  verifiedAccountValidator,
  paginationValidator,
  wrapRequestHandler(getMyPostsController)
)

// Get post detail
postRouter.get(
  '/:postId',
  isLoggedAccountValidator(accessTokenValidator),
  postIdValidator,
  wrapRequestHandler(getPostDetailController)
)

export default postRouter
