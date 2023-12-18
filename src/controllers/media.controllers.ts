import { Request, Response } from 'express'
import path from 'path'

import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MEDIA_MESSAGES } from '~/constants/messages'
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

// Serve m3u8
export const serveM3u8Controller = (req: Request, res: Response) => {
  const { id } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found')
    }
  })
}

// Serve segment
export const serveSegmentHLSController = (req: Request, res: Response) => {
  const { id, v, segment } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found')
    }
  })
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
