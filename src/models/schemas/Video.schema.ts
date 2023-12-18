import { ObjectId } from 'mongodb'

import { VideoAudience } from '~/constants/enum'

type VideoConstructor = {
  _id?: ObjectId
  idName: string
  accountId: ObjectId
  thumbnail: ObjectId
  title: string
  category: ObjectId
  description?: string
  views?: number
  audience?: VideoAudience
  createdAt?: Date
  updatedAt?: Date
}

export default class Video {
  _id?: ObjectId
  idName: string
  accountId: ObjectId
  thumbnail: ObjectId
  title: string
  category: ObjectId
  description: string
  views: number
  audience: VideoAudience
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    idName,
    accountId,
    thumbnail,
    title,
    category,
    description,
    views,
    audience,
    createdAt,
    updatedAt
  }: VideoConstructor) {
    const date = new Date()
    this._id = _id
    this.idName = idName
    this.accountId = accountId
    this.thumbnail = thumbnail
    this.title = title
    this.category = category
    this.description = description ?? ''
    this.views = views ?? 0
    this.audience = audience ?? VideoAudience.Everyone
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
