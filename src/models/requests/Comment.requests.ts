import { ParamsDictionary } from 'express-serve-static-core'

import { CommentType } from '~/constants/enum'

// Body: Thêm một bình luận
export type CreateCommentReqBody = {
  contentId: string
  content: string
  type: CommentType
}

// Params: Comment id
export type CommentIdReqParams = ParamsDictionary & {
  commentId: string
}

// Body: Cập nhật bình luận
export type UpdateCommentReqBody = {
  content: string
}
