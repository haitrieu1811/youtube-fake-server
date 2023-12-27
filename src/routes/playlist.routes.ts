import { Router } from 'express'

import {
  addVideoToPlaylistController,
  createPlaylistController,
  deletePlaylistController,
  removeVideoFromPlaylistController,
  updatePlaylistController
} from '~/controllers/playlist.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { filterReqBodyMiddleware } from '~/middlewares/common.middlewares'
import {
  createPlaylistValidator,
  playlistIdValidator,
  updatePlaylistValidator,
  videoAlreadyInPlaylistValidator,
  videoNotAlreadyInPlaylistValidator
} from '~/middlewares/playlist.middlewares'
import { videoIdValidator } from '~/middlewares/video.middlewares'
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

// Xóa playlist
playlistRouter.delete(
  '/:playlistId',
  accessTokenValidator,
  verifiedAccountValidator,
  playlistIdValidator,
  wrapRequestHandler(deletePlaylistController)
)

// Thêm video vào playlist
playlistRouter.post(
  '/:playlistId/add-to-playlist/video/:videoId',
  accessTokenValidator,
  verifiedAccountValidator,
  playlistIdValidator,
  videoIdValidator,
  videoNotAlreadyInPlaylistValidator,
  wrapRequestHandler(addVideoToPlaylistController)
)

// Thêm video vào playlist
playlistRouter.delete(
  '/:playlistId/remove-from-playlist/video/:videoId',
  accessTokenValidator,
  verifiedAccountValidator,
  playlistIdValidator,
  videoIdValidator,
  videoAlreadyInPlaylistValidator,
  wrapRequestHandler(removeVideoFromPlaylistController)
)

export default playlistRouter
