import { ObjectId } from 'mongodb'

import { ReportContentType, ReportStatus } from '~/constants/enum'

type ReportConstructor = {
  _id?: ObjectId
  accountId: ObjectId
  contentId: ObjectId
  content: string
  contentType: ReportContentType
  status?: ReportStatus
  createdAt?: Date
  updatedAt?: Date
}

export default class Report {
  _id?: ObjectId
  accountId: ObjectId
  contentId: ObjectId
  content: string
  contentType: ReportContentType
  status: ReportStatus
  createdAt: Date
  updatedAt: Date

  constructor({ _id, accountId, contentId, content, contentType, status, createdAt, updatedAt }: ReportConstructor) {
    const date = new Date()
    this._id = _id
    this.accountId = accountId
    this.contentId = contentId
    this.content = content
    this.contentType = contentType
    this.status = status ?? ReportStatus.Unresolved
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
