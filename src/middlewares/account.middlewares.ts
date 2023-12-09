import { checkSchema } from 'express-validator'

import { ACCOUNT_MESSAGES } from '~/constants/messages'
import { validate } from '~/lib/validation'
import databaseService from '~/services/database.services'

// Đăng ký tài khoản
export const registerAccountValidator = validate(
  checkSchema(
    {
      email: {
        trim: true,
        notEmpty: {
          errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: ACCOUNT_MESSAGES.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value: string) => {
            const email = await databaseService.accounts.findOne({ email: value })
            if (email) {
              throw new Error(ACCOUNT_MESSAGES.EMAIL_ALREADY_EXIST)
            }
            return true
          }
        }
      },
      password: {
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
      },
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
