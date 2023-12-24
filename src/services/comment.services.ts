import { ObjectId, WithId } from 'mongodb'

import { CreateCommentReqBody, ReplyCommentReqBody } from '~/models/requests/Comment.requests'
import Comment from '~/models/schemas/Comment.schema'
import databaseService from './database.services'

class CommentService {
  // Thêm một bình luận
  async createComment({ body, accountId }: { body: CreateCommentReqBody; accountId: string }) {
    const { contentId, content, type } = body
    const { insertedId } = await databaseService.comments.insertOne(
      new Comment({
        accountId: new ObjectId(accountId),
        contentId: new ObjectId(contentId),
        parentId: null,
        content,
        type,
        replyAccountId: null
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

  // Xóa bình luận
  async deleteComment(commentId: string) {
    await databaseService.comments.deleteOne({ _id: new ObjectId(commentId) })
    return true
  }

  // Trả lời bình luận
  async replyComment({
    commentId,
    body,
    accountId
  }: {
    commentId: string
    body: ReplyCommentReqBody
    accountId: string
  }) {
    const parentComment = (await databaseService.comments.findOne({ _id: new ObjectId(commentId) })) as WithId<Comment>
    const { _id, contentId, type } = parentComment
    const { insertedId } = await databaseService.comments.insertOne(
      new Comment({
        accountId: new ObjectId(accountId),
        contentId,
        parentId: _id,
        content: body.content,
        type,
        replyAccountId: body.replyAccountId ? new ObjectId(body.replyAccountId) : null
      })
    )
    const newReplyComment = await databaseService.comments.findOne({ _id: insertedId })
    return {
      reply: newReplyComment
    }
  }
}

const commentService = new CommentService()
export default commentService
