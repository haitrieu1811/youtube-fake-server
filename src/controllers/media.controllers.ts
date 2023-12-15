import { Request, Response } from 'express'

import { MEDIA_MESSAGES } from '~/constants/messages'
import mediaService from '~/services/media.services'

// Upload hình ảnh
export const uploadImagesController = async (req: Request, res: Response) => {
  const result = await mediaService.handleUploadImages(req)
  return res.json({
    message: MEDIA_MESSAGES.UPLOAD_IMAGE_SUCCEED,
    data: result
  })
}

// Upload video HLS
export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const result = await mediaService.handleUploadVideoHLS(req)
  return res.json({
    message: MEDIA_MESSAGES.UPLOAD_VIDEO_HLS_SUCCEED,
    data: result
  })
}
