import { ObjectId } from 'mongodb'

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
}

const watchHistoryService = new WatchHistoryService()
export default watchHistoryService
