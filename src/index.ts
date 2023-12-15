import express from 'express'

import { ENV_CONFIG } from './constants/config'
import { initFolders } from './lib/file'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import accountRouter from './routes/account.routes'
import mediaRouter from './routes/media.routes'
import databaseService from './services/database.services'

initFolders()
databaseService.connect()

const app = express()
const port = ENV_CONFIG.PORT ?? 4000

app.use(express.json())
app.use('/accounts', accountRouter)
app.use('/medias', mediaRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
