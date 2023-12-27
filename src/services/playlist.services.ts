import { ObjectId } from 'mongodb'

import { CreatePlaylistReqBody, UpdatePlaylistReqBody } from '~/models/requests/Playlist.requests'
import Playlist from '~/models/schemas/Playlist.schema'
import PlaylistVideo from '~/models/schemas/PlaylistVideo.schema'
import databaseService from './database.services'
import { ENV_CONFIG } from '~/constants/config'
import { PaginationReqQuery } from '~/models/requests/Common.requests'

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

  // Xóa video khỏi playlist
  async removeVideoFromPlaylist({ videoId, playlistId }: { videoId: string; playlistId: string }) {
    await databaseService.playlistVideos.deleteOne({
      videoId: new ObjectId(videoId),
      playlistId: new ObjectId(playlistId)
    })
    return true
  }

  // Lấy video từ playlist
  async getVideosFromPlaylist({ playlistId, query }: { playlistId: string; query: PaginationReqQuery }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const [videos, totalRows] = await Promise.all([
      databaseService.playlistVideos
        .aggregate([
          {
            $match: {
              playlistId: new ObjectId(playlistId)
            }
          },
          {
            $lookup: {
              from: 'videos',
              localField: 'videoId',
              foreignField: '_id',
              as: 'videos'
            }
          },
          {
            $unwind: {
              path: '$videos'
            }
          },
          {
            $addFields: {
              'videos.addedAt': '$createdAt'
            }
          },
          {
            $replaceRoot: {
              newRoot: '$videos'
            }
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'accountId',
              foreignField: '_id',
              as: 'author'
            }
          },
          {
            $unwind: {
              path: '$author'
            }
          },
          {
            $lookup: {
              from: 'images',
              localField: 'author.avatar',
              foreignField: '_id',
              as: 'authorAvatar'
            }
          },
          {
            $unwind: {
              path: '$authorAvatar',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'images',
              localField: 'thumbnail',
              foreignField: '_id',
              as: 'thumbnail'
            }
          },
          {
            $unwind: {
              path: '$thumbnail'
            }
          },
          {
            $addFields: {
              'author.avatar': {
                $cond: {
                  if: '$authorAvatar',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$authorAvatar.name']
                  },
                  else: ''
                }
              },
              thumbnail: {
                $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$thumbnail.name']
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              author: {
                $first: '$author'
              },
              title: {
                $first: '$title'
              },
              idName: {
                $first: '$idName'
              },
              thumbnail: {
                $first: '$thumbnail'
              },
              description: {
                $first: '$description'
              },
              viewCount: {
                $first: '$views'
              },
              addedAt: {
                $first: '$addedAt'
              },
              createdAt: {
                $first: '$createdAt'
              },
              updatedAt: {
                $first: '$updatedAt'
              }
            }
          },
          {
            $project: {
              'author.email': 0,
              'author.password': 0,
              'author.bio': 0,
              'author.cover': 0,
              'author.role': 0,
              'author.status': 0,
              'author.verify': 0,
              'author.forgotPasswordToken': 0,
              'author.verifyEmailToken': 0
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: _limit
          }
        ])
        .toArray(),
      databaseService.playlistVideos.countDocuments({ playlistId: new ObjectId(playlistId) })
    ])
    return {
      videos,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }
}

const playlistService = new PlaylistService()
export default playlistService
