import { ParamsDictionary } from 'express-serve-static-core'

import { ReactionContentType, ReactionType } from '~/constants/enum'

// Body: Thêm một reaction
export type CreateReactionReqBody = {
  contentId: string // Có thể là video, post và comment
  contentType: ReactionContentType
  type: ReactionType
}

// Params: Reaction id
export type ReactionIdReqParams = ParamsDictionary & {
  reactionId: string
}

// Body: Cập nhật một reaction
export type UpdateReactionReqBody = {
  type: ReactionType
}
