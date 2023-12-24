import { ObjectId } from 'mongodb'

import { CreateCommentReqBody } from '~/models/requests/Comment.requests'
import Comment from '~/models/schemas/Comment.schema'
import databaseService from './database.services'

class CommentService {
  // Thêm một bình luận
  async createComment({ body, accountId }: { body: CreateCommentReqBody; accountId: string }) {
    const { insertedId } = await databaseService.comments.insertOne(
      new Comment({
        accountId: new ObjectId(accountId),
        contentId: new ObjectId(body.contentId),
        content: body.content,
        type: body.type
      })
    )
    const newComment = await databaseService.comments.findOne({ _id: insertedId })
    return {
      comment: newComment
    }
  }

  // Cập nhật bình luận
  async updateComment({ commentId, content }: { commentId: string; content: string }) {
    const updatedComment = await databaseService.comments.findOneAndUpdate(
      { _id: new ObjectId(commentId) },
      {
        $set: { content },
        $currentDate: { updatedAt: true }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      comment: updatedComment
    }
  }
}

const commentService = new CommentService()
export default commentService
