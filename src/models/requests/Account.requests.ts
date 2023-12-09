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

// Body: Đăng ký
export type RegisterReqBody = {
  email: string
  password: string
}

// Body: Đăng xuất
export type LogoutReqBody = {
  refreshToken: string
}
