import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import WatchHistory from '~/models/schemas/WatchHistory.schema'
import databaseService from './database.services'

class WatchHistoryService {
  // Thêm một video vào lịch sử xem
  async createWatchHistory({ accountId, videoId }: { accountId: string; videoId: string }) {
    const watchHistory = await databaseService.watchHistories.findOne({
      accountId: new ObjectId(accountId),
      videoId: new ObjectId(videoId)
    })
    if (!watchHistory) {
      await databaseService.watchHistories.insertOne(
        new WatchHistory({
          accountId: new ObjectId(accountId),
          videoId: new ObjectId(videoId)
        })
      )
      return true
    }
    await databaseService.watchHistories.updateOne(
      {
        accountId: new ObjectId(accountId),
        videoId: new ObjectId(videoId)
      },
      {
        $currentDate: {
          updatedAt: true
        }
      }
    )
    return true
  }

  // Lấy lịch sử video đã xem
  async getWatchHistories({ query, accountId }: { query: PaginationReqQuery; accountId: string }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const [videos, totalRows] = await Promise.all([
      databaseService.watchHistories
        .aggregate([
          {
            $match: {
              accountId: new ObjectId(accountId)
            }
          },
          {
            $lookup: {
              from: 'videos',
              localField: 'videoId',
              foreignField: '_id',
              as: 'videoInfo'
            }
          },
          {
            $unwind: {
              path: '$videoInfo'
            }
          },
          {
            $replaceRoot: {
              newRoot: '$videoInfo'
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
              localField: 'thumbnail',
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
            $addFields: {
              thumbnail: {
                $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$thumbnail.name']
              },
              'author.avatar': {
                $cond: {
                  if: '$authorAvatar',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$authorAvatar.name']
                  },
                  else: ''
                }
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              thumbnail: {
                $first: '$thumbnail'
              },
              title: {
                $first: '$title'
              },
              viewCount: {
                $first: '$views'
              },
              author: {
                $first: '$author'
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
            $skip: skip
          },
          {
            $limit: _limit
          }
        ])
        .toArray(),
      await databaseService.watchHistories.countDocuments({ accountId: new ObjectId(accountId) })
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

const watchHistoryService = new WatchHistoryService()
export default watchHistoryService
