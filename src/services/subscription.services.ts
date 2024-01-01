import { ObjectId } from 'mongodb'

import Subscription from '~/models/schemas/Subscription.schema'
import databaseService from './database.services'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import { ENV_CONFIG } from '~/constants/config'

class SubscriptionService {
  // Đăng ký kênh
  async subscribe({ fromAccountId, toAccountId }: { fromAccountId: string; toAccountId: string }) {
    await databaseService.subscriptions.insertOne(
      new Subscription({
        fromAccountId: new ObjectId(fromAccountId),
        toAccountId: new ObjectId(toAccountId)
      })
    )
    return true
  }

  // Hủy đăng ký kênh
  async unsubscribe({ fromAccountId, toAccountId }: { fromAccountId: string; toAccountId: string }) {
    await databaseService.subscriptions.deleteOne({
      fromAccountId: new ObjectId(fromAccountId),
      toAccountId: new ObjectId(toAccountId)
    })
    return true
  }

  // Lấy danh sách kênh tôi đã đăng ký
  async getChannelsSubscribedOfMe({ accountId, query }: { accountId: string; query: PaginationReqQuery }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const [channels, totalRows] = await Promise.all([
      databaseService.subscriptions
        .aggregate([
          {
            $match: {
              fromAccountId: new ObjectId(accountId)
            }
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'toAccountId',
              foreignField: '_id',
              as: 'account'
            }
          },
          {
            $unwind: {
              path: '$account'
            }
          },
          {
            $replaceRoot: {
              newRoot: '$account'
            }
          },
          {
            $lookup: {
              from: 'images',
              localField: 'avatar',
              foreignField: '_id',
              as: 'avatar'
            }
          },
          {
            $unwind: {
              path: '$avatar',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'subscriptions',
              localField: '_id',
              foreignField: 'toAccountId',
              as: 'subscriptions'
            }
          },
          {
            $addFields: {
              avatar: {
                $cond: {
                  if: '$avatar',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$avatar.name']
                  },
                  else: ''
                }
              },
              subscribeCount: {
                $size: '$subscriptions'
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              username: {
                $first: '$username'
              },
              channelName: {
                $first: '$channelName'
              },
              avatar: {
                $first: '$avatar'
              },
              tick: {
                $first: '$tick'
              },
              subscribeCount: {
                $first: '$subscribeCount'
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
            $skip: skip
          },
          {
            $limit: _limit
          }
        ])
        .toArray(),
      databaseService.subscriptions.countDocuments({
        fromAccountId: new ObjectId(accountId)
      })
    ])
    return {
      channels,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }

  // Lấy danh sách kênh đã đăng ký kênh của tôi
  async getChannelsSubscribedForMe({ accountId, query }: { accountId: string; query: PaginationReqQuery }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const [channels, totalRows] = await Promise.all([
      databaseService.subscriptions
        .aggregate([
          {
            $match: {
              toAccountId: new ObjectId(accountId)
            }
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'toAccountId',
              foreignField: '_id',
              as: 'account'
            }
          },
          {
            $unwind: {
              path: '$account'
            }
          },
          {
            $replaceRoot: {
              newRoot: '$account'
            }
          },
          {
            $lookup: {
              from: 'images',
              localField: 'avatar',
              foreignField: '_id',
              as: 'avatar'
            }
          },
          {
            $unwind: {
              path: '$avatar',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'subscriptions',
              localField: '_id',
              foreignField: 'toAccountId',
              as: 'subscriptions'
            }
          },
          {
            $addFields: {
              avatar: {
                $cond: {
                  if: '$avatar',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$avatar.name']
                  },
                  else: ''
                }
              },
              subscribeCount: {
                $size: '$subscriptions'
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              username: {
                $first: '$username'
              },
              channelName: {
                $first: '$channelName'
              },
              avatar: {
                $first: '$avatar'
              },
              tick: {
                $first: '$tick'
              },
              subscribeCount: {
                $first: '$subscribeCount'
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
            $skip: skip
          },
          {
            $limit: _limit
          }
        ])
        .toArray(),
      databaseService.subscriptions.countDocuments({
        fromAccountId: new ObjectId(accountId)
      })
    ])
    return {
      channels,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }
}

const subscriptionService = new SubscriptionService()
export default subscriptionService
