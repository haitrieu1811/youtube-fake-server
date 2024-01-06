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
  async updateReaction({ contentId, type }: { contentId: string; type: ReactionType }) {
    const updatedReaction = await databaseService.reactions.findOneAndUpdate(
      {
        contentId: new ObjectId(contentId)
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
  async deleteReaction(contentId: string) {
    const reaction = await databaseService.reactions.findOneAndDelete({ contentId: new ObjectId(contentId) })
    return {
      reaction
    }
  }
}

const reactionService = new ReactionService()
export default reactionService
