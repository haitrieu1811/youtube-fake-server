import { ParamsDictionary, Query } from 'express-serve-static-core'

import { VideoAudience } from '~/constants/enum'
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

// Params: Get video status
export type GetVideoStatusReqParams = ParamsDictionary & {
  id: string
}

// Body: Tạo mới video
export type CreateVideoReqBody = {
  idName: string
  thumbnail: string
  title: string
  category: string
  description?: string
  audience?: VideoAudience
}

// Body: Cập nhật video
export type UpdateVideoReqBody = {
  thumbnail?: string
  title?: string
  category?: string
  description?: string
  audience?: VideoAudience
}

// Params: Video id
export type VideoIdReqParams = ParamsDictionary & {
  videoId: string
}

// Body: Xóa video
export type DeleteVideosReqBody = {
  videoIds: string[]
}

// Lấy danh sách các video công khai
export type GetPublicVideosReqQuery = Query &
  PaginationReqQuery & {
    category?: string
  }
