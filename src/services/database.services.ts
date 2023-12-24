import { Collection, Db, MongoClient } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Account from '~/models/schemas/Account.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Image from '~/models/schemas/Image.schema'
import Reaction from '~/models/schemas/Reaction.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Subscription from '~/models/schemas/Subscription.schema'
import Video from '~/models/schemas/Video.schema'
import VideoCategory from '~/models/schemas/VideoCategory.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import WatchHistory from '~/models/schemas/WatchHistory.schema'

const uri = `mongodb+srv://${ENV_CONFIG.DB_USERNAME}:${ENV_CONFIG.DB_PASSWORD}@youtube-fake-cluster.zodfbyg.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(ENV_CONFIG.DB_NAME)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error', error)
      throw error
    }
  }

  async indexSubscriptions() {
    const isExist = await this.subscriptions.indexExists(['fromAccountId_1_toAccountId_1'])
    if (!isExist) {
      await Promise.all([this.subscriptions.createIndex({ fromAccountId: 1, toAccountId: 1 })])
    }
  }

  get accounts(): Collection<Account> {
    return this.db.collection(ENV_CONFIG.DB_ACCOUNTS_COLLECTION_NAME)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(ENV_CONFIG.DB_REFRESH_TOKENS_COLLECTION_NAME)
  }

  get images(): Collection<Image> {
    return this.db.collection(ENV_CONFIG.DB_IMAGES_COLLECTION_NAME)
  }

  get subscriptions(): Collection<Subscription> {
    return this.db.collection(ENV_CONFIG.DB_SUBSCRIPTIONS_COLLECTION_NAME)
  }

  get videoCategories(): Collection<VideoCategory> {
    return this.db.collection(ENV_CONFIG.DB_VIDEO_CATEGORIES_COLLECTION_NAME)
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(ENV_CONFIG.DB_VIDEO_STATUS_COLLECTION_NAME)
  }

  get videos(): Collection<Video> {
    return this.db.collection(ENV_CONFIG.DB_VIDEOS_COLLECTION_NAME)
  }

  get reactions(): Collection<Reaction> {
    return this.db.collection(ENV_CONFIG.DB_REACTIONS_COLLECTION_NAME)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(ENV_CONFIG.DB_BOOKMARKS_COLLECTION_NAME)
  }

  get watchHistories(): Collection<WatchHistory> {
    return this.db.collection(ENV_CONFIG.DB_WATCH_HISTORIES_COLLECTION_NAME)
  }
}

const databaseService = new DatabaseService()
export default databaseService
