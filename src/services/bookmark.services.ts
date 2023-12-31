import { ObjectId } from 'mongodb'

import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from './database.services'

class BookmarkService {
  // Tạo một bookmark video
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

  // Xóa một bookmark video
  async deleteBookmark(bookmarkId: string) {
    await databaseService.bookmarks.deleteOne({ _id: new ObjectId(bookmarkId) })
    return true
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService
