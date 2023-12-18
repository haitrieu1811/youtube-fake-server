import { Request, Response } from 'express'

import { MEDIA_MESSAGES } from '~/constants/messages'
import { sendFileFromS3 } from '~/lib/s3'
import { GetVideoStatusReqParams } from '~/models/requests/Video.requests'
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

// Serve image
export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params
  sendFileFromS3(res, `images/${name}`)
}

// Serve m3u8
export const serveM3u8Controller = (req: Request, res: Response) => {
  const { id } = req.params
  sendFileFromS3(res, `video-hls/${id}/master.m3u8`)
}

// Serve segment
export const serveSegmentHLSController = (req: Request, res: Response) => {
  const { id, v, segment } = req.params
  sendFileFromS3(res, `video-hls/${id}/${v}/${segment}`)
}

// Get video status
export const getVideoStatusController = async (req: Request<GetVideoStatusReqParams>, res: Response) => {
  const { id } = req.params
  const result = await mediaService.getVideoStatus(id)
  return res.json({
    message: MEDIA_MESSAGES.GET_VIDEO_STATUS_SUCCEED,
    data: result
  })
}
