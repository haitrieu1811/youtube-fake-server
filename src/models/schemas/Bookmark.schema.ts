import { ObjectId } from 'mongodb'

type BookmarkConstructor = {
  _id?: ObjectId
  videoId: ObjectId
  accountId: ObjectId
  createdAt?: Date
  updatedAt?: Date
}

export default class Bookmark {
  _id?: ObjectId
  videoId: ObjectId
  accountId: ObjectId
  createdAt: Date
  updatedAt: Date

  constructor({ _id, videoId, accountId, createdAt, updatedAt }: BookmarkConstructor) {
    const date = new Date()
    this._id = _id
    this.videoId = videoId
    this.accountId = accountId
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
