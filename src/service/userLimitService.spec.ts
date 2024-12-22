import { afterEach, describe, expect, it, vi } from 'vitest'
import { Storage } from '../repository/userLimit'
import {
  testUserChangeLimitEvent,
  testUserCreateLimitEvent,
  testUserResetLimitEvent,
} from '../testFactories/testEvents'
import { testUserLimit } from '../testFactories/testUserLimit'
import { UserLimitService } from './userLimitService'

export const testStorage = (override: Partial<Storage> = {}): Storage => ({
  createUserLimit: vi.fn(),
  updateUserLimit: vi.fn(),
  getUserLimit: vi.fn(),
  removeUserLimits: vi.fn(),
  ...override,
})

const createUserLimit = vi.fn()
const getUserLimit = vi.fn()
const updateUserLimit = vi.fn()
const userLimitService = new UserLimitService(
  testStorage({
    createUserLimit,
    getUserLimit,
    updateUserLimit,
  }),
)

describe('userLimitService', async () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createUserLimitEvent', async () => {
    it('creates a user limit event', async () => {
      const event = testUserCreateLimitEvent()
      await userLimitService.processUserEvents([event])

      expect(createUserLimit).toHaveBeenCalledOnce()
      expect(createUserLimit).toHaveBeenCalledWith(event)
    })

    it('throws an error on repository error', async () => {
      const event = testUserCreateLimitEvent()

      createUserLimit.mockRejectedValueOnce(new Error('Repository error'))

      await expect(() => userLimitService.processUserEvents([event])).rejects.toThrowError(
        'Repository error',
      )
    })
  })

  describe('changeProgressLimitEvent', async () => {
    it('updates a user limit', async () => {
      const userId = 'user-id'
      const userLimitId = 'user-limit-id'
      const userLimitItem = testUserLimit({
        userId,
        userLimitId,
        value: '100',
      })
      const event = testUserChangeLimitEvent({ userId, userLimitId, remainingAmount: '20' })

      getUserLimit.mockResolvedValueOnce(userLimitItem)

      await userLimitService.processUserEvents([event])

      expect(getUserLimit).toHaveBeenCalledOnce()
      expect(getUserLimit).toHaveBeenCalledWith(userId, userLimitId)

      expect(updateUserLimit).toHaveBeenCalledOnce()
      expect(updateUserLimit).toHaveBeenCalledWith({
        userId,
        userLimitId,
        createdAt: event.createdAt,
        progress: '20',
      })
    })

    it('process several user limit updates', async () => {
      const userId = 'user-id'
      const userLimitId = 'user-limit-id'
      const userLimitItem = testUserLimit({
        userId,
        userLimitId,
        value: '100',
      })
      const events = [
        testUserChangeLimitEvent({ userId, userLimitId, remainingAmount: '80' }, 1),
        testUserChangeLimitEvent({ userId, userLimitId, remainingAmount: '60' }, 2),
        testUserChangeLimitEvent({ userId, userLimitId, remainingAmount: '20' }, 3),
      ]

      getUserLimit
        .mockResolvedValueOnce(userLimitItem)
        .mockResolvedValueOnce(userLimitItem)
        .mockResolvedValueOnce(userLimitItem)

      await userLimitService.processUserEvents(events)

      expect(getUserLimit).toHaveBeenCalledTimes(3)
      events.forEach((_, index) =>
        expect(getUserLimit).toHaveBeenNthCalledWith(index + 1, userId, userLimitId),
      )

      expect(updateUserLimit).toHaveBeenCalledTimes(3)
      events.forEach(({ payload: { remainingAmount }, createdAt }, index) =>
        expect(updateUserLimit).toHaveBeenNthCalledWith(index + 1, {
          userId,
          userLimitId,
          createdAt,
          progress: remainingAmount,
        }),
      )
    })

    it('do not process further events if one have failed', async () => {
      const userId = 'user-id'
      const userLimitId = 'user-limit-id'
      const userLimitItem = testUserLimit({
        userId,
        userLimitId,
        value: '100',
      })
      const events = [
        testUserChangeLimitEvent({ userId, userLimitId, remainingAmount: '80' }, 1),
        testUserChangeLimitEvent({ userId, userLimitId, remainingAmount: '40' }, 5),
        testUserChangeLimitEvent({ userId, userLimitId, remainingAmount: '60' }, 3),
        testUserChangeLimitEvent({ userId, userLimitId, remainingAmount: '20' }, 4),
      ]

      getUserLimit.mockResolvedValueOnce(userLimitItem).mockResolvedValueOnce(userLimitItem)

      updateUserLimit
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('DynamoDB conditional check error'))

      await expect(() => userLimitService.processUserEvents(events)).rejects.toThrowError(
        'DynamoDB conditional check error',
      )

      expect(getUserLimit).toHaveBeenCalledTimes(2)

      expect(updateUserLimit).toHaveBeenCalledTimes(2)
      expect(updateUserLimit).toHaveBeenNthCalledWith(1, {
        userId,
        userLimitId,
        createdAt: 1,
        progress: '80',
      })
      expect(updateUserLimit).toHaveBeenNthCalledWith(2, {
        userId,
        userLimitId,
        createdAt: 5,
        progress: '40',
      })
    })

    it('throws an error when user limit item is missing', async () => {
      const event = testUserChangeLimitEvent()

      getUserLimit.mockResolvedValueOnce(undefined)

      await expect(() => userLimitService.processUserEvents([event])).rejects.toThrowError(
        `User limit for user ${event.aggregateId} not found`,
      )
    })

    it('throws an error on repository error', async () => {
      const userId = 'user-id'
      const userLimitId = 'user-limit-id'
      const userLimitItem = testUserLimit({
        userId,
        userLimitId,
        value: '100',
      })
      const event = testUserChangeLimitEvent({ userId, userLimitId, remainingAmount: '20' })

      getUserLimit.mockResolvedValueOnce(userLimitItem)

      updateUserLimit.mockRejectedValueOnce(new Error('Repository error'))

      await expect(() => userLimitService.processUserEvents([event])).rejects.toThrowError(
        'Repository error',
      )
    })
  })

  describe('resetLimitEvent', async () => {
    it('resets a user limit', async () => {
      const userId = 'user-id'
      const userLimitId = 'user-limit-id'

      const event = testUserResetLimitEvent({ userId, userLimitId })

      await userLimitService.processUserEvents([event])

      expect(updateUserLimit).toHaveBeenCalledOnce()
      expect(updateUserLimit).toHaveBeenCalledWith({
        userId,
        userLimitId,
        createdAt: event.createdAt,
        progress: '0',
      })
    })

    it('throws an error on repository error', async () => {
      const userId = 'user-id'
      const userLimitId = 'user-limit-id'
      const event = testUserResetLimitEvent({ userId, userLimitId })

      updateUserLimit.mockRejectedValueOnce(new Error('Repository error'))

      await expect(() => userLimitService.processUserEvents([event])).rejects.toThrowError(
        'Repository error',
      )
    })
  })
})
