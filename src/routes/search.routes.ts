import { Router } from 'express'

import { searchController } from '~/controllers/search.controllers'
import { wrapRequestHandler } from '~/lib/handlers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import { searchValidator } from '~/middlewares/search.middlewares'

const searchRouter = Router()

// Tìm kiếm
searchRouter.get('/', paginationValidator, searchValidator, wrapRequestHandler(searchController))

export default searchRouter
