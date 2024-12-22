import { eventsToKinesisStreamEvent, invokeLambda } from './testFactories/helpers'
import { CreateLimitEventPayload } from './types/event'
import { LimitPeriod, LimitStatus, LimitType } from './types/user-limit'

invokeLambda(
  eventsToKinesisStreamEvent<CreateLimitEventPayload>([
    {
      aggregateId: 'VijPYTEOgK7dxLs5fBjJ',
      context: {
        correlationId: 'hVyFHScCNAmSyAPulhtsQ',
      },
      createdAt: 1647946090760,
      eventId: 'hZY4UzCNn60FAuoDHMCQ',
      payload: {
        activeFrom: 1647946090760,
        brandId: '000000000000000000000001',
        currencyCode: 'SEK',
        nextResetTime: 1648550890760,
        period: LimitPeriod.WEEK,
        status: LimitStatus.ACTIVE,
        type: LimitType.DEPOSIT,
        userId: 'VijPYTEOgK7dxLs5fBjJ',
        userLimitId: '0w2KzcVUkZcb6n2z4DcE',
        value: '50000',
      },
      sequenceNumber: 4,
      source: 'limitUser',
      type: 'USER_LIMIT_CREATED',
    },
  ]),
)
