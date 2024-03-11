import { ObjectId } from 'mongodb'

import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from './database.services'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import { ENV_CONFIG } from '~/constants/config'

class BookmarkService {
  // Add a bookmark video
  async createBookmark({ accountId, videoId }: { accountId: string; videoId: string }) {
    const { insertedId } = await databaseService.bookmarks.insertOne(
      new Bookmark({
        accountId: new ObjectId(accountId),
        videoId: new ObjectId(videoId)
      })
    )
    const bookmark = await databaseService.bookmarks.findOne({ _id: insertedId })
    return {
      bookmark
    }
  }

  // Delete an bookmark video
  async deleteBookmark(bookmarkId: string) {
    await databaseService.bookmarks.deleteOne({ _id: new ObjectId(bookmarkId) })
    return true
  }

  // Get bookmark videos
  async getBookmarkVideos({ accountId, query }: { accountId: string; query: PaginationReqQuery }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = { accountId: new ObjectId(accountId) }
    const [videos, totalRows] = await Promise.all([
      databaseService.bookmarks
        .aggregate([
          {
            $match: match
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
              path: '$videoInfo',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              'videoInfo.bookmarkId': '$_id',
              'videoInfo.addedAt': '$createdAt'
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
              },
              playlistId: ''
            }
          },
          {
            $group: {
              _id: '$_id',
              bookmarkId: {
                $first: '$bookmarkId'
              },
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
      databaseService.bookmarks.countDocuments(match)
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

const bookmarkService = new BookmarkService()
export default bookmarkService
