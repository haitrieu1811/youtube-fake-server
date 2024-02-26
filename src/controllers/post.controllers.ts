import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { POST_MESSAGES } from '~/constants/messages'
import { TokenPayload, UsernameReqParams } from '~/models/requests/Account.requests'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import {
  CreatePostReqBody,
  DeletePostsReqBody,
  PostIdReqParams,
  UpdatePostReqBody
} from '~/models/requests/Post.requests'
import postService from '~/services/post.services'

// Create a new post
export const createPostController = async (req: Request<ParamsDictionary, any, CreatePostReqBody>, res: Response) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await postService.createPost({ body: req.body, accountId })
  return res.json({
    message: POST_MESSAGES.CREATE_POST_SUCCEED,
    data: result
  })
}

// Update a post
export const updatePostController = async (req: Request<PostIdReqParams, any, UpdatePostReqBody>, res: Response) => {
  const result = await postService.updatePost({ body: req.body, postId: req.params.postId })
  return res.json({
    message: POST_MESSAGES.UPDATE_POST_SUCCEED,
    data: result
  })
}

// Delete posts
export const deletePostsController = async (req: Request<ParamsDictionary, any, DeletePostsReqBody>, res: Response) => {
  const { deletedCount } = await postService.deletePosts(req.body.postIds)
  return res.json({
    message: `Xóa ${deletedCount} bài viết thành công`
  })
}

// Get posts by username
export const getPostByUsernameController = async (
  req: Request<UsernameReqParams, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { username } = req.params
  const accountId = req.decodedAuthorization?.accountId
  const { posts, ...pagination } = await postService.getPostsByUsername({
    query: req.query,
    username,
    loggedAccountId: accountId
  })
  return res.json({
    message: POST_MESSAGES.GET_POSTS_SUCCEED,
    data: {
      posts,
      pagination
    }
  })
}

// Get my posts
export const getMyPostsController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const { posts, ...pagination } = await postService.getMyPosts({
    query: req.query,
    accountId
  })
  return res.json({
    message: POST_MESSAGES.GET_POSTS_SUCCEED,
    data: {
      posts,
      pagination
    }
  })
}

// Get post detail
export const getPostDetailController = async (req: Request<PostIdReqParams>, res: Response) => {
  const accountId = req.decodedAuthorization?.accountId
  const result = await postService.getPostDetail({ postId: req.params.postId, loggedAccountId: accountId })
  return res.json({
    message: POST_MESSAGES.GET_POST_DETAIL_SUCCEED,
    data: result
  })
}

// Get suggested posts
export const getSuggestedPostsController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const accountId = req.decodedAuthorization?.accountId
  const { posts, ...pagination } = await postService.getSuggestedPosts({
    query: req.query,
    loggedAccountId: accountId
  })
  return res.json({
    message: POST_MESSAGES.GET_POSTS_SUCCEED,
    data: {
      posts,
      pagination
    }
  })
}
