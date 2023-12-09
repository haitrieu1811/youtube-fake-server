import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { WithId } from 'mongodb'
import omit from 'lodash/omit'

import { HttpStatusCode } from '~/constants/enum'
import { ACCOUNT_MESSAGES } from '~/constants/messages'
import { RegisterAccountReqBody } from '~/models/requests/Account.requests'
import Account from '~/models/schemas/Account.schema'
import accountService from '~/services/account.services'

// Đăng ký tài khoản
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterAccountReqBody>,
  res: Response
) => {
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
