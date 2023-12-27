import { PlaylistAudience } from '~/constants/enum'

// Body: Tạo playlist
export type CreatePlaylistReqBody = {
  name: string
  description?: string
  audience?: PlaylistAudience
}
