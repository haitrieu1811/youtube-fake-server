import { ParamsDictionary, Query } from 'express-serve-static-core'

import { VideoAudience, VideoStatus } from '~/constants/enum'
import { PaginationReqQuery } from './Common.requests'

// Body: Tạo danh mục video
export type CreateVideoCategoryReqBody = {
  name: string
  description?: string
}

// Body: Cập nhật danh mục video
export type UpdateVideoCategoryReqBody = {
  name?: string
  description?: string
}

// Params: Danh mục video
export type VideoCategoryIdReqParams = ParamsDictionary & {
  videoCategoryId: string
}

// Params: Lấy trạng thái decode video
export type GetVideoStatusReqParams = ParamsDictionary & {
  id: string
}

// Body: Tạo mới video
export type CreateVideoReqBody = {
  idName: string
  title: string
}

// Body: Cập nhật video
export type UpdateVideoReqBody = {
  thumbnail?: string
  title?: string
  category?: string
  description?: string
  audience?: VideoAudience
  status?: VideoStatus
}

// Params: Video id
export type VideoIdReqParams = ParamsDictionary & {
  videoId: string
}

// Params: idName
export type IdNameReqParams = ParamsDictionary & {
  idName: string
}

// Body: Xóa video
export type DeleteVideosReqBody = {
  videoIds: string[]
}

// Query: Lấy danh sách các video công khai
export type GetSuggestedVideosReqQuery = Query &
  PaginationReqQuery & {
    category?: string
  }

// Query: Lấy danh sách video của tôi
export type GetVideosOfMeReqQuery = Query &
  PaginationReqQuery & {
    sortBy?: string
    orderBy?: 'asc' | 'desc'
  }

// Query: Lấy danh sách video theo username
export type GetVideosByUsernameReqQuery = Query &
  PaginationReqQuery & {
    sortBy?: string
    orderBy?: 'asc' | 'desc'
  }
