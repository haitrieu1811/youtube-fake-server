import { Router } from 'express'

import { createPlaylistController, updatePlaylistController } from '~/controllers/playlist.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares'
import {
  createPlaylistValidator,
  playlistIdValidator,
  updatePlaylistValidator
} from '~/middlewares/playlist.middlewares'
import { UpdatePlaylistReqBody } from '~/models/requests/Playlist.requests'

const playlistRouter = Router()

// Tạo playlist
playlistRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  createPlaylistValidator,
  wrapRequestHandler(createPlaylistController)
)

// Cập nhật playlist
playlistRouter.patch(
  '/:playlistId',
  accessTokenValidator,
  verifiedAccountValidator,
  playlistIdValidator,
  updatePlaylistValidator,
  filterReqBodyMiddleware<UpdatePlaylistReqBody>(['name', 'description', 'audience']),
  wrapRequestHandler(updatePlaylistController)
)

export default playlistRouter
