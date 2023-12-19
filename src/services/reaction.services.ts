import { ObjectId } from 'mongodb'

import { ReactionType } from '~/constants/enum'
import { CreateReactionReqBody } from '~/models/requests/Reaction.request'
import Reaction from '~/models/schemas/Reaction.schema'
import databaseService from './database.services'

class ReactionService {
  // Thêm một reaction (video, post, comment)
  async createReaction({ accountId, body }: { accountId: string; body: CreateReactionReqBody }) {
    const { contentId, contentType, type } = body
    const { insertedId } = await databaseService.reactions.insertOne(
      new Reaction({
        accountId: new ObjectId(accountId),
        contentId: new ObjectId(contentId),
        contentType: contentType,
        type: type
      })
    )
    const reaction = await databaseService.reactions.findOne({ _id: insertedId })
    return {
      reaction
    }
  }

  // Cập nhật một reaction
  async updateReaction({ reactionId, type }: { reactionId: string; type: ReactionType }) {
    const updatedReaction = await databaseService.reactions.findOneAndUpdate(
      {
        _id: new ObjectId(reactionId)
      },
      {
        $set: {
          type
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      reaction: updatedReaction
    }
  }

  // Bỏ reaction (video, post, comment)
  async deleteReaction(reactionId: string) {
    await databaseService.reactions.deleteOne({ _id: new ObjectId(reactionId) })
    return true
  }
}

const reactionService = new ReactionService()
export default reactionService
