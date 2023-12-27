import { checkSchema } from 'express-validator'

import { PlaylistAudience } from '~/constants/enum'
import { PLAYLIST_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/lib/utils'
import { validate } from '~/lib/validation'

const playlistAudiences = numberEnumToArray(PlaylistAudience)

// Tạo playlist
export const createPlaylistValidator = validate(
  checkSchema(
    {
      name: {
        trim: true,
        notEmpty: {
          errorMessage: PLAYLIST_MESSAGES.NAME_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 6,
            max: 255
          },
          errorMessage: PLAYLIST_MESSAGES.NAME_LENGTH_IS_INVALID
        }
      },
      description: {
        optional: true,
        trim: true
      },
      audience: {
        optional: true,
        isIn: {
          options: [playlistAudiences],
          errorMessage: PLAYLIST_MESSAGES.AUDIENCE_IS_INVALID
        }
      }
    },
    ['body']
  )
)
