import { ObjectId, WithId } from 'mongodb'
import omitBy from 'lodash/omitBy'
import isUndefined from 'lodash/isUndefined'

import { CreateVideoCategoryReqBody, UpdateVideoCategoryReqBody } from '~/models/requests/Video.requests'
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
}

const videoService = new VideoService()
export default videoService
