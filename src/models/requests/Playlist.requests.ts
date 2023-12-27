import { ParamsDictionary } from 'express-serve-static-core'

import { PlaylistAudience } from '~/constants/enum'

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
