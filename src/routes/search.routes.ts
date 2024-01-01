import { Router } from 'express'

import { searchController, searchInMyChannelController } from '~/controllers/search.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { accessTokenValidator, verifiedAccountValidator } from '~/middlewares/account.middlewares'
import { paginationValidator } from '~/middlewares/common.middlewares'
import { searchValidator } from '~/middlewares/search.middlewares'

const searchRouter = Router()

// Tìm kiếm
searchRouter.get('/', paginationValidator, searchValidator, wrapRequestHandler(searchController))

// Tìm kiếm trong channel của mình
searchRouter.get(
  '/me',
  accessTokenValidator,
  verifiedAccountValidator,
  paginationValidator,
  searchValidator,
  wrapRequestHandler(searchInMyChannelController)
)

export default searchRouter
