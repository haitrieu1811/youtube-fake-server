import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { COMMENT_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import {
  CommentIdReqParams,
  CreateCommentReqBody,
  ReplyCommentReqBody,
  UpdateCommentReqBody
} from '~/models/requests/Comment.requests'
import commentService from '~/services/comment.services'

// Thêm một bình luận
export const createCommentController = async (
  req: Request<ParamsDictionary, any, CreateCommentReqBody>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await commentService.createComment({ body: req.body, accountId })
  return res.json({
    message: COMMENT_MESSAGES.CREATE_COMMENT_SUCCEED,
    data: result
  })
}

// Cập nhật bình luận
export const updateCommentController = async (
  req: Request<CommentIdReqParams, any, UpdateCommentReqBody>,
  res: Response
) => {
  const result = await commentService.updateComment({ commentId: req.params.commentId, content: req.body.content })
  return res.json({
    message: COMMENT_MESSAGES.UPDATE_COMMENT_SUCCEED,
    data: result
  })
}

// Xóa bình luận
export const deleteCommentController = async (req: Request<CommentIdReqParams>, res: Response) => {
  await commentService.deleteComment(req.params.commentId)
  return res.json({
    message: COMMENT_MESSAGES.DELETE_COMMENT_SUCCEED
  })
}

// Trả lời bình luận
export const replyCommentController = async (
  req: Request<CommentIdReqParams, any, ReplyCommentReqBody>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await commentService.replyComment({ commentId: req.params.commentId, accountId, body: req.body })
  return res.json({
    message: COMMENT_MESSAGES.REPLY_COMMENT_SUCCEED,
    data: result
  })
}
