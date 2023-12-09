import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import omit from 'lodash/omit'
import { WithId } from 'mongodb'

import { HttpStatusCode } from '~/constants/enum'
import { ACCOUNT_MESSAGES } from '~/constants/messages'
import { LogoutReqBody, RefreshTokenReqBody, RegisterReqBody, TokenPayload } from '~/models/requests/Account.requests'
import Account from '~/models/schemas/Account.schema'
import accountService from '~/services/account.services'

// Đăng ký tài khoản
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await accountService.register(req.body)
  return res.status(HttpStatusCode.Created).json({
    message: ACCOUNT_MESSAGES.REGISTER_SUCCEED,
    data: result
  })
}

// Đăng nhập
export const loginController = async (req: Request, res: Response) => {
  const account = req.account as WithId<Account>
  const result = await accountService.login(account)
  const _account = omit(account, ['role', 'status', 'verify'])
  return res.json({
    messsage: ACCOUNT_MESSAGES.LOGIN_SUCCEED,
    data: {
      ...result,
      account: _account
    }
  })
}

// Đăng xuất
export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  await accountService.logout(req.body.refreshToken)
  return res.json({
    message: ACCOUNT_MESSAGES.LOGOUT_SUCCEED
  })
}

// Refresh token
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { accountId, role, status, verify, exp } = req.decodedRefreshToken as TokenPayload
  const { newAccessToken, newRefreshToken } = await accountService.refreshToken({
    data: { accountId, role, status, verify },
    refreshToken: req.body.refreshToken,
    exp
  })
  return res.json({
    message: ACCOUNT_MESSAGES.REFRESH_TOKEN_SUCCEED,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  })
}
