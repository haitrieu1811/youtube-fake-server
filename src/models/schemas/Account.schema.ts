import { ObjectId } from 'mongodb'

import { AccountRole, AccountStatus, AccountVerifyStatus } from '~/constants/enum'
import { generateRandomString } from '~/lib/utils'

interface AccountConstructor {
  _id?: ObjectId
  email: string
  password: string
  username?: string
  channelName?: string
  bio?: string
  avatar?: ObjectId
  cover?: ObjectId
  tick?: boolean
  role?: AccountRole
  status?: AccountStatus
  verify?: AccountVerifyStatus
  forgotPasswordToken?: string
  verifyEmailToken?: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Account {
  _id?: ObjectId
  email: string
  password: string
  username: string
  channelName: string
  bio: string
  avatar: ObjectId | null
  cover: ObjectId | null
  tick: boolean
  role: AccountRole
  status: AccountStatus
  verify: AccountVerifyStatus
  forgotPasswordToken: string
  verifyEmailToken: string
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    email,
    password,
    username,
    channelName,
    bio,
    avatar,
    cover,
    tick,
    role,
    status,
    verify,
    forgotPasswordToken,
    verifyEmailToken,
    createdAt,
    updatedAt
  }: AccountConstructor) {
    const date = new Date()
    this._id = _id
    this.email = email
    this.password = password
    this.username = username ?? `user${generateRandomString(8)}`
    this.channelName = channelName ?? `channel${generateRandomString(8)}`
    this.bio = bio ?? ''
    this.avatar = avatar ?? null
    this.cover = cover ?? null
    this.tick = tick ?? false
    this.role = role ?? AccountRole.User
    this.status = status ?? AccountStatus.Active
    this.verify = verify ?? AccountVerifyStatus.Unverified
    this.forgotPasswordToken = forgotPasswordToken ?? ''
    this.verifyEmailToken = verifyEmailToken ?? ''
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
