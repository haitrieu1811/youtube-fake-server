import { Request } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'

import { ACCOUNT_MESSAGES } from '~/constants/messages'
import { hashPassword } from '~/lib/crypto'
import { validate } from '~/lib/validation'
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
export const registerAccountValidator = validate(
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
