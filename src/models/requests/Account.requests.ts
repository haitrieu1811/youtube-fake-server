import { ParamsDictionary } from 'express-serve-static-core'

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

// Params: Account id
export type AccountIdReqParams = ParamsDictionary & {
  accountId: string
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

// Body: Refresh token
export type RefreshTokenReqBody = {
  refreshToken: string
}

// Body: Xác thực email
export type VerifyEmailReqBody = {
  verifyEmailToken: string
}

// Body: Đặt lại mật khẩu
export type ResetPasswordReqBody = {
  password: string
  confirmPassword: string
  forgotPasswordToken: string
}
