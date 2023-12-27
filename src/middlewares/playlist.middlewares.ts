import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { HttpStatusCode, PlaylistAudience } from '~/constants/enum'
import { PLAYLIST_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/lib/utils'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import { PlaylistIdReqParams } from '~/models/requests/Playlist.requests'
import databaseService from '~/services/database.services'

const playlistAudiences = numberEnumToArray(PlaylistAudience)

const nameSchema: ParamSchema = {
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
}

const descriptionSchema: ParamSchema = {
  optional: true,
  trim: true
}

const audienceSchema: ParamSchema = {
  optional: true,
  isIn: {
    options: [playlistAudiences],
    errorMessage: PLAYLIST_MESSAGES.AUDIENCE_IS_INVALID
  }
}

// Tạo playlist
export const createPlaylistValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      description: descriptionSchema,
      audience: audienceSchema
    },
    ['body']
  )
)

// Cập nhật playlist
export const updatePlaylistValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      description: descriptionSchema,
      audience: audienceSchema
    },
    ['body']
  )
)

// Playlist id validator
export const playlistIdValidator = validate(
  checkSchema(
    {
      playlistId: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: PLAYLIST_MESSAGES.PLAYLIST_ID_IS_REQUIRED,
                status: HttpStatusCode.BadRequest
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: PLAYLIST_MESSAGES.PLAYLIST_ID_IS_INVALID,
                status: HttpStatusCode.BadRequest
              })
            }
            const playlist = await databaseService.playlists.findOne({ _id: new ObjectId(value) })
            if (!playlist) {
              throw new ErrorWithStatus({
                message: PLAYLIST_MESSAGES.PLAYLIST_NOT_FOUND,
                status: HttpStatusCode.NotFound
              })
            }
            const { accountId } = (req as Request).decodedAuthorization as TokenPayload
            if (playlist.accountId.toString() !== accountId) {
              throw new ErrorWithStatus({
                message: PLAYLIST_MESSAGES.PLAYLIST_AUTHOR_IS_INVALID,
                status: HttpStatusCode.Forbidden
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
