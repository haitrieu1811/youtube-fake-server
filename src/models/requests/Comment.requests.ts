import { ParamsDictionary, Query } from 'express-serve-static-core'

import { CommentType } from '~/constants/enum'
import { PaginationReqQuery } from './Common.requests'

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

// Body: Trả lời bình luận
export type ReplyCommentReqBody = {
  content: string
  replyAccountId?: string
}

// Query: Lấy danh sách bình luận
export type GetCommentsReqQuery = Query &
  PaginationReqQuery & {
    orderBy?: 'asc' | 'desc'
  }

// Params: Content id
export type ContentIdReqParams = ParamsDictionary & {
  contentId: string
}
