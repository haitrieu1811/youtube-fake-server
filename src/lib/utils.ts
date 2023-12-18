import { EncodingStatus } from '~/constants/enum'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import databaseService from '~/services/database.services'
import { getNameFromFullname } from './file'

export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((item) => typeof item === 'number') as number[]
}

export const updateVideoStatus = async ({ filePath, status }: { filePath: string; status: EncodingStatus }) => {
  const idName = getNameFromFullname(filePath.split('\\').pop() as string)
  if (status === EncodingStatus.Pending) {
    await databaseService.videoStatus.insertOne(new VideoStatus({ name: idName, status }))
    return
  }
  await databaseService.videoStatus.updateOne(
    {
      name: idName
    },
    {
      $set: {
        status
      },
      $currentDate: {
        updatedAt: true
      }
    }
  )
}
