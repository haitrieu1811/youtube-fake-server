import { Router } from 'express'

import {
  createReactionController,
  deleteReactionController,
  updateReactionController
} from '~/controllers/reaction.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import {
  createReactionValidator,
  reactionIdValidator,
  updateReactionValidator
} from '~/middlewares/reaction.middlewares'

const reactionRouter = Router()

// Thêm một reaction (video, post, comment)
reactionRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  createReactionValidator,
  wrapRequestHandler(createReactionController)
)

// Cập nhật một reaction (video, post, comment)
reactionRouter.patch(
  '/:reactionId',
  accessTokenValidator,
  verifiedAccountValidator,
  reactionIdValidator,
  updateReactionValidator,
  wrapRequestHandler(updateReactionController)
)

// Xóa một reaction
reactionRouter.delete(
  '/:reactionId',
  accessTokenValidator,
  verifiedAccountValidator,
  reactionIdValidator,
  wrapRequestHandler(deleteReactionController)
)

export default reactionRouter
