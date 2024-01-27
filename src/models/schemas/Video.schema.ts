import { ObjectId } from 'mongodb'
import { VideoAudience, VideoStatus } from '~/constants/enum'

type VideoConstructor = {
  _id?: ObjectId
  idName: string
  accountId: ObjectId
  thumbnail?: ObjectId
  title: string
  category?: ObjectId
  description?: string
  views?: number
  audience?: VideoAudience
  status?: VideoStatus
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
  status: VideoStatus
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
    status,
    createdAt,
    updatedAt
  }: VideoConstructor) {
    const date = new Date()
    this._id = _id
    this.idName = idName
    this.accountId = accountId
    this.thumbnail = thumbnail || new ObjectId('65b3413fd2d9b7a43b142e37')
    this.title = title
    this.category = category || new ObjectId('657c5ef3ea516bac79a1bdf1')
    this.description = description || ''
    this.views = views || 0
    this.audience = audience || VideoAudience.Everyone
    this.status = status || VideoStatus.Active
    this.createdAt = createdAt || date
    this.updatedAt = updatedAt || date
  }
}
