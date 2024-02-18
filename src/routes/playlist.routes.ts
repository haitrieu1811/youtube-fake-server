import { Router } from 'express'

import {
  addVideoToPlaylistController,
  createPlaylistController,
  deletePlaylistController,
  getPlaylistByIdController,
  getPlaylistsOfMeController,
  getVideosFromPlaylistController,
  removeVideoFromPlaylistController,
  updatePlaylistController
} from '~/controllers/playlist.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { filterReqBodyMiddleware, paginationValidator } from '~/middlewares/common.middlewares'
import {
  authorOfPlaylistValidator,
  createPlaylistValidator,
  playlistIdValidator,
  updatePlaylistValidator,
  videoAlreadyInPlaylistValidator,
  videoNotAlreadyInPlaylistValidator
} from '~/middlewares/playlist.middlewares'
import { videoIdValidator } from '~/middlewares/video.middlewares'
import { UpdatePlaylistReqBody } from '~/models/requests/Playlist.requests'

const playlistRouter = Router()

// Create new playlist
playlistRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  createPlaylistValidator,
  wrapRequestHandler(createPlaylistController)
)

// Update a playlist
playlistRouter.patch(
  '/:playlistId',
  accessTokenValidator,
  verifiedAccountValidator,
  playlistIdValidator,
  authorOfPlaylistValidator,
  updatePlaylistValidator,
  filterReqBodyMiddleware<UpdatePlaylistReqBody>(['name', 'description', 'audience']),
  wrapRequestHandler(updatePlaylistController)
)

// Delete playlist
playlistRouter.delete(
  '/:playlistId',
  accessTokenValidator,
  verifiedAccountValidator,
  playlistIdValidator,
  authorOfPlaylistValidator,
  wrapRequestHandler(deletePlaylistController)
)

// Thêm video vào playlist
playlistRouter.post(
  '/:playlistId/add-to-playlist/video/:videoId',
  accessTokenValidator,
  verifiedAccountValidator,
  playlistIdValidator,
  videoIdValidator,
  authorOfPlaylistValidator,
  videoNotAlreadyInPlaylistValidator,
  wrapRequestHandler(addVideoToPlaylistController)
)

// Add video to playlist
playlistRouter.delete(
  '/:playlistId/remove-from-playlist/video/:videoId',
  accessTokenValidator,
  verifiedAccountValidator,
  playlistIdValidator,
  videoIdValidator,
  authorOfPlaylistValidator,
  videoAlreadyInPlaylistValidator,
  wrapRequestHandler(removeVideoFromPlaylistController)
)

// Get videos from playlist
playlistRouter.get(
  '/:playlistId/videos',
  playlistIdValidator,
  paginationValidator,
  wrapRequestHandler(getVideosFromPlaylistController)
)

// Get my playlists
playlistRouter.get(
  '/me',
  accessTokenValidator,
  verifiedAccountValidator,
  paginationValidator,
  wrapRequestHandler(getPlaylistsOfMeController)
)

// Get videos from playlist
playlistRouter.get('/:playlistId', playlistIdValidator, wrapRequestHandler(getPlaylistByIdController))

export default playlistRouter
