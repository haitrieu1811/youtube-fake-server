import { Collection, Db, MongoClient } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Account from '~/models/schemas/Account.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Comment from '~/models/schemas/Comment.schema'
import Image from '~/models/schemas/Image.schema'
import Playlist from '~/models/schemas/Playlist.schema'
import PlaylistVideo from '~/models/schemas/PlaylistVideo.schema'
import Post from '~/models/schemas/Post.schema'
import Reaction from '~/models/schemas/Reaction.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Report from '~/models/schemas/Report.schema'
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

  async indexAccounts() {
    const isExist = await this.accounts.indexExists([
      'email_1',
      'email_1_password_1',
      'verifyEmailToken_1',
      'forgotPasswordToken_1',
      'username_1',
      'channelName_text',
      'email_text'
    ])
    if (!isExist) {
      await Promise.all([
        this.accounts.createIndex({ email: 1 }, { unique: true }),
        this.accounts.createIndex({ email: 1, password: 1 }),
        this.accounts.createIndex({ verifyEmailToken: 1 }),
        this.accounts.createIndex({ forgotPasswordToken: 1 }),
        this.accounts.createIndex({ username: 1 }, { unique: true }),
        this.accounts.createIndex({ channelName: 'text' }, { default_language: 'none' })
      ])
    }
  }

  async indexRefreshTokens() {
    const isExist = await this.refreshTokens.indexExists(['token_1', 'exp_1'])
    if (!isExist) {
      await Promise.all([
        this.refreshTokens.createIndex({ token: 1 }, { unique: true }),
        this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
      ])
    }
  }

  async indexComments() {
    const isExist = await this.comments.indexExists(['parentId_1', 'contentId_1_parentId_1'])
    if (!isExist) {
      await Promise.all([
        this.comments.createIndex({ parentId: 1 }),
        this.comments.createIndex({ contentId: 1, parentId: 1 })
      ])
    }
  }

  async indexPlaylists() {
    const isExist = await this.playlists.indexExists(['accountId_1'])
    if (!isExist) {
      await Promise.all([this.playlists.createIndex({ accountId: 1 })])
    }
  }

  async indexPosts() {
    const isExist = await this.posts.indexExists(['accountId_1', 'content_text'])
    if (!isExist) {
      await Promise.all([
        this.posts.createIndex({ accountId: 1 }),
        this.posts.createIndex({ content: 'text' }, { default_language: 'none' })
      ])
    }
  }

  async indexReactions() {
    const isExist = await this.reactions.indexExists(['accountId_1_contentId_1'])
    if (!isExist) {
      await Promise.all([this.reactions.createIndex({ accountId: 1, contentId: 1 })])
    }
  }

  async indexReports() {
    const isExist = await this.reports.indexExists(['status_1'])
    if (!isExist) {
      await Promise.all([this.reports.createIndex({ status: 1 })])
    }
  }

  async indexSubscriptions() {
    const isExist = await this.subscriptions.indexExists(['fromAccountId_1_toAccountId_1'])
    if (!isExist) {
      await Promise.all([this.subscriptions.createIndex({ fromAccountId: 1, toAccountId: 1 })])
    }
  }

  async indexVideos() {
    const isExist = await this.videos.indexExists([
      '_id_1_accountId_1',
      'audience_1_category_1',
      'accountId_1',
      'title_text'
    ])
    if (!isExist) {
      await Promise.all([
        this.videos.createIndex({ _id: 1, accountId: 1 }),
        this.videos.createIndex({ audience: 1, category: 1 }),
        this.videos.createIndex({ accountId: 1 }),
        this.videos.createIndex({ title: 'text' }, { default_language: 'none' })
      ])
    }
  }

  async indexWatchHistories() {
    const isExist = await this.watchHistories.indexExists(['accountId_1_videoId_1', 'accountId_1'])
    if (!isExist) {
      await Promise.all([
        this.watchHistories.createIndex({ accountId: 1, videoId: 1 }),
        this.watchHistories.createIndex({ accountId: 1 })
      ])
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

  get comments(): Collection<Comment> {
    return this.db.collection(ENV_CONFIG.DB_COMMENTS_COLLECTION_NAME)
  }

  get reports(): Collection<Report> {
    return this.db.collection(ENV_CONFIG.DB_REPORTS_COLLECTION_NAME)
  }

  get posts(): Collection<Post> {
    return this.db.collection(ENV_CONFIG.DB_POSTS_COLLECTION_NAME)
  }

  get playlists(): Collection<Playlist> {
    return this.db.collection(ENV_CONFIG.DB_PLAYLISTS_COLLECTION_NAME)
  }

  get playlistVideos(): Collection<PlaylistVideo> {
    return this.db.collection(ENV_CONFIG.DB_PLAYLIST_VIDEOS_COLLECTION_NAME)
  }
}

const databaseService = new DatabaseService()
export default databaseService
