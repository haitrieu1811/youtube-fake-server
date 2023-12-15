import { ParamsDictionary } from 'express-serve-static-core'

import { AccountRole, AccountStatus, AccountVerifyStatus, TokenType } from '~/constants/enum'
import { PaginationReqQuery } from './Common.requests'

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

// Body: Thay đổi mật khẩu
export type ChangePasswordReqBody = {
  oldPassword: string
  password: string
  confirmPassword: string
}

// Body: Cập nhật thông tin tài khoản đăng nhập
export type UpdateMeReqBody = {
  username?: string
  channelName?: string
  bio?: string
  avatar?: string
  cover?: string
}

// Params: Username
export type UsernameReqParams = {
  username: string
}

// Query: Lấy danh sách toàn bộ tài khoản trên hệ thống
export type GetAllAccountsReqQuery = PaginationReqQuery & {
  status: AccountStatus
}

// Body: Admin cập nhật account user
export type AdminUpdateAccountUserReqBody = {
  tick?: boolean
  role?: AccountRole
  status?: AccountStatus
}

// Body: Xóa vĩnh viễn tài khoản
export type DeleteAccountsReqBody = {
  accountIds: string[]
}
