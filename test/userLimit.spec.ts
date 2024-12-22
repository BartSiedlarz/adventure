import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  dynamoStorage,
  eventsToKinesisStreamEvent,
  invokeLambda,
} from '../src/testFactories/helpers'
import {
  testUserChangeLimitEvent,
  testUserCreateLimitEvent,
  testUserResetLimitEvent,
} from '../src/testFactories/testEvents'

const userId = 'acc-test-user-1'

describe('User Limit', () => {
  beforeAll(async () => {
    await dynamoStorage.removeUserLimits(userId)
  })

  describe('create user limit', () => {
    it('creates new user limit', async () => {
      const userLimitId = 'limit-1'
      const createdAt = new Date().getTime()

      const createEvent = testUserCreateLimitEvent(
        {
          userId,
          userLimitId,
        },
        createdAt,
      )

      await invokeLambda(eventsToKinesisStreamEvent([createEvent]))

      await vi.waitFor(async () => {
        const res = await dynamoStorage.getUserLimit(userId, userLimitId)
        expect(res).toEqual({ ...createEvent.payload, createdAt })
      })
    })
  })

  describe('change user limit', () => {
    it('changes user limit', async () => {
      const userLimitId = 'limit-2'
      const createdAt = new Date().getTime()

      const createEvent = testUserCreateLimitEvent(
        {
          userId,
          userLimitId,
          value: '1200',
        },
        createdAt,
      )

      await invokeLambda(eventsToKinesisStreamEvent([createEvent]))

      await vi.waitFor(async () => {
        const res = await dynamoStorage.getUserLimit(userId, userLimitId)
        expect(res).toEqual({ ...createEvent.payload, createdAt })
      })

      const createdAtForChange = new Date().getTime()

      const changeEvent = testUserChangeLimitEvent(
        {
          userId,
          userLimitId,
          remainingAmount: '200',
        },
        createdAtForChange,
      )

      await invokeLambda(eventsToKinesisStreamEvent([changeEvent]))

      await vi.waitFor(async () => {
        const res = await dynamoStorage.getUserLimit(userId, userLimitId)
        expect(res).toEqual({
          ...createEvent.payload,
          createdAt: createdAtForChange,
          progress: '16',
        })
      })
    })

    it('ignores skipped change user limit event', async () => {
      const userLimitId = 'limit-3'
      const createdAt = new Date().getTime()

      const createEvent = testUserCreateLimitEvent(
        {
          userId,
          userLimitId,
          value: '1200',
        },
        createdAt,
      )

      await invokeLambda(eventsToKinesisStreamEvent([createEvent]))

      await vi.waitFor(async () => {
        const res = await dynamoStorage.getUserLimit(userId, userLimitId)
        expect(res).toEqual({ ...createEvent.payload, createdAt })
      })

      const createdAtForChange = new Date().getTime()

      const changeEvent = testUserChangeLimitEvent(
        {
          userId,
          userLimitId,
          remainingAmount: '200',
        },
        createdAtForChange,
      )

      await invokeLambda(eventsToKinesisStreamEvent([changeEvent]))

      await vi.waitFor(async () => {
        const res = await dynamoStorage.getUserLimit(userId, userLimitId)
        expect(res).toEqual({
          ...createEvent.payload,
          createdAt: createdAtForChange,
          progress: '16',
        })
      })

      const skippedChangeEvent = testUserChangeLimitEvent(
        {
          userId,
          userLimitId,
          remainingAmount: '650',
        },
        createdAtForChange - 100,
      )

      await invokeLambda(eventsToKinesisStreamEvent([skippedChangeEvent]))

      await vi.waitFor(async () => {
        const res = await dynamoStorage.getUserLimit(userId, userLimitId)
        expect(res).toEqual({
          ...createEvent.payload,
          createdAt: createdAtForChange,
          progress: '16',
        })
      })
    })
  })

  describe('reset user limit', () => {
    it('resets user limit', async () => {
      const userLimitId = 'limit-reset-1'
      const createdAt = new Date().getTime()

      const createEvent = testUserCreateLimitEvent(
        {
          userId,
          userLimitId,
          value: '2200',
        },
        createdAt,
      )

      await invokeLambda(eventsToKinesisStreamEvent([createEvent]))

      await vi.waitFor(async () => {
        const res = await dynamoStorage.getUserLimit(userId, userLimitId)
        expect(res).toEqual({ ...createEvent.payload, createdAt })
      })

      const createdAtForChange = new Date().getTime()
      const changeEvent = testUserChangeLimitEvent(
        {
          userId,
          userLimitId,
          remainingAmount: '1450',
        },
        createdAtForChange,
      )

      await invokeLambda(eventsToKinesisStreamEvent([changeEvent]))

      await vi.waitFor(async () => {
        const res = await dynamoStorage.getUserLimit(userId, userLimitId)
        expect(res).toEqual({
          ...createEvent.payload,
          createdAt: createdAtForChange,
          progress: '65',
        })
      })

      const createdAtForReset = new Date().getTime()
      const resetEvent = testUserResetLimitEvent(
        {
          userId,
          userLimitId,
        },
        createdAtForReset,
      )

      await invokeLambda(eventsToKinesisStreamEvent([resetEvent]))

      await vi.waitFor(async () => {
        const res = await dynamoStorage.getUserLimit(userId, userLimitId)
        expect(res).toEqual({
          ...createEvent.payload,
          createdAt: createdAtForReset,
          progress: '0',
        })
      })
    })
  })
})
