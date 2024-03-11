import { ObjectId } from 'mongodb'
import { PostAudience } from '~/constants/enum'

type PostConstructor = {
  _id?: ObjectId
  accountId: ObjectId
  contentId?: ObjectId
  content: string
  images?: ObjectId[]
  audience?: PostAudience
  createdAt?: Date
  updatedAt?: Date
}

export default class Post {
  _id?: ObjectId
  accountId: ObjectId
  contentId: ObjectId | null
  content: string
  images: ObjectId[]
  audience: PostAudience
  createdAt: Date
  updatedAt: Date

  constructor({ _id, accountId, contentId, content, images, audience, createdAt, updatedAt }: PostConstructor) {
    const date = new Date()
    this._id = _id
    this.accountId = accountId
    this.contentId = contentId || null
    this.content = content
    this.images = images || []
    this.audience = audience || PostAudience.Everyone
    this.createdAt = createdAt || date
    this.updatedAt = updatedAt || date
  }
}
