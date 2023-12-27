import isUndefined from 'lodash/isUndefined'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'
import { ObjectId } from 'mongodb'

import { CreatePostReqBody, UpdatePostReqBody } from '~/models/requests/Post.requests'
import Post from '~/models/schemas/Post.schema'
import databaseService from './database.services'

class PostService {
  // Thêm bài viết
  async createPost({ body, accountId }: { body: CreatePostReqBody; accountId: string }) {
    const { images, content } = body
    const { insertedId } = await databaseService.posts.insertOne(
      new Post({
        accountId: new ObjectId(accountId),
        content,
        images: images ? images.map((item) => new ObjectId(item)) : undefined
      })
    )
    const newPost = await databaseService.posts.findOne({ _id: insertedId })
    return {
      post: newPost
    }
  }

  // Cập nhật bài viết
  async updatePost({ body, postId }: { body: UpdatePostReqBody; postId: string }) {
    let bodyConfig = omitBy(body, isUndefined)
    bodyConfig = omit(bodyConfig, ['images'])
    const imagesConfig = body.images ? body.images.map((image) => new ObjectId(image)) : []
    const updatedPost = await databaseService.posts.findOneAndUpdate(
      {
        _id: new ObjectId(postId)
      },
      {
        $set: bodyConfig,
        $push: {
          images: {
            $each: imagesConfig
          }
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      post: updatedPost
    }
  }

  // Xóa bài viết
  async deletePosts(postIds: string[]) {
    const _postIds = postIds.map((id) => new ObjectId(id))
    const { deletedCount } = await databaseService.posts.deleteMany({
      _id: {
        $in: _postIds
      }
    })
    return {
      deletedCount
    }
  }
}

const postService = new PostService()
export default postService
