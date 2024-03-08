import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { PlaylistAudience } from '~/constants/enum'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import { CreatePlaylistReqBody, UpdatePlaylistReqBody } from '~/models/requests/Playlist.requests'
import Playlist from '~/models/schemas/Playlist.schema'
import PlaylistVideo from '~/models/schemas/PlaylistVideo.schema'
import databaseService from './database.services'

class PlaylistService {
  // Create new playlist
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

  // Update playlist
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

  // Delete playlist
  async deletePlaylist(playlistId: string) {
    await Promise.all([
      databaseService.playlists.deleteOne({ _id: new ObjectId(playlistId) }),
      databaseService.playlistVideos.deleteMany({ playlistId: new ObjectId(playlistId) })
    ])
    return true
  }

  // Add video to playlist
  async addVideoToPlaylist({
    videoId,
    playlistId,
    accountId
  }: {
    videoId: string
    playlistId: string
    accountId: string
  }) {
    const { insertedId } = await databaseService.playlistVideos.insertOne(
      new PlaylistVideo({
        videoId: new ObjectId(videoId),
        playlistId: new ObjectId(playlistId),
        accountId: new ObjectId(accountId)
      })
    )
    const newPlaylistVideo = await databaseService.playlistVideos.findOne({ _id: insertedId })
    return {
      playlistVideo: newPlaylistVideo
    }
  }

  // Remove video from playlist
  async removeVideoFromPlaylist({ videoId, playlistId }: { videoId: string; playlistId: string }) {
    await databaseService.playlistVideos.deleteOne({
      videoId: new ObjectId(videoId),
      playlistId: new ObjectId(playlistId)
    })
    return true
  }

  // Get videos from playlist
  async getVideosFromPlaylist({ playlistId, query }: { playlistId: string; query: PaginationReqQuery }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const [videos, totalRows, playlist] = await Promise.all([
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
              'videos.addedAt': '$createdAt',
              'videos.playlistId': '$playlistId'
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
              playlistId: {
                $first: '$playlistId'
              },
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
      databaseService.playlistVideos.countDocuments({ playlistId: new ObjectId(playlistId) }),
      databaseService.playlists.findOne({ _id: new ObjectId(playlistId) })
    ])
    return {
      videos,
      playlistName: playlist?.name,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }

  private async getPlaylists({
    match,
    sort = {
      createdAt: -1
    },
    skip = 0,
    limit = 20
  }: {
    match: any
    sort?: any
    skip?: number
    limit?: number
  }) {
    const playlists = await databaseService.playlists
      .aggregate([
        {
          $match: match
        },
        {
          $lookup: {
            from: 'playlistVideos',
            localField: '_id',
            foreignField: 'playlistId',
            as: 'videos'
          }
        },
        {
          $lookup: {
            from: 'videos',
            localField: 'videos.videoId',
            foreignField: '_id',
            as: 'videos'
          }
        },
        {
          $addFields: {
            videoCount: {
              $size: '$videos'
            },
            thumbnailObj: {
              $cond: {
                if: {
                  $size: '$videos'
                },
                then: {
                  $first: '$videos'
                },
                else: ''
              }
            }
          }
        },
        {
          $lookup: {
            from: 'images',
            localField: 'thumbnailObj.thumbnail',
            foreignField: '_id',
            as: 'thumbnail'
          }
        },
        {
          $unwind: {
            path: '$thumbnail',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            thumbnail: {
              $cond: {
                if: '$thumbnail',
                then: {
                  $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$thumbnail.name']
                },
                else: ''
              }
            },
            firstVideoIdName: {
              $cond: {
                if: {
                  $size: '$videos'
                },
                then: {
                  $first: '$videos.idName'
                },
                else: ''
              }
            }
          }
        },
        {
          $group: {
            _id: '$_id',
            firstVideoIdName: {
              $first: '$firstVideoIdName'
            },
            name: {
              $first: '$name'
            },
            thumbnail: {
              $first: '$thumbnail'
            },
            description: {
              $first: '$description'
            },
            audience: {
              $first: '$audience'
            },
            videoCount: {
              $first: '$videoCount'
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
          $sort: sort
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    return playlists
  }

  // Get my playlists
  async getPlaylistsOfMe({ accountId, query }: { accountId: string; query: PaginationReqQuery }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = { accountId: new ObjectId(accountId) }
    const [playlists, totalRows] = await Promise.all([
      this.getPlaylists({ match, skip, limit: _limit }),
      databaseService.playlists.countDocuments(match)
    ])
    return {
      playlists,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }

  // Get playlist by id
  async getPlaylistById(playlistId: string) {
    const playlist = await databaseService.playlists.findOne(
      { _id: new ObjectId(playlistId) },
      { projection: { accountId: 0 } }
    )
    return {
      playlist
    }
  }

  // Get playlists by username
  async getPlaylistsByUsername({ username, query }: { username: string; query: PaginationReqQuery }) {
    const account = await databaseService.accounts.findOne({ username })
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = { accountId: account?._id, audience: PlaylistAudience.Everyone }
    const [playlists, totalRows] = await Promise.all([
      this.getPlaylists({ match, skip, limit: _limit }),
      databaseService.playlists.countDocuments(match)
    ])
    return {
      playlists,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }

  // Get playlists containing video
  async getPlaylistsContainingVideo({ videoId, accountId }: { videoId: string; accountId: string }) {
    const playlists = await databaseService.playlistVideos
      .find({ videoId: new ObjectId(videoId), accountId: new ObjectId(accountId) })
      .toArray()
    const playlistsConfig = playlists.map((playlist) => playlist.playlistId)
    return {
      playlists: playlistsConfig
    }
  }
}

const playlistService = new PlaylistService()
export default playlistService
