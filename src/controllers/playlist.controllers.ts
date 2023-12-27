import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { PLAYLIST_MESSAGES } from '~/constants/messages'

import { TokenPayload } from '~/models/requests/Account.requests'
import { CreatePlaylistReqBody } from '~/models/requests/Playlist.requests'
import playlistService from '~/services/playlist.services'

// Tạo playlist
export const createPlaylistController = async (
  req: Request<ParamsDictionary, any, CreatePlaylistReqBody>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const result = await playlistService.createPlaylist({ body: req.body, accountId })
  return res.json({
    message: PLAYLIST_MESSAGES.CREATE_PLAYLIST_SUCCEED,
    data: result
  })
}
