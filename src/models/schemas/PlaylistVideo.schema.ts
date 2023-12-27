import { ObjectId } from 'mongodb'

type PlaylistVideoConstructor = {
  _id?: ObjectId
  playlistId: ObjectId
  videoId: ObjectId
  createdAt?: Date
  updatedAt?: Date
}

export default class PlaylistVideo {
  _id?: ObjectId
  playlistId: ObjectId
  videoId: ObjectId
  createdAt: Date
  updatedAt: Date

  constructor({ _id, playlistId, videoId, createdAt, updatedAt }: PlaylistVideoConstructor) {
    const date = new Date()
    this._id = _id
    this.playlistId = playlistId
    this.videoId = videoId
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
