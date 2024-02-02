import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { HttpStatusCode } from '~/constants/enum'
import { VIDEO_MESSAGES } from '~/constants/messages'
import { TokenPayload, UsernameReqParams } from '~/models/requests/Account.requests'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import {
  CreateVideoCategoryReqBody,
  CreateVideoReqBody,
  DeleteVideosReqBody,
  GetSuggestedVideosReqQuery,
  GetVideosOfMeReqQuery,
  IdNameReqParams,
  UpdateVideoCategoryReqBody,
  UpdateVideoReqBody,
  VideoCategoryIdReqParams,
  VideoIdReqParams
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

// Lấy danh sách danh mục video
export const getVideoCategoriesController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { categories, ...pagination } = await videoService.getVideoCategories(req.query)
  return res.json({
    message: VIDEO_MESSAGES.GET_VIDEO_CATEGORIES_SUCCEED,
    data: {
      categories,
      pagination
    }
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

// Cập nhật video
export const updateVideoController = async (req: Request<VideoIdReqParams, any, UpdateVideoReqBody>, res: Response) => {
  const result = await videoService.updateVideo({ body: req.body, videoId: req.params.videoId })
  return res.json({
    message: VIDEO_MESSAGES.UPDATE_VIDEO_SUCCEED,
    data: result
  })
}

// Xóa videos
export const deleteVideosController = async (
  req: Request<ParamsDictionary, any, DeleteVideosReqBody>,
  res: Response
) => {
  const { deletedCount } = await videoService.deleteVideos(req.body.videoIds)
  return res.json({
    message: `Xóa ${deletedCount} video thành công`
  })
}

// Lấy danh sách video đề xuất
export const getSuggestedVideosController = async (
  req: Request<ParamsDictionary, any, any, GetSuggestedVideosReqQuery>,
  res: Response
) => {
  const { videos, ...pagination } = await videoService.getSuggestedVideos(req.query)
  return res.json({
    message: VIDEO_MESSAGES.GET_PUBLIC_VIDEOS_SUCCEED,
    data: {
      videos,
      pagination
    }
  })
}

// Lấy danh sách video tài khoản đăng nhập
export const getVideosOfMeController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const { videos, ...pagination } = await videoService.getVideosOfMe({ accountId, query: req.query })
  return res.json({
    message: VIDEO_MESSAGES.GET_VIDEOS_OF_ME_SUCCEED,
    data: {
      videos,
      pagination
    }
  })
}

// Lấy danh sách video theo username
export const getVideosByUsernameController = async (
  req: Request<UsernameReqParams, any, any, GetVideosOfMeReqQuery>,
  res: Response
) => {
  const { videos, ...pagination } = await videoService.getVideosByUsername({
    username: req.params.username,
    query: req.query
  })
  return res.json({
    message: VIDEO_MESSAGES.GET_VIDEOS_BY_USERNAME_SUCCEED,
    data: {
      videos,
      pagination
    }
  })
}

// Xem chi tiết video
export const watchVideoController = async (req: Request<IdNameReqParams>, res: Response) => {
  const accountId = req.decodedAuthorization?.accountId
  const result = await videoService.watchVideo({ accountId, idName: req.params.idName })
  return res.json({
    message: VIDEO_MESSAGES.GET_VIDEO_DETAIL_SUCCEED,
    data: result
  })
}

// Xem chi tiết video để cập nhật
export const getVideoToUpdateController = async (req: Request<VideoIdReqParams>, res: Response) => {
  const result = await videoService.getVideoDetailToUpdate(req.params.videoId)
  return res.json({
    message: VIDEO_MESSAGES.GET_VIDEO_DETAIL_SUCCEED,
    data: result
  })
}

// Lấy danh sách video đã thích
export const getLikedVideosController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const { videos, ...pagination } = await videoService.getLikedVideos({ accountId, query: req.query })
  return res.json({
    message: VIDEO_MESSAGES.GET_LIKED_VIDEOS_SUCCEED,
    data: {
      videos,
      pagination
    }
  })
}
