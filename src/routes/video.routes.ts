import { Router } from 'express'

import {
  createVideoCategoryController,
  createVideoController,
  deleteVideoCategoryController,
  deleteVideosController,
  updateVideoCategoryController,
  updateVideoController
} from '~/controllers/video.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, adminRoleValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares'
import {
  authorOfVideoCategoryValidator,
  authorOfVideoValidator,
  createVideoCategoryValidator,
  createVideoValidator,
  deleteVideosValidator,
  updateVideoCategoryValidator,
  updateVideoValidator,
  videoCategoryIdValidator,
  videoIdValidator
} from '~/middlewares/video.middlewares'
import { UpdateVideoCategoryReqBody, UpdateVideoReqBody } from '~/models/requests/Video.requests'

const videoRouter = Router()

// Tạo danh mục video
videoRouter.post(
  '/category',
  accessTokenValidator,
  verifiedAccountValidator,
  adminRoleValidator,
  createVideoCategoryValidator,
  wrapRequestHandler(createVideoCategoryController)
)

// Cập nhật danh mục video
videoRouter.patch(
  '/category/:videoCategoryId',
  accessTokenValidator,
  verifiedAccountValidator,
  adminRoleValidator,
  videoCategoryIdValidator,
  authorOfVideoCategoryValidator,
  updateVideoCategoryValidator,
  filterReqBodyMiddleware<UpdateVideoCategoryReqBody>(['name', 'description']),
  wrapRequestHandler(updateVideoCategoryController)
)

// Xóa danh mục video
videoRouter.delete(
  '/category/:videoCategoryId',
  accessTokenValidator,
  verifiedAccountValidator,
  adminRoleValidator,
  videoCategoryIdValidator,
  authorOfVideoCategoryValidator,
  wrapRequestHandler(deleteVideoCategoryController)
)

// Tạo video
videoRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  createVideoValidator,
  wrapRequestHandler(createVideoController)
)

// Cập nhật video
videoRouter.patch(
  '/:videoId',
  accessTokenValidator,
  verifiedAccountValidator,
  videoIdValidator,
  authorOfVideoValidator,
  updateVideoValidator,
  filterReqBodyMiddleware<UpdateVideoReqBody>(['title', 'description', 'thumbnail', 'category', 'audience']),
  wrapRequestHandler(updateVideoController)
)

// Xóa video
videoRouter.delete(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  deleteVideosValidator,
  wrapRequestHandler(deleteVideosController)
)

export default videoRouter
