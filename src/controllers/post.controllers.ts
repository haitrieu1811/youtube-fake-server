import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { POST_MESSAGES } from '~/constants/messages'
import { AccountIdReqParams, TokenPayload } from '~/models/requests/Account.requests'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import {
  CreatePostReqBody,
  DeletePostsReqBody,
  PostIdReqParams,
  UpdatePostReqBody
} from '~/models/requests/Post.requests'
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

// Xóa bài viết
export const deletePostsController = async (req: Request<ParamsDictionary, any, DeletePostsReqBody>, res: Response) => {
  const { deletedCount } = await postService.deletePosts(req.body.postIds)
  return res.json({
    message: `Xóa ${deletedCount} bài viết thành công`
  })
}

// Lấy danh sách bài viết ở trang cá nhân
export const getPostsInProfilePageController = async (
  req: Request<AccountIdReqParams, any, any, PaginationReqQuery>,
  res: Response
) => {
  const accountId = req.decodedAuthorization?.accountId
  const { posts, ...pagination } = await postService.getPostsInProfilePage({
    query: req.query,
    profileId: req.params.accountId,
    accountId
  })
  return res.json({
    message: POST_MESSAGES.GET_POSTS_IN_PROFILE_PAGE_SUCCEED,
    data: {
      posts,
      pagination
    }
  })
}
