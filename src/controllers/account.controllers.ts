import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { HttpStatusCode } from '~/constants/enum'
import { ACCOUNT_MESSAGES } from '~/constants/messages'
import { RegisterAccountReqBody } from '~/models/requests/Account.requests'
import accountService from '~/services/account.services'

// Đăng ký tài khoản
export const registerAccountController = async (
  req: Request<ParamsDictionary, any, RegisterAccountReqBody>,
  res: Response
) => {
  const result = await accountService.registerAccount(req.body)
  return res.status(HttpStatusCode.Created).json({
    message: ACCOUNT_MESSAGES.REGISTER_SUCCEED,
    data: result
  })
}
