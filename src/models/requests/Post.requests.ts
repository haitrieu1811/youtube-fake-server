import { ParamsDictionary } from 'express-serve-static-core'

import { PostAudience } from '~/constants/enum'

// Body: Tạo bài viết
export type CreatePostReqBody = {
  content: string
  images?: string[]
  audience?: PostAudience
}

// Body: Cập nhật bài viết
export type UpdatePostReqBody = {
  content?: string
  images?: string[]
  audience?: PostAudience
}

// Params: Post id
export type PostIdReqParams = ParamsDictionary & {
  postId: string
}

// Body: Xóa bài viết
export type DeletePostsReqBody = {
  postIds: string[]
}
