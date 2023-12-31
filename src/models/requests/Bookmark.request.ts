import { ParamsDictionary } from 'express-serve-static-core'

// Params: Tạo một bookmark video
export type CreateBookmarkReqParams = ParamsDictionary & {
  videoId: string
}

// Params: Bookmark id
export type BookmarkIdReqParams = ParamsDictionary & {
  bookmarkId: string
}
