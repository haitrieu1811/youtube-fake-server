import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { ObjectId, WithId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { ReactionContentType, ReactionType, VideoAudience, VideoStatus } from '~/constants/enum'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import {
  CreateVideoCategoryReqBody,
  CreateVideoReqBody,
  GetSuggestedVideosReqQuery,
  GetVideosByUsernameReqQuery,
  GetVideosOfMeReqQuery,
  UpdateVideoCategoryReqBody,
  UpdateVideoReqBody
} from '~/models/requests/Video.requests'
import Video from '~/models/schemas/Video.schema'
import VideoCategory from '~/models/schemas/VideoCategory.schema'
import databaseService from './database.services'

class VideoService {
  // Tạo danh mục video
  async createVideoCategory({ body, accountId }: { body: CreateVideoCategoryReqBody; accountId: string }) {
    const { insertedId } = await databaseService.videoCategories.insertOne(
      new VideoCategory({
        accountId: new ObjectId(accountId),
        name: body.name,
        description: body.description
      })
    )
    const videoCategory = (await databaseService.videoCategories.findOne({ _id: insertedId })) as WithId<VideoCategory>
    return {
      videoCategory
    }
  }

  // Cập nhật danh mục video
  async updateVideoCategory({ body, videoCategoryId }: { body: UpdateVideoCategoryReqBody; videoCategoryId: string }) {
    const _body = omitBy(body, isUndefined)
    const updatedVideoCategory = await databaseService.videoCategories.findOneAndUpdate(
      {
        _id: new ObjectId(videoCategoryId)
      },
      {
        $set: _body,
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      videoCategory: updatedVideoCategory
    }
  }

  // Xóa danh mục video
  async deleteVideoCategory(videoCategoryId: string) {
    await databaseService.videoCategories.deleteOne({ _id: new ObjectId(videoCategoryId) })
    return true
  }

  // Lấy danh sách danh mục video
  async getVideoCategories(query: PaginationReqQuery) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const [categories, totalRows] = await Promise.all([
      databaseService.videoCategories
        .find({}, { projection: { accountId: 0 } })
        .skip(skip)
        .limit(_limit)
        .toArray(),
      databaseService.videoCategories.countDocuments({})
    ])
    return {
      categories,
      page: _page,
      limit: _limit,
      totalRows,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }

  // Tạo video mới
  async createVideo({ body, accountId }: { body: CreateVideoReqBody; accountId: string }) {
    const { insertedId } = await databaseService.videos.insertOne(
      new Video({
        ...body,
        accountId: new ObjectId(accountId)
      })
    )
    const newVideo = await databaseService.videos.findOne({ _id: insertedId })
    return {
      video: newVideo
    }
  }

  // Cập nhật video
  async updateVideo({ body, videoId }: { body: UpdateVideoReqBody; videoId: string }) {
    const { thumbnail, category } = body
    const bodyConfig = omitBy(
      {
        ...body,
        thumbnail: thumbnail ? new ObjectId(thumbnail) : undefined,
        category: category ? new ObjectId(category) : undefined
      },
      isUndefined
    )
    const updatedVideo = await databaseService.videos.findOneAndUpdate(
      {
        _id: new ObjectId(videoId)
      },
      {
        $set: bodyConfig,
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      video: updatedVideo
    }
  }

  // Xóa video
  async deleteVideos(videoIds: string[]) {
    const { deletedCount } = await databaseService.videos.deleteMany({
      _id: {
        $in: videoIds.map((videoId) => new ObjectId(videoId))
      }
    })
    return {
      deletedCount
    }
  }

  // Lấy danh sách video đề xuất
  async getSuggestedVideos(query: GetSuggestedVideosReqQuery) {
    const { page, limit, category } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = omitBy(
      {
        audience: VideoAudience.Everyone,
        category: category ? new ObjectId(category) : undefined,
        status: VideoStatus.Active
      },
      isUndefined
    )
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
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'contentId',
              as: 'comments'
            }
          },
          {
            $lookup: {
              from: 'reactions',
              localField: '_id',
              foreignField: 'contentId',
              as: 'reactions'
            }
          },
          {
            $lookup: {
              from: 'videoCategories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              likes: {
                $filter: {
                  input: '$reactions',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', ReactionType.Like]
                  }
                }
              },
              dislikes: {
                $filter: {
                  input: '$reactions',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', ReactionType.Dislike]
                  }
                }
              },
              category: {
                $cond: {
                  if: '$category',
                  then: '$category',
                  else: null
                }
              }
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
              'author.avatar': {
                $cond: {
                  if: '$authorAvatar',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$authorAvatar.name']
                  },
                  else: ''
                }
              },
              commentCount: {
                $size: '$comments'
              },
              likeCount: {
                $size: '$likes'
              },
              dislikeCount: {
                $size: '$dislikes'
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
                $first: '$thumbnail'
              },
              title: {
                $first: '$title'
              },
              author: {
                $first: '$author'
              },
              audience: {
                $first: '$audience'
              },
              category: {
                $first: '$category'
              },
              viewCount: {
                $first: '$views'
              },
              commentCount: {
                $first: '$commentCount'
              },
              likeCount: {
                $first: '$likeCount'
              },
              dislikeCount: {
                $first: '$dislikeCount'
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
              'author.bio': 0,
              'category.accountId': 0
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

  // Lấy danh sách video của tài khoản đăng nhập
  async getVideosOfMe({ accountId, query }: { accountId: string; query: GetVideosOfMeReqQuery }) {
    const { page, limit, sortBy, orderBy } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = { accountId: new ObjectId(accountId) }
    const sort = {
      [sortBy ? sortBy : 'createdAt']: orderBy ? (orderBy === 'asc' ? 1 : -1) : -1
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
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'contentId',
              as: 'comments'
            }
          },
          {
            $lookup: {
              from: 'reactions',
              localField: '_id',
              foreignField: 'contentId',
              as: 'reactions'
            }
          },
          {
            $lookup: {
              from: 'videoCategories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              likes: {
                $filter: {
                  input: '$reactions',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', ReactionType.Like]
                  }
                }
              },
              dislikes: {
                $filter: {
                  input: '$reactions',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', ReactionType.Dislike]
                  }
                }
              },
              category: {
                $cond: {
                  if: '$category',
                  then: '$category',
                  else: null
                }
              }
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
              'author.avatar': {
                $cond: {
                  if: '$authorAvatar',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$authorAvatar.name']
                  },
                  else: ''
                }
              },
              commentCount: {
                $size: '$comments'
              },
              likeCount: {
                $size: '$likes'
              },
              dislikeCount: {
                $size: '$dislikes'
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
                $first: '$thumbnail'
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
              audience: {
                $first: '$audience'
              },
              category: {
                $first: '$category'
              },
              viewCount: {
                $first: '$views'
              },
              commentCount: {
                $first: '$commentCount'
              },
              likeCount: {
                $first: '$likeCount'
              },
              dislikeCount: {
                $first: '$dislikeCount'
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
              'author.bio': 0,
              'category.accountId': 0
            }
          },
          {
            $sort: sort
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

  // Lấy danh sách video của tài khoản đăng nhập
  async getVideosByUsername({ username, query }: { username: string; query: GetVideosByUsernameReqQuery }) {
    const { page, limit, sortBy, orderBy } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const account = await databaseService.accounts.findOne({ username })
    const match = {
      accountId: new ObjectId(account?._id),
      audience: VideoAudience.Everyone
    }
    const sort = {
      [sortBy ? sortBy : 'createdAt']: orderBy ? (orderBy === 'asc' ? 1 : -1) : -1
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
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'contentId',
              as: 'comments'
            }
          },
          {
            $lookup: {
              from: 'reactions',
              localField: '_id',
              foreignField: 'contentId',
              as: 'reactions'
            }
          },
          {
            $lookup: {
              from: 'videoCategories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              likes: {
                $filter: {
                  input: '$reactions',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', ReactionType.Like]
                  }
                }
              },
              dislikes: {
                $filter: {
                  input: '$reactions',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', ReactionType.Dislike]
                  }
                }
              },
              category: {
                $cond: {
                  if: '$category',
                  then: '$category',
                  else: null
                }
              }
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
              'author.avatar': {
                $cond: {
                  if: '$authorAvatar',
                  then: {
                    $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$authorAvatar.name']
                  },
                  else: ''
                }
              },
              commentCount: {
                $size: '$comments'
              },
              likeCount: {
                $size: '$likes'
              },
              dislikeCount: {
                $size: '$dislikes'
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
                $first: '$thumbnail'
              },
              title: {
                $first: '$title'
              },
              author: {
                $first: '$author'
              },
              isDraft: {
                $first: '$isDraft'
              },
              audience: {
                $first: '$audience'
              },
              category: {
                $first: '$category'
              },
              viewCount: {
                $first: '$views'
              },
              commentCount: {
                $first: '$commentCount'
              },
              likeCount: {
                $first: '$likeCount'
              },
              dislikeCount: {
                $first: '$dislikeCount'
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
              'author.bio': 0,
              'category.accountId': 0
            }
          },
          {
            $sort: sort
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

  // Xem video
  async watchVideo({ idName, accountId }: { idName: string; accountId?: string }) {
    const [videos] = await Promise.all([
      databaseService.videos
        .aggregate([
          {
            $match: {
              idName
            }
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'accountId',
              foreignField: '_id',
              as: 'channel'
            }
          },
          {
            $unwind: {
              path: '$channel'
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
              from: 'videoCategories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'reactions',
              localField: '_id',
              foreignField: 'contentId',
              as: 'reactions'
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
              reactionOfMe: {
                $filter: {
                  input: '$reactions',
                  as: 'reaction',
                  cond: {
                    $eq: ['$$reaction.accountId', new ObjectId(accountId)]
                  }
                }
              },
              likes: {
                $cond: {
                  if: '$reactions',
                  then: {
                    $filter: {
                      input: '$reactions',
                      as: 'item',
                      cond: {
                        $eq: ['$$item.type', ReactionType.Like]
                      }
                    }
                  },
                  else: []
                }
              },
              dislikes: {
                $cond: {
                  if: '$reactions',
                  then: {
                    $filter: {
                      input: '$reactions',
                      as: 'item',
                      cond: {
                        $eq: ['$$item.type', ReactionType.Dislike]
                      }
                    }
                  },
                  else: []
                }
              }
            }
          },
          {
            $unwind: {
              path: '$reactionOfMe',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              isLiked: {
                $cond: {
                  if: {
                    $eq: ['$reactionOfMe.type', ReactionType.Like]
                  },
                  then: true,
                  else: false
                }
              },
              isDisliked: {
                $cond: {
                  if: {
                    $eq: ['$reactionOfMe.type', ReactionType.Dislike]
                  },
                  then: true,
                  else: false
                }
              },
              likeCount: {
                $size: '$likes'
              },
              dislikeCount: {
                $size: '$dislikes'
              }
            }
          },
          {
            $lookup: {
              from: 'subscriptions',
              localField: 'accountId',
              foreignField: 'toAccountId',
              as: 'subscriptions'
            }
          },
          {
            $addFields: {
              subscribeCount: {
                $size: '$subscriptions'
              },
              subscriptions: {
                $filter: {
                  input: '$subscriptions',
                  as: 'subscription',
                  cond: {
                    $eq: ['$$subscription.fromAccountId', new ObjectId(accountId)]
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'images',
              localField: 'channel.avatar',
              foreignField: '_id',
              as: 'channelAvatar'
            }
          },
          {
            $unwind: {
              path: '$channelAvatar',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              'channel.isSubscribed': {
                $cond: {
                  if: {
                    $size: '$subscriptions'
                  },
                  then: true,
                  else: false
                }
              },
              'channel.avatar': {
                $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$channelAvatar.name']
              },
              'channel.subscribeCount': '$subscribeCount'
            }
          },
          {
            $group: {
              _id: '$_id',
              idName: {
                $first: '$idName'
              },
              title: {
                $first: '$title'
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
              likeCount: {
                $first: '$likeCount'
              },
              dislikeCount: {
                $first: '$dislikeCount'
              },
              isLiked: {
                $first: '$isLiked'
              },
              isDisliked: {
                $first: '$isDisliked'
              },
              channel: {
                $first: '$channel'
              },
              category: {
                $first: '$category'
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
              'channel.email': 0,
              'channel.password': 0,
              'channel.bio': 0,
              'channel.cover': 0,
              'channel.role': 0,
              'channel.status': 0,
              'channel.verify': 0,
              'channel.forgotPasswordToken': 0,
              'channel.verifyEmailToken': 0,
              'channel.createdAt': 0,
              'channel.updatedAt': 0,
              'category.accountId': 0
            }
          }
        ])
        .toArray(),
      databaseService.videos.updateOne(
        {
          idName
        },
        {
          $inc: {
            views: 1
          }
        }
      )
    ])
    return {
      video: videos[0]
    }
  }

  // Lấy video để cập nhật
  async getVideoDetailToUpdate(videoId: string) {
    const video = await databaseService.videos
      .aggregate([
        {
          $match: {
            _id: new ObjectId(videoId)
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
            from: 'videoCategories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
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
              $first: '$thumbnail'
            },
            title: {
              $first: '$title'
            },
            description: {
              $first: '$description'
            },
            viewCount: {
              $first: '$views'
            },
            audience: {
              $first: '$audience'
            },
            category: {
              $first: '$category'
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
            'category.accountId': 0
          }
        }
      ])
      .toArray()
    return {
      video: video[0]
    }
  }

  // Lấy danh sách video đã thích
  async getLikedVideos({ query, accountId }: { query: PaginationReqQuery; accountId: string }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = {
      contentType: ReactionContentType.Video,
      type: ReactionType.Like,
      accountId: new ObjectId(accountId)
    }
    const [videos, totalRowsArr] = await Promise.all([
      databaseService.reactions
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'videos',
              localField: 'contentId',
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
              'videos.likedAt': '$createdAt'
            }
          },
          {
            $replaceRoot: {
              newRoot: '$videos'
            }
          },
          {
            $match: {
              audience: VideoAudience.Everyone
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
              from: 'videoCategories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: {
              path: '$category',
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
              author: {
                $first: '$author'
              },
              thumbnail: {
                $first: '$thumbnail'
              },
              title: {
                $first: '$title'
              },
              description: {
                $first: '$description'
              },
              category: {
                $first: '$category'
              },
              viewCount: {
                $first: '$views'
              },
              likedAt: {
                $first: '$likedAt'
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
              'author.verifyEmailToken': 0,
              'category.accountId': 0
            }
          },
          {
            $sort: {
              likedAt: -1
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
      databaseService.reactions
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'videos',
              localField: 'contentId',
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
              'videos.likedAt': '$createdAt'
            }
          },
          {
            $replaceRoot: {
              newRoot: '$videos'
            }
          },
          {
            $match: {
              audience: VideoAudience.Everyone
            }
          },
          {
            $count: 'totalRows'
          }
        ])
        .toArray()
    ])
    const totalRows = totalRowsArr[0]?.totalRows || 0
    return {
      videos,
      page: _page,
      limit: _limit,
      totalRows: totalRows as number,
      totalPages: Math.ceil(totalRows / _limit)
    }
  }
}

const videoService = new VideoService()
export default videoService
