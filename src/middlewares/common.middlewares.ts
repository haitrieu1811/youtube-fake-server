import { NextFunction, Request, Response } from 'express'
import pick from 'lodash/pick'

type FilterKeys<T> = Array<keyof T>

export const filterReqBodyMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, _: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }
