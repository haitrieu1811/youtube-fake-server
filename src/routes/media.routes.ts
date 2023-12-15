import { Router } from 'express'

import { uploadImagesController } from '~/controllers/media.controllers'
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

export default mediaRouter
