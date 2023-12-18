import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { ObjectId, WithId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { VideoAudience } from '~/constants/enum'
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

  // Tạo video mới
  async createVideo({ body, accountId }: { body: CreateVideoReqBody; accountId: string }) {
    const { insertedId } = await databaseService.videos.insertOne(
      new Video({
        ...body,
        accountId: new ObjectId(accountId),
        thumbnail: new ObjectId(body.thumbnail),
        category: new ObjectId(body.category)
      })
    )
    const newVideo = await databaseService.videos.findOne({ _id: insertedId })
    return {
      newVideo
    }
  }

  // Cập nhật video
  async updateVideo({ body, videoId }: { body: UpdateVideoReqBody; videoId: string }) {
    const _body = omitBy(body, isUndefined)
    const updatedVideo = await databaseService.videos.findOneAndUpdate(
      {
        _id: new ObjectId(videoId)
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

  // Lấy danh sách video
  async getPublicVideos(query: GetPublicVideosReqQuery) {
    const { page, limit, category } = query
    const _page = Number(page) || 1
    const _limit = Number(limit) || 20
    const match = omitBy(
      {
        audience: VideoAudience.Everyone,
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
              path: '$thumbnail'
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
            $skip: (_page - 1) * _limit
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

const videoService = new VideoService()
export default videoService
