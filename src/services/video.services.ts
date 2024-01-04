import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { ObjectId, WithId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { ReactionType, VideoAudience } from '~/constants/enum'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import {
  CreateVideoCategoryReqBody,
  CreateVideoReqBody,
  GetPublicVideosReqQuery,
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
    const { thumbnail, category } = body
    const bodyConfig = omitBy(
      {
        ...body,
        thumbnail: thumbnail ? new ObjectId(thumbnail) : undefined,
        category: category ? new ObjectId(category) : undefined
      },
      isUndefined
    )
    const { insertedId } = await databaseService.videos.insertOne(
      new Video({
        ...(bodyConfig as any),
        accountId: new ObjectId(accountId)
      })
    )
    const newVideo = await databaseService.videos.findOne({ _id: insertedId })
    return {
      newVideo
    }
  }

  // Cập nhật video
  async updateVideo({ body, videoId }: { body: UpdateVideoReqBody; videoId: string }) {
    const { category, thumbnail } = body
    const bodyConfig = omitBy(
      {
        ...body,
        category: category ? new ObjectId(category) : undefined,
        thumbnail: thumbnail ? new ObjectId(thumbnail) : undefined
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

  // Lấy danh sách video công khai
  async getPublicVideos(query: GetPublicVideosReqQuery) {
    const { page, limit, category } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = omitBy(
      {
        audience: VideoAudience.Everyone,
        isDraft: false,
        category: category ? new ObjectId(category) : undefined
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
  async getVideosOfMe({ accountId, query }: { accountId: string; query: PaginationReqQuery }) {
    const { page, limit } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const skip = (_page - 1) * _limit
    const match = {
      accountId: new ObjectId(accountId)
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

  // Xem thông tin chi tiết video khi chưa đã đăng nhập
  async getVideoDetail({ videoId, accountId }: { videoId: string; accountId?: string }) {
    const videos = await databaseService.videos
      .aggregate([
        {
          $match: {
            _id: new ObjectId(videoId)
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
            from: 'reactions',
            localField: '_id',
            foreignField: 'contentId',
            as: 'reactions'
          }
        },
        {
          $addFields: {
            reactions: {
              $filter: {
                input: '$reactions',
                cond: {
                  $eq: ['$$reaction.accountId', new ObjectId(accountId)]
                },
                as: 'reaction'
              }
            }
          }
        },
        {
          $unwind: {
            path: '$reactions',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            isLiked: {
              $cond: {
                if: {
                  $eq: ['$reactions.type', ReactionType.Like]
                },
                then: true,
                else: false
              }
            },
            isDisliked: {
              $cond: {
                if: {
                  $eq: ['$reactions.type', ReactionType.Dislike]
                },
                then: true,
                else: false
              }
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
            subscriptionCount: {
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
                if: '$subscriptions',
                then: true,
                else: false
              }
            },
            'channel.avatar': {
              $concat: [ENV_CONFIG.HOST, ENV_CONFIG.PUBLIC_IMAGES_PATH, '/', '$channelAvatar.name']
            }
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
            description: {
              $first: '$description'
            },
            viewCount: {
              $first: '$views'
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
            'channel.updatedAt': 0
          }
        }
      ])
      .toArray()
    return {
      video: videos[0]
    }
  }

  // Lấy chi tiết video để cập nhật
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
            isDraft: {
              $first: '$isDraft'
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

  // Xóa hình thu nhỏ video
  async deleteThumbnailImage(videoId: string) {
    const updatedVideo = await databaseService.videos.findOneAndUpdate(
      {
        _id: new ObjectId(videoId)
      },
      {
        $set: {
          thumbnail: null
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    if (updatedVideo && updatedVideo.thumbnail) {
      await databaseService.images.deleteOne({ _id: updatedVideo.thumbnail })
    }
    return true
  }
}

const videoService = new VideoService()
export default videoService
