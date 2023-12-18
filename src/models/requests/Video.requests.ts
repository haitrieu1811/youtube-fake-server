import { ParamsDictionary } from 'express-serve-static-core'
import { VideoAudience } from '~/constants/enum'

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
