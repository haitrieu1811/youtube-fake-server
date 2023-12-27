import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { POST_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import { CreatePostReqBody, PostIdReqParams, UpdatePostReqBody } from '~/models/requests/Post.requests'
import postService from '~/services/post.services'

// Tạo bài viết
export const createPostController = async (req: Request<ParamsDictionary, any, CreatePostReqBody>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await postService.createPost({ body: req.body, accountId })
  return res.json({
    message: POST_MESSAGES.CREATE_POST_SUCCEED,
    data: result
  })
}

// Cập nhật bài viết
export const updatePostController = async (req: Request<PostIdReqParams, any, UpdatePostReqBody>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await postService.updatePost({ body: req.body, postId: req.params.postId })
  return res.json({
    message: POST_MESSAGES.UPDATE_POST_SUCCEED,
    data: result
  })
}
