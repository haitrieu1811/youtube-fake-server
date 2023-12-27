import { ObjectId } from 'mongodb'

import { PlaylistAudience } from '~/constants/enum'

type PlaylistConstructor = {
  _id?: ObjectId
  accountId: ObjectId
  name: string
  description?: string
  audience?: PlaylistAudience
  createdAt?: Date
  updatedAt?: Date
}

export default class Playlist {
  _id?: ObjectId
  accountId: ObjectId
  name: string
  description: string
  audience: PlaylistAudience
  createdAt: Date
  updatedAt: Date

  constructor({ _id, accountId, name, description, audience, createdAt, updatedAt }: PlaylistConstructor) {
    const date = new Date()
    this._id = _id
    this.accountId = accountId
    this.name = name
    this.description = description ?? ''
    this.audience = audience ?? PlaylistAudience.Everyone
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
