import { ObjectId } from 'mongodb'
import { ReactionContentType, ReactionType } from '~/constants/enum'

type ReactionConstructor = {
  _id?: ObjectId
  accountId: ObjectId
  contentId: ObjectId // Có thể là video, post và comment
  contentType: ReactionContentType
  type: ReactionType
  createdAt?: Date
  updatedAt?: Date
}

export default class Reaction {
  _id?: ObjectId
  accountId: ObjectId
  contentId: ObjectId // Có thể là video, post và comment
  contentType: ReactionContentType
  type: ReactionType
  createdAt: Date
  updatedAt: Date

  constructor({ _id, accountId, contentId, contentType, type, createdAt, updatedAt }: ReactionConstructor) {
    const date = new Date()
    this._id = _id
    this.accountId = accountId
    this.contentId = contentId
    this.contentType = contentType
    this.type = type
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
