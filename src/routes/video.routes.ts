import { Router } from 'express'

import {
  createVideoCategoryController,
  createVideoController,
  deleteVideoCategoryController,
  deleteVideosController,
  getPublicVideosController,
  getVideoDetailWhenLoggedController,
  getVideosOfMeController,
  updateVideoCategoryController,
  updateVideoController
} from '~/controllers/video.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import {
  accessTokenValidator,
  adminRoleValidator,
  isLoggedAccountValidator,
  verifiedAccountValidator
} from '~/middlewares/account.middlewares'
import { filterReqBodyMiddleware, paginationValidator } from '~/middlewares/common.middlewares'
import {
  authorOfVideoCategoryValidator,
  authorOfVideoValidator,
  createVideoCategoryValidator,
  createVideoValidator,
  deleteVideosValidator,
  getPublicVideosValidator,
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

// Lấy danh sách video công khai
videoRouter.get('/public', paginationValidator, getPublicVideosValidator, wrapRequestHandler(getPublicVideosController))

// Lấy danh sách video tài khoản đăng nhập
videoRouter.get(
  '/me',
  accessTokenValidator,
  verifiedAccountValidator,
  paginationValidator,
  wrapRequestHandler(getVideosOfMeController)
)

// Xem thông tin chi tiết video
videoRouter.get(
  '/:videoId',
  isLoggedAccountValidator(accessTokenValidator),
  isLoggedAccountValidator(videoIdValidator),
  wrapRequestHandler(getVideoDetailWhenLoggedController)
)

export default videoRouter
