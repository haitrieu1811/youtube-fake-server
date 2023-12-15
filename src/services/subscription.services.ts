import { ObjectId } from 'mongodb'

import Subscription from '~/models/schemas/Subscription.schema'
import databaseService from './database.services'

class SubscriptionService {
  // Đăng ký kênh
  async subscribe({ fromAccountId, toAccountId }: { fromAccountId: string; toAccountId: string }) {
    await databaseService.subscriptions.insertOne(
      new Subscription({
        fromAccountId: new ObjectId(fromAccountId),
        toAccountId: new ObjectId(toAccountId)
      })
    )
    return true
  }

  // Hủy đăng ký kênh
  async unsubscribe({ fromAccountId, toAccountId }: { fromAccountId: string; toAccountId: string }) {
    await databaseService.subscriptions.deleteOne({
      fromAccountId: new ObjectId(fromAccountId),
      toAccountId: new ObjectId(toAccountId)
    })
    return true
  }
}

const subscriptionService = new SubscriptionService()
export default subscriptionService
