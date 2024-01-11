import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { SearchReqQuery } from '~/models/requests/Search.requests'
import databaseService from './database.services'
import { VideoAudience } from '~/constants/enum'

class SearchService {
  // Tìm kiếm
  async search(query: SearchReqQuery) {
    const { page, limit, searchQuery } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = {
      audience: VideoAudience.Everyone,
      $text: {
        $search: searchQuery
      }
    }
    const [videos, totalRows] = await Promise.all([
      databaseService.videos
        .aggregate([
          {
            $match: match
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
              thumbnailUrl: {
                $cond: {
                  if: '$thumbnail',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$thumbnail.name']
                  },
                  else: ''
                }
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
              idName: {
                $first: '$idName'
              },
              thumbnail: {
                $first: '$thumbnailUrl'
              },
              title: {
                $first: '$title'
              },
              description: {
                $first: '$description'
              },
              author: {
                $first: '$author'
              },
              viewCount: {
                $first: '$views'
              },
              isDraft: {
                $first: '$isDraft'
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
              'author.password': 0,
              'author.role': 0,
              'author.status': 0,
              'author.verify': 0,
              'author.forgotPasswordToken': 0,
              'author.verifyEmailToken': 0,
              'author.cover': 0,
              'author.bio': 0
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
      databaseService.videos.countDocuments(match)
    ])
    return {
      videos,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }

  // Tìm kiếm trong channel của mình
  async searchInMyChannel({ query, accountId }: { query: SearchReqQuery; accountId: string }) {
    const { page, limit, searchQuery } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = {
      accountId: new ObjectId(accountId),
      $text: {
        $search: searchQuery
      }
    }
    const [videos, totalRows] = await Promise.all([
      databaseService.videos
        .aggregate([
          {
            $match: match
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
              thumbnailUrl: {
                $cond: {
                  if: '$thumbnail',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$thumbnail.name']
                  },
                  else: ''
                }
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
              idName: {
                $first: '$idName'
              },
              thumbnail: {
                $first: '$thumbnailUrl'
              },
              title: {
                $first: '$title'
              },
              author: {
                $first: '$author'
              },
              viewCount: {
                $first: '$views'
              },
              isDraft: {
                $first: '$isDraft'
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
              'author.password': 0,
              'author.role': 0,
              'author.status': 0,
              'author.verify': 0,
              'author.forgotPasswordToken': 0,
              'author.verifyEmailToken': 0,
              'author.cover': 0,
              'author.bio': 0
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
      databaseService.videos.countDocuments(match)
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

const searchService = new SearchService()
export default searchService
