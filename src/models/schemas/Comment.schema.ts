import { ObjectId } from 'mongodb'

import { CommentType } from '~/constants/enum'

type CommentConstructor = {
  _id?: ObjectId
  accountId: ObjectId
  contentId: ObjectId // Có thể là video, bài viết
  parentId: ObjectId | null
  content: string
  type: CommentType
  replyAccountId: ObjectId | null
  createdAt?: Date
  updatedAt?: Date
}

export default class Comment {
  _id?: ObjectId
  accountId: ObjectId
  contentId: ObjectId // Có thể là video, bài viết
  parentId: ObjectId | null
  content: string
  type: CommentType
  replyAccountId: ObjectId | null
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    accountId,
    contentId,
    parentId,
    content,
    type,
    replyAccountId,
    createdAt,
    updatedAt
  }: CommentConstructor) {
    const date = new Date()
    this._id = _id
    this.accountId = accountId
    this.contentId = contentId
    this.parentId = parentId
    this.content = content
    this.type = type
    this.replyAccountId = replyAccountId
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
