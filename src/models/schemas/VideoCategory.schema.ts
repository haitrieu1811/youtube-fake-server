import { ObjectId } from 'mongodb'

type VideoCategoryConstructor = {
  _id?: ObjectId
  accountId: ObjectId
  name: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

export default class VideoCategory {
  _id?: ObjectId
  accountId: ObjectId
  name: string
  description: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id, accountId, name, description, createdAt, updatedAt }: VideoCategoryConstructor) {
    const date = new Date()
    this._id = _id
    this.accountId = accountId
    this.name = name
    this.description = description ?? ''
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
