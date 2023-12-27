import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { PLAYLIST_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import { CreatePlaylistReqBody, PlaylistIdReqParams, UpdatePlaylistReqBody } from '~/models/requests/Playlist.requests'
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

// Cập nhật playlist
export const updatePlaylistController = async (
  req: Request<PlaylistIdReqParams, any, UpdatePlaylistReqBody>,
  res: Response
) => {
  const result = await playlistService.updatePlaylist({ body: req.body, playlistId: req.params.playlistId })
  return res.json({
    message: PLAYLIST_MESSAGES.UPDATE_PLAYLIST_SUCCEED,
    data: result
  })
}

// Xóa playlist
export const deletePlaylistController = async (req: Request<PlaylistIdReqParams>, res: Response) => {
  await playlistService.deletePlaylist(req.params.playlistId)
  return res.json({
    message: PLAYLIST_MESSAGES.DELETE_PLAYLIST_SUCCEED
  })
}
