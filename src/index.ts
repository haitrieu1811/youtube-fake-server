import express from 'express'

import { ENV_CONFIG } from './constants/config'
import accountRouter from './routes/account.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

databaseService.connect()

const app = express()
const port = ENV_CONFIG.PORT ?? 4000

app.use(express.json())
app.use('/accounts', accountRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
