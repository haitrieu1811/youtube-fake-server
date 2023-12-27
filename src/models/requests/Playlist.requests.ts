import { ParamsDictionary, Query } from 'express-serve-static-core'

import { PlaylistAudience } from '~/constants/enum'
import { PaginationReqQuery } from './Common.requests'

// Body: Tạo playlist
export type CreatePlaylistReqBody = {
  name: string
  description?: string
  audience?: PlaylistAudience
}

// Body: Cập nhật playlist
export type UpdatePlaylistReqBody = {
  name?: string
  description?: string
  audience?: PlaylistAudience
}

// Params: Playlist id
export type PlaylistIdReqParams = ParamsDictionary & {
  playlistId: string
}

// Params: Thêm video vào playlist
export type AddVideoToPlaylistReqParams = ParamsDictionary & {
  videoId: string
  playlistId: string
}

// Params: Xóa video khỏi playlist
export type RemoveVideoFromPlaylistReqParams = ParamsDictionary & {
  videoId: string
  playlistId: string
}
