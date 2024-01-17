import { Router } from 'express'

import {
  createVideoCategoryController,
  createVideoController,
  deleteThumbnailImageController,
  deleteVideoCategoryController,
  deleteVideosController,
  getLikedVideosController,
  getPublicVideosController,
  getVideoCategoriesController,
  getVideoDetailToUpdateController,
  getVideosByUsernameController,
  getVideosOfMeController,
  updateVideoCategoryController,
  updateVideoController,
  watchVideoController
} from '~/controllers/video.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import {
  accessTokenValidator,
  adminRoleValidator,
  isLoggedAccountValidator,
  usernameValidator,
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
  idNameValidator,
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

// Lấy danh sách danh mục video
videoRouter.get('/categories', paginationValidator, wrapRequestHandler(getVideoCategoriesController))

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
  filterReqBodyMiddleware<UpdateVideoReqBody>(['title', 'description', 'thumbnail', 'category', 'audience', 'isDraft']),
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

// Lấy danh sách video theo username
videoRouter.get(
  '/username/:username',
  usernameValidator,
  paginationValidator,
  wrapRequestHandler(getVideosByUsernameController)
)

// Xem video
videoRouter.get(
  '/watch/idName/:idName',
  isLoggedAccountValidator(accessTokenValidator),
  idNameValidator,
  wrapRequestHandler(watchVideoController)
)

// Xem thông tin chi tiết video
videoRouter.get(
  '/:videoId/to-update',
  accessTokenValidator,
  videoIdValidator,
  authorOfVideoValidator,
  wrapRequestHandler(getVideoDetailToUpdateController)
)

// Xóa hình thu nhỏ video
videoRouter.delete(
  '/:videoId/thumbnail',
  accessTokenValidator,
  videoIdValidator,
  authorOfVideoValidator,
  wrapRequestHandler(deleteThumbnailImageController)
)

// Lấy danh sách video đã thích
videoRouter.get(
  '/liked',
  accessTokenValidator,
  verifiedAccountValidator,
  paginationValidator,
  wrapRequestHandler(getLikedVideosController)
)

export default videoRouter
