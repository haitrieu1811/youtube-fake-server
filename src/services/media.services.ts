import { Request } from 'express'
import fsPromise from 'fs/promises'
import mime from 'mime'
import path from 'path'
import sharp from 'sharp'

import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getExtensionFromFullname, getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/lib/file'
import { uploadFileToS3 } from '~/lib/s3'
import { encodeHLSWithMultipleVideoStreams } from '~/lib/video'
import Image from '~/models/schemas/Image.schema'
import databaseService from './database.services'

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
        await encodeHLSWithMultipleVideoStreams(video.filepath)
        await fsPromise.unlink(video.filepath)
        return fileName
      })
    )
    return result
  }
}

const mediaService = new MediaService()
export default mediaService
