import { ObjectId } from 'mongodb'

interface SubscriptionConstructor {
  _id?: ObjectId
  fromAccountId: ObjectId
  toAccountId: ObjectId
  createdAt?: Date
  updatedAt?: Date
}

export default class Subscription {
  _id?: ObjectId
  fromAccountId: ObjectId
  toAccountId: ObjectId
  createdAt: Date
  updatedAt: Date

  constructor({ _id, fromAccountId, toAccountId, createdAt, updatedAt }: SubscriptionConstructor) {
    const date = new Date()
    this._id = _id
    this.fromAccountId = fromAccountId
    this.toAccountId = toAccountId
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
