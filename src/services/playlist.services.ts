import { ObjectId } from 'mongodb'

import { CreatePlaylistReqBody } from '~/models/requests/Playlist.requests'
import Playlist from '~/models/schemas/Playlist.schema'
import databaseService from './database.services'

class PlaylistService {
  // Tạo playlist
  async createPlaylist({ body, accountId }: { body: CreatePlaylistReqBody; accountId: string }) {
    const { name, description, audience } = body
    const { insertedId } = await databaseService.playlists.insertOne(
      new Playlist({
        name,
        description,
        audience,
        accountId: new ObjectId(accountId)
      })
    )
    const newPlaylist = await databaseService.playlists.findOne({ _id: insertedId })
    return {
      playlist: newPlaylist
    }
  }
}

const playlistService = new PlaylistService()
export default playlistService
