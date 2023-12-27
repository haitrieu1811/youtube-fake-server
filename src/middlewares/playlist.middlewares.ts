import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId, WithId } from 'mongodb'

import { HttpStatusCode, PlaylistAudience } from '~/constants/enum'
import { PLAYLIST_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/lib/utils'
import { validate } from '~/lib/validation'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Account.requests'
import {
  AddVideoToPlaylistReqParams,
  PlaylistIdReqParams,
  RemoveVideoFromPlaylistReqParams
} from '~/models/requests/Playlist.requests'
import Playlist from '~/models/schemas/Playlist.schema'
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
          options: async (value: string) => {
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
            return true
          }
        }
      }
    },
    ['params']
  )
)

// Kiểm tra tác giả của playlist
export const authorOfPlaylistValidator = async (req: Request<PlaylistIdReqParams>, _: Response, next: NextFunction) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const { playlistId } = req.params
  const playlist = (await databaseService.playlists.findOne({ _id: new ObjectId(playlistId) })) as WithId<Playlist>
  if (playlist.accountId.toString() !== accountId) {
    return next(
      new ErrorWithStatus({
        message: PLAYLIST_MESSAGES.PLAYLIST_AUTHOR_IS_INVALID,
        status: HttpStatusCode.Forbidden
      })
    )
  }
  return next()
}

// Kiểm tra đã thêm video vào playlist trước đó hay chưa
export const videoNotAlreadyInPlaylistValidator = async (
  req: Request<AddVideoToPlaylistReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { videoId, playlistId } = req.params
  const playlistVideo = await databaseService.playlistVideos.findOne({
    videoId: new ObjectId(videoId),
    playlistId: new ObjectId(playlistId)
  })
  if (playlistVideo) {
    return next(
      new ErrorWithStatus({
        message: PLAYLIST_MESSAGES.VIDEO_ALREADY_IN_PLAYLIST,
        status: HttpStatusCode.BadRequest
      })
    )
  }
  return next()
}

// Kiểm tra video có nằm trong playlist hay chưa
export const videoAlreadyInPlaylistValidator = async (
  req: Request<RemoveVideoFromPlaylistReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { videoId, playlistId } = req.params
  const playlistVideo = await databaseService.playlistVideos.findOne({
    videoId: new ObjectId(videoId),
    playlistId: new ObjectId(playlistId)
  })
  if (!playlistVideo) {
    return next(
      new ErrorWithStatus({
        message: PLAYLIST_MESSAGES.VIDEO_NOT_ALREADY_IN_PLAYLIST,
        status: HttpStatusCode.BadRequest
      })
    )
  }
  return next()
}
