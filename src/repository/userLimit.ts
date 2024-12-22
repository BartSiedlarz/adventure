import { documentClient } from '../infra/aws'
import { CreateLimitEventPayload, UserLimitEvent } from '../types/event'
import { UserLimit } from '../types/user-limit'
import { DynamoDbBuilder } from './builder'

export interface Storage {
  createUserLimit(payload: UserLimitEvent<CreateLimitEventPayload>): Promise<void>

  updateUserLimit({
    userId,
    userLimitId,
    createdAt,
    progress,
  }: {
    userId: string
    userLimitId: string
    createdAt: number
    progress: string
  }): Promise<void>

  getUserLimit(userId: string, userLimitId: string): Promise<UserLimit | undefined>

  removeUserLimits(userId: string): Promise<void>
}

export class DynamoDb implements Storage {
  async createUserLimit(event: UserLimitEvent<CreateLimitEventPayload>): Promise<void> {
    const { createdAt, payload } = event

    const putCommand = new DynamoDbBuilder()
    putCommand.setItem({
      userId: payload.userId,
      userLimitId: payload.userLimitId,
      data: { ...payload, createdAt },
    })
    putCommand.setConditionExpression('attribute_not_exists(userLimitId)')
    putCommand.setConditionExpression('attribute_not_exists(userId)')
    putCommand.setReturnValuesOnConditionCheckFailure('ALL_OLD')

    await documentClient.put(putCommand.buildPut())
  }

  async updateUserLimit({
    userId,
    userLimitId,
    createdAt,
    progress,
  }: {
    userId: string
    userLimitId: string
    createdAt: number
    progress: string
  }): Promise<void> {
    const builder = new DynamoDbBuilder()
    builder.setKey({
      userId,
      userLimitId,
    })
    builder.setConditionExpression('attribute_exists(userLimitId)')
    builder.setConditionExpression('attribute_exists(userId)')
    builder.setConditionExpression('#data.createdAt <= :createdAt')
    builder.setExpressionAttributeNames({ key: '#data', value: 'data' })
    builder.setUpdateExpression('#data.createdAt = :createdAt')
    builder.setExpressionAttributeValue({
      key: ':createdAt',
      value: createdAt,
    })
    builder.setUpdateExpression('#data.progress = :progress')
    builder.setExpressionAttributeValue({
      key: ':progress',
      value: progress,
    })

    await documentClient.update(builder.buildUpdate())
  }

  async getUserLimit(userId: string, userLimitId: string): Promise<UserLimit | undefined> {
    const { Item } = await documentClient.get(
      new DynamoDbBuilder().setKey({ userId, userLimitId }).buildGet(),
    )

    return Item?.data
  }

  async removeUserLimits(userId: string): Promise<void> {
    const { Items } = await documentClient.query(
      new DynamoDbBuilder()
        .setKeyConditionExpression('userId = :userId')
        .setExpressionAttributeValue({ key: ':userId', value: userId })
        .buildQuery(),
    )

    if (Items?.length) {
      const builder = new DynamoDbBuilder()
      Items.forEach(({ userId, userLimitId }) => {
        builder.setBatchWriteDelete({
          DeleteRequest: {
            Key: {
              userId,
              userLimitId,
            },
          },
        })
      })

      documentClient.batchWrite(builder.buildBatchWrite())
    }
  }
}
