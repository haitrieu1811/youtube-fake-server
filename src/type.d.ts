import 'express'
import { Document } from 'mongodb'

import { TokenPayload } from './models/requests/Account.requests'
import Account from './models/schemas/Account.schema'

declare module 'express' {
  interface Request {
    account?: Document
    decodedAuthorization?: TokenPayload
    decodedRefreshToken?: TokenPayload
    decodedVerifyEmailToken?: TokenPayload
    decodedForgotPasswordToken?: TokenPayload
  }
}
