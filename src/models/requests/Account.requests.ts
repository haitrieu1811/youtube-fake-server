import { AccountRole, AccountStatus, AccountVerifyStatus, TokenType } from '~/constants/enum'

export type TokenPayload = {
  accountId: string
  role: AccountRole
  verify: AccountVerifyStatus
  status: AccountStatus
  tokenType: TokenType
  iat: number
  exp: number
}

export type RegisterAccountReqBody = {
  email: string
  password: string
}
