import { Request } from 'express'
import fsPromise from 'fs/promises'
import mime from 'mime'
import path from 'path'
import sharp from 'sharp'

import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { EncodingStatus } from '~/constants/enum'
import { getExtensionFromFullname, getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/lib/file'
import { uploadFileToS3 } from '~/lib/s3'
import { encodeHLSWithMultipleVideoStreams } from '~/lib/video'
import Image from '~/models/schemas/Image.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import databaseService from './database.services'
import { updateVideoStatus } from '~/lib/utils'

class Queue {
  items: string[]
  encoding: boolean

  constructor() {
    this.items = []
    this.encoding = false
  }

  async enqueue(item: string) {
    this.items.push(item)
    await updateVideoStatus({ filePath: item, status: EncodingStatus.Pending })
    this.processEncode()
  }

  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      await updateVideoStatus({ filePath: videoPath, status: EncodingStatus.Processing })
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        await fsPromise.unlink(videoPath)
        this.items.shift()
        await updateVideoStatus({ filePath: videoPath, status: EncodingStatus.Succeed })
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await updateVideoStatus({ filePath: videoPath, status: EncodingStatus.Failed }).then((err) => {
          console.log('Update video status error: ', err)
        })
        console.error(`Encode ${videoPath} error`)
        console.error(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()

class MediaService {
  // Upload ảnh
  async handleUploadImages(req: Request) {
    const images = await handleUploadImage(req)
    const result: string[] = await Promise.all(
      images.map(async (image) => {
        const extension = getExtensionFromFullname(image.newFilename)
        const newName = getNameFromFullname(image.newFilename)
        const newFullName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullName)
        if (extension !== 'jpg') {
          await sharp(image.filepath).jpeg().toFile(newPath)
        }
        await uploadFileToS3({
          filename: `images/${newFullName}`,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        try {
          await Promise.all([fsPromise.unlink(image.filepath), fsPromise.unlink(newPath)])
        } catch (error) {
          console.log(error)
        }
        return newFullName
      })
    )
    // Lưu thông tin ảnh vào DB
    const imagesInsert = result.map(
      (imageName) =>
        new Image({
          name: imageName
        })
    )
    await databaseService.images.insertMany(imagesInsert)
    return {
      imageNames: result
    }
  }

  // Upload video HLS
  async handleUploadVideoHLS(req: Request) {
    const videos = await handleUploadVideo(req)
    const result: string[] = await Promise.all(
      videos.map(async (video) => {
        const fileName = getNameFromFullname(video.newFilename)
        queue.enqueue(video.filepath)
        return fileName
      })
    )
    return result
  }

  // Get video status
  async getVideoStatus(idName: string) {
    const videoStatus = await databaseService.videoStatus.findOne({ name: idName })
    return {
      videoStatus
    }
  }
}

const mediaService = new MediaService()
export default mediaService
