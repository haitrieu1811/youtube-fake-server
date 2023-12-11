import { ObjectId, WithId } from 'mongodb'
import omit from 'lodash/omit'

import { ENV_CONFIG } from '~/constants/config'
import { AccountRole, AccountStatus, AccountVerifyStatus, TokenType } from '~/constants/enum'
import { hashPassword } from '~/lib/crypto'
import { signToken, verifyToken } from '~/lib/jwt'
import {
  ChangePasswordReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload
} from '~/models/requests/Account.requests'
import Account from '~/models/schemas/Account.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import databaseService from './database.services'

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
  private signForgotPasswordToken(accountId: string) {
    return signToken({
      payload: {
        accountId,
        tokenType: TokenType.ForgotPasswordToken
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

  // Giải mã refresh token
  private decodeRefreshToken(refreshToken: string) {
    return verifyToken({
      token: refreshToken,
      secretOrPublicKey: ENV_CONFIG.JWT_REFRESH_TOKEN_SECRET
    })
  }

  // Đăng ký
  async register(body: RegisterReqBody) {
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

  // Đăng nhập
  async login(account: Account) {
    const { _id, role, status, verify } = account
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      data: {
        accountId: (_id as ObjectId).toString(),
        role,
        status,
        verify
      }
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refreshToken,
        iat,
        exp
      })
    )
    return {
      accessToken,
      refreshToken
    }
  }

  // Đăng xuất
  async logout(refreshToken: string) {
    await databaseService.refreshTokens.deleteOne({ token: refreshToken })
    return true
  }

  // Refresh token
  async refreshToken({ data, exp, refreshToken }: { data: SignToken; exp?: number; refreshToken: string }) {
    const [[newAccessToken, newRefreshToken]] = await Promise.all([
      this.signAccessAndRefreshToken({ data, exp }),
      databaseService.refreshTokens.deleteOne({ token: refreshToken })
    ])
    const decodedRefreshToken = await this.decodeRefreshToken(newRefreshToken)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: newRefreshToken,
        iat: decodedRefreshToken.iat,
        exp: decodedRefreshToken.exp
      })
    )
    return {
      newAccessToken,
      newRefreshToken
    }
  }

  // Xác thực email
  async verifyEmail(accountId: string) {
    const updatedAccount = await databaseService.accounts.findOneAndUpdate(
      {
        _id: new ObjectId(accountId)
      },
      {
        $set: {
          verify: AccountVerifyStatus.Verified,
          verifyEmailToken: ''
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        projection: {
          password: 0,
          role: 0,
          status: 0,
          verify: 0,
          forgotPasswordToken: 0,
          verifyEmailToken: 0
        },
        returnDocument: 'after'
      }
    )
    const { _id, role, status, verify } = updatedAccount as WithId<Account>
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      data: {
        accountId: _id.toString(),
        role,
        status,
        verify
      }
    })
    return {
      accessToken,
      refreshToken,
      account: updatedAccount
    }
  }

  // Yêu cầu gửi lại email xác thực khi token hết hạn hoặc bị mất email
  async resendEmailVerifyAccount(accountId: string) {
    const verifyEmailToken = await this.signVerifyEmailToken(accountId)
    await databaseService.accounts.updateOne(
      { _id: new ObjectId(accountId) },
      {
        $set: {
          verifyEmailToken
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    return true
  }

  // Gửi yêu cầu quên mật khẩu
  async forgotPassword(accountId: string) {
    const forgotPasswordToken = await this.signForgotPasswordToken(accountId)
    await databaseService.accounts.updateOne(
      { _id: new ObjectId(accountId) },
      {
        $set: {
          forgotPasswordToken
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    return true
  }

  // Đặt lại mật khẩu
  async resetPassword({ body, accountId }: { body: ResetPasswordReqBody; accountId: string }) {
    const updatedAccount = (await databaseService.accounts.findOneAndUpdate(
      {
        _id: new ObjectId(accountId)
      },
      {
        $set: {
          password: hashPassword(body.password),
          forgotPasswordToken: ''
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after',
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
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      data: {
        accountId: updatedAccount._id.toString(),
        role: updatedAccount.role,
        status: updatedAccount.status,
        verify: updatedAccount.verify
      }
    })
    return {
      accessToken,
      refreshToken,
      account: updatedAccount
    }
  }

  // Thay đổi mật khẩu
  async changePassword({ body, accountId }: { body: ChangePasswordReqBody; accountId: string }) {
    const updatedAccount = (await databaseService.accounts.findOneAndUpdate(
      {
        _id: new ObjectId(accountId)
      },
      {
        $set: {
          password: hashPassword(body.password)
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after',
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
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      data: {
        accountId: updatedAccount._id.toString(),
        role: updatedAccount.role,
        status: updatedAccount.status,
        verify: updatedAccount.verify
      }
    })
    return {
      accessToken,
      refreshToken,
      account: updatedAccount
    }
  }

  // Thông tin tài khoản đăng nhập
  async getMe(accountId: string) {
    const me = (await databaseService.accounts.findOne({ _id: new ObjectId(accountId) })) as WithId<Account>
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      data: {
        accountId: me._id.toString(),
        role: me.role,
        status: me.status,
        verify: me.verify
      }
    })
    const _me = omit(me, ['password', 'role', 'status', 'verify', 'forgotPasswordToken', 'verifyEmailToken'])
    return {
      accessToken,
      refreshToken,
      me: _me
    }
  }
}

const accountService = new AccountService()
export default accountService
