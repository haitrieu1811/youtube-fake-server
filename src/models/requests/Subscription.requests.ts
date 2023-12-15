import { ParamsDictionary } from 'express-serve-static-core'

// Params: Đăng ký kênh
export type SubscribeReqParams = ParamsDictionary & {
  accountId: string
}
