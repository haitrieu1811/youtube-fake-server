import { Router } from 'express'

import { createPostController } from '~/controllers/post.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { createPostValidator } from '~/middlewares/post.middlewares'

const postRouter = Router()

// Tạo bài viết
postRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  createPostValidator,
  wrapRequestHandler(createPostController)
)

export default postRouter
