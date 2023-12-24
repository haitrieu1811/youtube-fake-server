import { ObjectId } from 'mongodb'

import { CommentType } from '~/constants/enum'

type CommentConstructor = {
  _id?: ObjectId
  accountId: ObjectId
  contentId: ObjectId // Có thể là video, bài viết
  content: string
  type: CommentType
  createdAt?: Date
  updatedAt?: Date
}

export default class Comment {
  _id?: ObjectId
  accountId: ObjectId
  contentId: ObjectId // Có thể là video, bài viết
  content: string
  type: CommentType
  createdAt: Date
  updatedAt: Date

  constructor({ _id, accountId, contentId, content, type, createdAt, updatedAt }: CommentConstructor) {
    const date = new Date()
    this._id = _id
    this.accountId = accountId
    this.contentId = contentId
    this.content = content
    this.type = type
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
