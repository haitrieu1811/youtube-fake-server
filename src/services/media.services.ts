import { Request } from 'express'
import fsPromise from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getExtensionFromFullname, getNameFromFullname, handleUploadImage } from '~/lib/file'

class MediaService {
  // Xử lý upload ảnh
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
        try {
          await Promise.all([fsPromise.unlink(image.filepath), fsPromise.unlink(newPath)])
        } catch (error) {
          console.log(error)
        }
        return newFullName
      })
    )
    return {
      imageNames: result
    }
  }
}

const mediaService = new MediaService()
export default mediaService
