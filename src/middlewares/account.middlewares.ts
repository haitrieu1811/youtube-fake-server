import { Request, NextFunction, Response } from 'express'
import { ParamSchema, check, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import capitalize from 'lodash/capitalize'

import { ENV_CONFIG } from '~/constants/config'
import { AccountVerifyStatus, HttpStatusCode } from '~/constants/enum'
import { ACCOUNT_MESSAGES } from '~/constants/messages'
import { hashPassword } from '~/lib/crypto'
import { verifyToken } from '~/lib/jwt'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import databaseService from '~/services/database.services'

const emailSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_REQUIRED
  },
  isEmail: {
    errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_INVALID
  }
}

const passwordSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isLength: {
    options: {
      min: 6,
      max: 32
    },
    errorMessage: ACCOUNT_MESSAGES.PASSWORD_LENGTH_IS_INVALID
  }
}

// Đăng ký tài khoản
export const registerValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value: string) => {
            const account = await databaseService.accounts.findOne({ email: value })
            if (account) {
              throw new Error(ACCOUNT_MESSAGES.EMAIL_ALREADY_EXIST)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirmPassword: {
        trim: true,
        notEmpty: {
          errorMessage: ACCOUNT_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        custom: {
          options: (value: string, { req }) => {
            if (value !== req.body.password) {
              throw new Error(ACCOUNT_MESSAGES.CONFIRM_PASSWORD_NOT_MATCH)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

// Đăng nhập
export const loginValidator = validate(
  checkSchema(
    {
      email: emailSchema,
      password: {
        ...passwordSchema,
        custom: {
          options: async (value: string, { req }) => {
            const account = await databaseService.accounts.findOne(
              {
                email: req.body.email,
                password: hashPassword(value)
              },
              {
                projection: {
                  password: 0,
                  forgotPasswordToken: 0,
                  verifyEmailToken: 0
                }
              }
            )
            if (!account) {
              throw new Error(ACCOUNT_MESSAGES.EMAIL_OR_PASSWORD_IS_INVALID)
            }
            ;(req as Request).account = account
            return true
          }
        }
      }
    },
    ['body']
  )
)

// Validate: Refresh token
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refreshToken: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ACCOUNT_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.Unauthorized
              })
            }
            try {
              const [decodedRefreshToken, refreshToken] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: ENV_CONFIG.JWT_REFRESH_TOKEN_SECRET
                }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (!refreshToken) {
                throw new ErrorWithStatus({
                  message: ACCOUNT_MESSAGES.REFRESH_TOKEN_IS_USED_OR_NOT_EXISTED,
                  status: HttpStatusCode.NotFound
                })
              }
              ;(req as Request).decodedRefreshToken = decodedRefreshToken
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HttpStatusCode.Unauthorized
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

// Validate: Access token
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const accessToken = (value ?? '').split(' ')[1]
            if (!accessToken) {
              throw new ErrorWithStatus({
                message: ACCOUNT_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.Unauthorized
              })
            }
            try {
              const decodedAuthorization = await verifyToken({
                token: accessToken,
                secretOrPublicKey: ENV_CONFIG.JWT_ACCESS_TOKEN_SECRET
              })
              ;(req as Request).decodedAuthorization = decodedAuthorization
              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HttpStatusCode.Unauthorized
              })
            }
          }
        }
      }
    },
    ['headers']
  )
)

// Xác thực email
export const verifyEmailValidator = validate(
  checkSchema(
    {
      verifyEmailToken: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ACCOUNT_MESSAGES.VERIFY_EMAIL_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.Unauthorized
              })
            }
            try {
              const [decodedVerifyEmailToken, account] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: ENV_CONFIG.JWT_VERIFY_EMAIL_TOKEN_SECRET
                }),
                databaseService.accounts.findOne({ verifyEmailToken: value })
              ])
              if (!account) {
                throw new ErrorWithStatus({
                  message: ACCOUNT_MESSAGES.ACCOUNT_BY_TOKEN_NOT_FOUND,
                  status: HttpStatusCode.NotFound
                })
              }
              ;(req as Request).decodedVerifyEmailToken = decodedVerifyEmailToken
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HttpStatusCode.Unauthorized
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

// Gửi lại email xác thực tài khoản
export const resendEmailVerifyAccountValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decodedAuthorization as TokenPayload
  if (verify === AccountVerifyStatus.Verified) {
    next(
      new ErrorWithStatus({
        message: ACCOUNT_MESSAGES.ACCOUNT_VERIFIED_BEFORE,
        status: HttpStatusCode.BadRequest
      })
    )
  }
  next()
}

// Gửi yêu cầu quên mật khẩu
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value: string, { req }) => {
            const account = await databaseService.accounts.findOne({ email: value })
            if (!account) {
              throw new Error(ACCOUNT_MESSAGES.EMAIL_NOT_EXISTED)
            }
            ;(req as Request).account = account
            return true
          }
        }
      }
    },
    ['body']
  )
)

// Xác thực forgot password token
export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgotPasswordToken: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ACCOUNT_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.Unauthorized
              })
            }
            try {
              const [decodedForgotPasswordToken, account] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: ENV_CONFIG.JWT_FORGOT_PASSWORD_TOKEN_SECRET
                }),
                databaseService.accounts.findOne({ forgotPasswordToken: value })
              ])
              if (!account) {
                throw new ErrorWithStatus({
                  message: ACCOUNT_MESSAGES.ACCOUNT_BY_TOKEN_NOT_FOUND,
                  status: HttpStatusCode.NotFound
                })
              }
              ;(req as Request).decodedForgotPasswordToken = decodedForgotPasswordToken
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HttpStatusCode.Unauthorized
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)
