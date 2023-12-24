import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { COMMENT_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import { CreateCommentReqBody } from '~/models/requests/Comment.requests'
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
