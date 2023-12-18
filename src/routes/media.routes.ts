import { Router } from 'express'

import {
  getVideoStatusController,
  uploadImagesController,
  uploadVideoHLSController
} from '~/controllers/media.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'

const mediaRouter = Router()

// Upload hình ảnh
mediaRouter.post(
  '/upload-images',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(uploadImagesController)
)

// Upload video HLS
mediaRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedAccountValidator,
  wrapRequestHandler(uploadVideoHLSController)
)

// Get video status
mediaRouter.get('/video-status/:id', wrapRequestHandler(getVideoStatusController))

export default mediaRouter
