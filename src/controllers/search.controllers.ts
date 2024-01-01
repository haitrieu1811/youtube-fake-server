import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { SEARCH_MESSAGES } from '~/constants/messages'
import { AccountIdReqParams, TokenPayload } from '~/models/requests/Account.requests'
import { SearchReqQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'

// Tìm kiếm
export const searchController = async (req: Request<ParamsDictionary, any, any, SearchReqQuery>, res: Response) => {
  const { videos, ...pagination } = await searchService.search(req.query)
  return res.json({
    message: SEARCH_MESSAGES.SEARCH_SUCCEED,
    data: {
      videos,
      pagination
    }
  })
}

// Tìm kiếm trong channel của mình
export const searchInMyChannelController = async (
  req: Request<AccountIdReqParams, any, any, SearchReqQuery>,
  res: Response
) => {
  const { accountId } = req.decodedAuthorization as TokenPayload
  const { videos, ...pagination } = await searchService.searchInMyChannel({ query: req.query, accountId })
  return res.json({
    message: SEARCH_MESSAGES.SEARCH_SUCCEED,
    data: {
      videos,
      pagination
    }
  })
}
