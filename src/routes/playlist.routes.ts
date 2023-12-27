import { Router } from 'express'

import { createPlaylistController } from '~/controllers/playlist.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { createPlaylistValidator } from '~/middlewares/playlist.middlewares'

const playlistRouter = Router()

// Tạo playlist
playlistRouter.post(
  '/',
  accessTokenValidator,
  verifiedAccountValidator,
  createPlaylistValidator,
  wrapRequestHandler(createPlaylistController)
)

export default playlistRouter
