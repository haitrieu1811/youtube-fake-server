import { CommentType } from '~/constants/enum'

// Body: Thêm một bình luận
export type CreateCommentReqBody = {
  contentId: string
  content: string
  type: CommentType
}
