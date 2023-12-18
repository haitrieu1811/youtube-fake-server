import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { HttpStatusCode } from '~/constants/enum'
import { VIDEO_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import {
  CreateVideoCategoryReqBody,
  CreateVideoReqBody,
  UpdateVideoCategoryReqBody,
  VideoCategoryIdReqParams
} from '~/models/requests/Video.requests'
import videoService from '~/services/video.services'

// Tạo danh mục video
export const createVideoCategoryController = async (
  req: Request<ParamsDictionary, any, CreateVideoCategoryReqBody>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await videoService.createVideoCategory({ accountId, body: req.body })
  return res.json({
    message: VIDEO_MESSAGES.CREATE_VIDEO_CATEGORY_SUCCEED,
    data: result
  })
}

// Cập nhật danh mục video
export const updateVideoCategoryController = async (
  req: Request<VideoCategoryIdReqParams, any, UpdateVideoCategoryReqBody>,
  res: Response
) => {
  const result = await videoService.updateVideoCategory({ videoCategoryId: req.params.videoCategoryId, body: req.body })
  return res.json({
    message: VIDEO_MESSAGES.UPDATE_VIDEO_CATEGORY_SUCCEED,
    data: result
  })
}

// Xóa danh mục video
export const deleteVideoCategoryController = async (req: Request<VideoCategoryIdReqParams>, res: Response) => {
  const result = await videoService.deleteVideoCategory(req.params.videoCategoryId)
  return res.json({
    message: VIDEO_MESSAGES.DELETE_VIDEO_CATEGORY_SUCCEED
  })
}

// Tạo video
export const createVideoController = async (req: Request<ParamsDictionary, any, CreateVideoReqBody>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await videoService.createVideo({ body: req.body, accountId })
  return res.status(HttpStatusCode.Created).json({
    message: VIDEO_MESSAGES.CREATE_VIDEO_SUCCEED,
    data: result
  })
}
