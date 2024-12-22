import { Context } from 'aws-lambda'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handler } from './index'
import { logger } from './infra/logger'
import { UserLimitService } from './service/userLimitService'
import { eventsToKinesisStreamEvent } from './testFactories/helpers'
import {
  testUserChangeLimitEvent,
  testUserCreateLimitEvent,
  testUserResetLimitEvent,
} from './testFactories/testEvents'
import { Payload, UserLimitEvent } from './types/event'

vi.mock('./infra/logger')

const processUserEvents = vi.spyOn(UserLimitService.prototype, 'processUserEvents')

describe('index', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles stream event with different users limits', async () => {
    const firstUserId = 'VijPYTEOgK7d'
    const secondSecondUserId = 'VijPYTE'
    const thirdUserId = 'xLs5fBjJ'

    const firstUserEvents = [
      testUserCreateLimitEvent({ userId: firstUserId }, 1, firstUserId),
      testUserChangeLimitEvent({ userId: firstUserId }, 2, firstUserId),
      testUserResetLimitEvent({ userId: firstUserId }, 3, firstUserId),
    ]

    const secondUserEvents = [
      testUserCreateLimitEvent({ userId: secondSecondUserId }, 1, secondSecondUserId),
      testUserChangeLimitEvent({ userId: secondSecondUserId }, 2, secondSecondUserId),
    ]

    const thirdUserEvent = testUserResetLimitEvent({ userId: thirdUserId }, 3, thirdUserId)

    const events: UserLimitEvent<Payload>[] = [
      ...secondUserEvents,
      ...firstUserEvents,
      thirdUserEvent,
    ]

    processUserEvents.mockResolvedValueOnce().mockResolvedValueOnce().mockResolvedValueOnce()

    await handler(eventsToKinesisStreamEvent(events), {} as Context, () => {})

    expect(processUserEvents).toHaveBeenCalledTimes(3)
    expect(processUserEvents).toHaveBeenNthCalledWith(1, secondUserEvents)
    expect(processUserEvents).toHaveBeenNthCalledWith(2, firstUserEvents)
    expect(processUserEvents).toHaveBeenNthCalledWith(3, [thirdUserEvent])
  })

  it('one of user limits fails', async () => {
    const firstUserId = 'VijPYTEOgK7d'

    const events: UserLimitEvent<Payload>[] = [
      testUserCreateLimitEvent({ userId: firstUserId }, 1, firstUserId),
      testUserChangeLimitEvent({ userId: firstUserId }, 2, firstUserId),
      testUserChangeLimitEvent({ userId: firstUserId }, 5, firstUserId),
      testUserChangeLimitEvent({ userId: firstUserId }, 3, firstUserId),
      testUserResetLimitEvent({ userId: firstUserId }, 4, firstUserId),
    ]

    processUserEvents.mockRejectedValueOnce(new Error('Failed to process user limit'))

    await handler(eventsToKinesisStreamEvent(events), {} as Context, () => {})

    expect(processUserEvents).toHaveBeenCalledTimes(1)

    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(
      'An error occurred Error: Failed to process user limit',
      new Error('Failed to process user limit'),
    )
  })
})
