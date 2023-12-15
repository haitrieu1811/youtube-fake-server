import { Router } from 'express'

import {
  createVideoCategoryController,
  deleteVideoCategoryController,
  updateVideoCategoryController
} from '~/controllers/video.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, adminRoleValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares'
import {
  authorOfVideoCategoryValidator,
  createVideoCategoryValidator,
  updateVideoCategoryValidator,
  videoCategoryIdValidator
} from '~/middlewares/video.middlewares'
import { UpdateVideoCategoryReqBody } from '~/models/requests/Video.requests'

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

export default videoRouter
