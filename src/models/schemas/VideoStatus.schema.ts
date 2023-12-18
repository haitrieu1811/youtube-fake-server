import { ObjectId } from 'mongodb'

import { EncodingStatus } from '~/constants/enum'

type VideoStatusConstructor = {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  messsage?: string
  createdAt?: Date
  updatedAt?: Date
}

export default class VideoStatus {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  messsage: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id, name, status, messsage, createdAt, updatedAt }: VideoStatusConstructor) {
    const date = new Date()
    this._id = _id
    this.name = name
    this.status = status
    this.messsage = messsage ?? ''
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
