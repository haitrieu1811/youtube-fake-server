import { ObjectId } from 'mongodb'

import { CreatePlaylistReqBody, UpdatePlaylistReqBody } from '~/models/requests/Playlist.requests'
import Playlist from '~/models/schemas/Playlist.schema'
import databaseService from './database.services'
import PlaylistVideo from '~/models/schemas/PlaylistVideo.schema'

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

  // Cập nhật playlist
  async updatePlaylist({ body, playlistId }: { body: UpdatePlaylistReqBody; playlistId: string }) {
    const updatedPlaylist = await databaseService.playlists.findOneAndUpdate(
      {
        _id: new ObjectId(playlistId)
      },
      {
        $set: body,
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      playlist: updatedPlaylist
    }
  }

  // Xóa playlist
  async deletePlaylist(playlistId: string) {
    await databaseService.playlists.deleteOne({ _id: new ObjectId(playlistId) })
    return true
  }

  // Thêm video vào playlist
  async addVideoToPlaylist({ videoId, playlistId }: { videoId: string; playlistId: string }) {
    const { insertedId } = await databaseService.playlistVideos.insertOne(
      new PlaylistVideo({
        videoId: new ObjectId(videoId),
        playlistId: new ObjectId(playlistId)
      })
    )
    const newPlaylistVideo = await databaseService.playlistVideos.findOne({ _id: insertedId })
    return {
      playlistVideo: newPlaylistVideo
    }
  }
}

const playlistService = new PlaylistService()
export default playlistService
