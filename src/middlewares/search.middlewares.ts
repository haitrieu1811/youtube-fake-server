import { checkSchema } from 'express-validator'
import { SEARCH_MESSAGES } from '~/constants/messages'

import { validate } from '~/lib/validation'

// Tìm kiếm
export const searchValidator = validate(
  checkSchema(
    {
      searchQuery: {
        trim: true,
        notEmpty: {
          errorMessage: SEARCH_MESSAGES.SEARCH_QUERY_IS_REQUIRED
        }
      }
    },
    ['query']
  )
)
