import { ObjectId } from 'mongodb'

import { CreatePostReqBody } from '~/models/requests/Post.requests'
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
}

const postService = new PostService()
export default postService
