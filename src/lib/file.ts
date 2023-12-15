import { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import path from 'path'

import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MEDIA_MESSAGES } from '~/constants/messages'

// Khởi tạo các thư mục cần thiết
export const initFolders = () => {
  ;[UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR].forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, {
        recursive: true
      })
    }
  })
}

// Lấy extension từ fullname
export const getExtensionFromFullname = (fullname: string) => {
  const nameArr = fullname.split('.')
  return nameArr[nameArr.length - 1]
}

// Lấy tên file từ fullname
export const getNameFromFullname = (fullname: string) => {
  const nameArr = fullname.split('.')
  nameArr.pop()
  return nameArr.join('')
}

// Xử lý upload ảnh
export const handleUploadImage = async (req: Request) => {
  const formiable = (await import('formidable')).default
  const form = formiable({
    uploadDir: UPLOAD_IMAGE_DIR,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB
    maxTotalFileSize: Infinity,
    filter: ({ name, mimetype }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('errors' as any, new Error(MEDIA_MESSAGES.FILE_TYPE_INVALID) as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, _, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error(MEDIA_MESSAGES.IMAGE_FIELD_IS_REQUIRED))
      }
      resolve(files.image as File[])
    })
  })
}

// Xử lý upload video
export const handleUploadVideo = async (req: Request) => {
  const formiable = (await import('formidable')).default
  const nanoId = (await import('nanoid')).nanoid
  const idName = nanoId()
  const folderPath = path.resolve(UPLOAD_VIDEO_DIR, idName)
  fs.mkdirSync(folderPath)
  const form = formiable({
    uploadDir: folderPath,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'video' && (Boolean(mimetype?.includes('mp4')) || Boolean(mimetype?.includes('quicktime')))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    },
    filename: () => idName
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }
      const videos = files.video as File[]
      videos.forEach((video) => {
        const extension = getExtensionFromFullname(video.originalFilename as string)
        fs.renameSync(video.filepath, `${video.filepath}.${extension}`)
        video.newFilename = `${video.newFilename}.${extension}`
        video.filepath = `${video.filepath}.${extension}`
      })
      return resolve(videos)
    })
  })
}
