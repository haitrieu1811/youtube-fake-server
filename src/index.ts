import cors from 'cors'
import express from 'express'

import { ENV_CONFIG } from './constants/config'
import { initFolders } from './lib/file'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import accountRouter from './routes/account.routes'
import bookmarkRouter from './routes/bookmark.routes'
import mediaRouter from './routes/media.routes'
import reactionRouter from './routes/reaction.routes'
import staticRouter from './routes/static.routes'
import subscriptionRouter from './routes/subscription.routes'
import videoRouter from './routes/video.routes'
import databaseService from './services/database.services'

initFolders()
databaseService.connect().then(() => {
  databaseService.indexSubscriptions()
})

const app = express()
const port = ENV_CONFIG.PORT ?? 4000

app.use(cors())
app.use(express.json())
app.use('/accounts', accountRouter)
app.use('/medias', mediaRouter)
app.use('/subscriptions', subscriptionRouter)
app.use('/videos', videoRouter)
app.use('/static', staticRouter)
app.use('/reactions', reactionRouter)
app.use('/bookmarks', bookmarkRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
