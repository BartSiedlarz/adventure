/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { documentClient } from '../infra/aws'
import { testUserChangeLimitEvent, testUserCreateLimitEvent } from '../testFactories/testEvents'
import { testUserLimitItem } from '../testFactories/testUserLimit'
import { DynamoDb } from './userLimit'

vi.mock('../infra/aws')

const TABLE_NAME = 'local-user-limit'

const dynamoStorage = new DynamoDb()

describe('UserLimitRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createUserLimit', async () => {
    it('creates a user limit', async () => {
      const event = testUserCreateLimitEvent()

      await dynamoStorage.createUserLimit(event)

      expect(documentClient.put).toHaveBeenCalledOnce()
      expect(documentClient.put).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        Item: {
          userId: event.payload.userId,
          userLimitId: event.payload.userLimitId,
          data: {
            ...event.payload,
            createdAt: event.createdAt,
          },
        },
        ConditionExpression: 'attribute_not_exists(userLimitId) AND attribute_not_exists(userId)',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      })
    })
  })

  describe('updateUserLimit', async () => {
    it('updates a user limit', async () => {
      const event = testUserChangeLimitEvent()
      const progress = '85'

      await dynamoStorage.updateUserLimit({
        userId: event.payload.userId,
        userLimitId: event.payload.userLimitId,
        createdAt: event.createdAt,
        progress,
      })

      expect(documentClient.update).toHaveBeenCalledOnce()
      expect(documentClient.update).toHaveBeenCalledWith({
        ConditionExpression:
          'attribute_exists(userLimitId) AND attribute_exists(userId) AND #data.createdAt <= :createdAt',
        ExpressionAttributeNames: {
          '#data': 'data',
        },
        ExpressionAttributeValues: {
          ':createdAt': event.createdAt,
          ':progress': '85',
        },
        Key: {
          userId: 'VijPYTEOgK7dxLs5fBjJ',
          userLimitId: 'LKMgxoE0yFgH6F6iShEu',
        },
        TableName: TABLE_NAME,
        UpdateExpression: 'SET #data.createdAt = :createdAt, #data.progress = :progress',
      })
    })
  })

  describe('getUserLimit', async () => {
    it('gets a user limit', async () => {
      const Item = testUserLimitItem()
      const { userId, userLimitId } = Item

      vi.mocked(documentClient.get, { partial: true }).mockResolvedValueOnce({ Item } as any)

      const userLimit = await dynamoStorage.getUserLimit(userId, userLimitId)

      expect(userLimit).toEqual(Item.data)

      expect(documentClient.get).toHaveBeenCalledOnce()
      expect(documentClient.get).toHaveBeenCalledWith({
        Key: {
          userId: 'acc-test-user-1',
          userLimitId: 'limit-reset-1',
        },
        TableName: TABLE_NAME,
      })
    })

    it('return undefined when user was not found', async () => {
      vi.mocked(documentClient.get, { partial: true }).mockResolvedValueOnce({
        Item: undefined,
      } as any)

      const userLimit = await dynamoStorage.getUserLimit('userId', 'userLimitId')

      expect(userLimit).toBeUndefined()
    })
  })

  describe('removeUserLimits', async () => {
    it('removes user limits', async () => {
      const userId = 'user-1'
      const userLimitsItems = [
        testUserLimitItem({ userId, userLimitId: 'limit-1' }),
        testUserLimitItem({ userId, userLimitId: 'limit-2' }),
        testUserLimitItem({ userId, userLimitId: 'limit-3' }),
      ]

      vi.mocked(documentClient.query, { partial: true }).mockResolvedValueOnce({
        Items: userLimitsItems,
      } as any)

      await dynamoStorage.removeUserLimits(userId)

      expect(documentClient.query).toHaveBeenCalledOnce()
      expect(documentClient.query).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })

      expect(documentClient.batchWrite).toHaveBeenCalledOnce()
      expect(documentClient.batchWrite).toHaveBeenCalledWith({
        RequestItems: {
          [TABLE_NAME]: userLimitsItems.map(({ userLimitId }) => ({
            DeleteRequest: {
              Key: {
                userId,
                userLimitId,
              },
            },
          })),
        },
      })
    })
  })
})
