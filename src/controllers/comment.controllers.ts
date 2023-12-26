import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { COMMENT_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import {
  CommentIdReqParams,
  ContentIdReqParams,
  CreateCommentReqBody,
  GetCommentsReqQuery,
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

// Lấy danh sách bình luận
export const getCommentsController = async (
  req: Request<ContentIdReqParams, any, any, GetCommentsReqQuery>,
  res: Response
) => {
  const accountId = req.decodedAuthorization?.accountId
  const { comments, ...pagination } = await commentService.getComments({
    contentId: req.params.contentId,
    query: req.query,
    accountId
  })
  return res.json({
    message: COMMENT_MESSAGES.GET_COMMENTS_SUCCEED,
    data: {
      comments,
      pagination
    }
  })
}

// Lấy danh sách trả lời của bình luận
export const getRepliesOfCommentController = async (
  req: Request<CommentIdReqParams, any, any, GetCommentsReqQuery>,
  res: Response
) => {
  const accountId = req.decodedAuthorization?.accountId
  const { comments, ...pagination } = await commentService.getRepliesOfComments({
    commentId: req.params.commentId,
    query: req.query,
    accountId
  })
  return res.json({
    message: COMMENT_MESSAGES.GET_REPLIES_OF_COMMENT_SUCCEED,
    data: {
      comments,
      pagination
    }
  })
}
