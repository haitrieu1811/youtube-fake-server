import { PostAudience } from '~/constants/enum'

// Body: Tạo bài viết
export type CreatePostReqBody = {
  content: string
  images?: string[]
  audience?: PostAudience
}
