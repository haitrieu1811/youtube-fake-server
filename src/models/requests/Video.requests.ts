import { ParamsDictionary } from 'express-serve-static-core'

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
