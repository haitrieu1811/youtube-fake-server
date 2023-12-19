import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { REACTION_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import { CreateReactionReqBody, ReactionIdReqParams, UpdateReactionReqBody } from '~/models/requests/Reaction.request'
import reactionService from '~/services/reaction.services'

// Thêm một reaction (video, post, comment)
export const createReactionController = async (
  req: Request<ParamsDictionary, any, CreateReactionReqBody>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await reactionService.createReaction({ accountId, body: req.body })
  return res.json({
    message: REACTION_MESSAGES.CREATE_REACTION_SUCCEED,
    data: result
  })
}

// Cập nhật một reaction (video, post, comment)
export const updateReactionController = async (
  req: Request<ReactionIdReqParams, any, UpdateReactionReqBody>,
  res: Response
) => {
  const result = await reactionService.updateReaction({ reactionId: req.params.reactionId, type: req.body.type })
  return res.json({
    message: REACTION_MESSAGES.UPDATE_REACTION_SUCCEED,
    data: result
  })
}

// Bỏ like (video, post, comment)
export const deleteReactionController = async (req: Request<ReactionIdReqParams>, res: Response) => {
  await reactionService.deleteReaction(req.params.reactionId)
  return res.json({
    message: REACTION_MESSAGES.DELETE_REACTION_SUCCEED
  })
}
