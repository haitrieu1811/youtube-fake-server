import { Router } from 'express'

import {
  addVideoToPlaylistController,
  createPlaylistController,
  deletePlaylistController,
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
  authorOfPlaylistValidator,
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

// Thêm video vào playlist
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

// Lấy danh sách video từ playlist
playlistRouter.get(
  '/:playlistId/videos',
  playlistIdValidator,
  paginationValidator,
  wrapRequestHandler(getVideosFromPlaylistController)
)

export default playlistRouter
