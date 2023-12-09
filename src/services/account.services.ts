import { ObjectId, WithId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { AccountRole, AccountStatus, AccountVerifyStatus, TokenType } from '~/constants/enum'
import { signToken } from '~/lib/jwt'
import { RegisterAccountReqBody, TokenPayload } from '~/models/requests/Account.requests'
import databaseService from './database.services'
import Account from '~/models/schemas/Account.schema'
import { hashPassword } from '~/lib/crypto'

type SignToken = Pick<TokenPayload, 'accountId' | 'role' | 'status' | 'verify'>

class AccountService {
  // Tạo access token
  private signAccessToken(data: SignToken) {
    return signToken({
      payload: {
        ...data,
        tokenType: TokenType.AccessToken
      },
      privateKey: ENV_CONFIG.JWT_ACCESS_TOKEN_SECRET,
      options: {
        expiresIn: ENV_CONFIG.JWT_ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  // Tạo refresh token
  private signRefreshToken({ data, exp }: { data: SignToken; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          ...data,
          tokenType: TokenType.RefreshToken,
          exp
        },
        privateKey: ENV_CONFIG.JWT_REFRESH_TOKEN_SECRET
      })
    }
    return signToken({
      payload: {
        ...data,
        token_type: TokenType.RefreshToken
      },
      privateKey: ENV_CONFIG.JWT_REFRESH_TOKEN_SECRET,
      options: {
        expiresIn: ENV_CONFIG.JWT_REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  // Tạo email verify token
  private signVerifyEmailToken(accountId: string) {
    return signToken({
      payload: {
        accountId,
        tokenType: TokenType.VerifyEmailToken
      },
      privateKey: ENV_CONFIG.JWT_VERIFY_EMAIL_TOKEN_SECRET,
      options: {
        expiresIn: ENV_CONFIG.JWT_VERIFY_EMAIL_TOKEN_EXPIRES_IN
      }
    })
  }

  // Tạo forgot password token
  private signForgotPasswordToken({ accountId, data }: { accountId: string; data: SignToken }) {
    return signToken({
      payload: {
        ...data,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: ENV_CONFIG.JWT_FORGOT_PASSWORD_TOKEN_SECRET,
      options: {
        expiresIn: ENV_CONFIG.JWT_FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  // Tạo access và refresh token
  private signAccessAndRefreshToken({ data, exp }: { data: SignToken; exp?: number }) {
    return Promise.all([this.signAccessToken(data), this.signRefreshToken({ data, exp })])
  }

  // Đăng ký
  async registerAccount(body: RegisterAccountReqBody) {
    const accountId = new ObjectId()
    const [[accessToken, refreshToken], verifyEmailToken] = await Promise.all([
      this.signAccessAndRefreshToken({
        data: {
          accountId: accountId.toString(),
          role: AccountRole.User,
          status: AccountStatus.Active,
          verify: AccountVerifyStatus.Unverified
        }
      }),
      this.signVerifyEmailToken(accountId.toString())
    ])
    await databaseService.accounts.insertOne(
      new Account({
        _id: accountId,
        email: body.email,
        password: hashPassword(body.password),
        verifyEmailToken
      })
    )
    const account = (await databaseService.accounts.findOne(
      { _id: accountId },
      {
        projection: {
          password: 0,
          role: 0,
          status: 0,
          verify: 0,
          forgotPasswordToken: 0,
          verifyEmailToken: 0
        }
      }
    )) as WithId<Account>
    return {
      accessToken,
      refreshToken,
      account
    }
  }
}

const accountService = new AccountService()
export default accountService
