import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { PLAYLIST_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.requests'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import {
  AddVideoToPlaylistReqParams,
  CreatePlaylistReqBody,
  PlaylistIdReqParams,
  RemoveVideoFromPlaylistReqParams,
  UpdatePlaylistReqBody
} from '~/models/requests/Playlist.requests'
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

// Thêm video vào playlist
export const addVideoToPlaylistController = async (req: Request<AddVideoToPlaylistReqParams>, res: Response) => {
  const { videoId, playlistId } = req.params
  const result = await playlistService.addVideoToPlaylist({ videoId, playlistId })
  return res.json({
    message: PLAYLIST_MESSAGES.ADD_VIDEO_TO_PLAYLIST_SUCCEED,
    data: result
  })
}

// Xóa video khỏi playlist
export const removeVideoFromPlaylistController = async (
  req: Request<RemoveVideoFromPlaylistReqParams>,
  res: Response
) => {
  const { videoId, playlistId } = req.params
  await playlistService.removeVideoFromPlaylist({ videoId, playlistId })
  return res.json({
    message: PLAYLIST_MESSAGES.REMOVE_VIDEO_FROM_PLAYLIST_SUCCEED
  })
}

// Lấy danh sách video của playlist
export const getVideosFromPlaylistController = async (
  req: Request<PlaylistIdReqParams, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { videos, ...pagination } = await playlistService.getVideosFromPlaylist({
    playlistId: req.params.playlistId,
    query: req.query
  })
  return res.json({
    message: PLAYLIST_MESSAGES.GET_VIDEOS_FROM_PLAYLIST_SUCCEED,
    data: {
      videos,
      pagination
    }
  })
}

// Lấy danh sách playlist của tôi
export const getPlaylistsOfMeController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const { playlists, ...pagination } = await playlistService.getPlaylistsOfMe({
    accountId,
    query: req.query
  })
  return res.json({
    message: PLAYLIST_MESSAGES.GET_PLAYLISTS_SUCCEED,
    data: {
      playlists,
      pagination
    }
  })
}
