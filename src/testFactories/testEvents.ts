import {
  ChangeLimitEventPayload,
  CreateLimitEventPayload,
  ResetLimitEventPayload,
  UserLimitEvent,
} from '../types/event'

export const testUserCreateLimitEvent = (
  override?: Partial<CreateLimitEventPayload>,
  createdAt?: UserLimitEvent['createdAt'],
  aggregateId?: UserLimitEvent['aggregateId'],
): UserLimitEvent<CreateLimitEventPayload> => {
  return {
    aggregateId: aggregateId || 'VijPYTEOgK7dxLs5fBjJ',
    context: {
      correlationId: 'hVyFHScCNAmSyAPulhtsQ',
    },
    createdAt: createdAt || new Date().getTime(),
    eventId: 'hZY4UzCNn60FAuoDHMCQ',
    payload: {
      activeFrom: 1647946090760,
      brandId: '000000000000000000000001',
      currencyCode: 'SEK',
      nextResetTime: 1648550890760,
      period: 'WEEK',
      status: 'ACTIVE',
      type: 'DEPOSIT',
      userId: 'VijPYTEOgK7dxLs5fBjJ',
      userLimitId: '0w2KzcVUkZcb6n2z4DcE',
      value: '50000',
      ...override,
    },
    sequenceNumber: 4,
    source: 'limitUser',
    type: 'USER_LIMIT_CREATED',
  }
}

export const testUserChangeLimitEvent = (
  override?: Partial<ChangeLimitEventPayload>,
  createdAt?: UserLimitEvent['createdAt'],
  aggregateId?: UserLimitEvent['aggregateId'],
): UserLimitEvent<ChangeLimitEventPayload> => {
  return {
    aggregateId: aggregateId || 'VijPYTEOgK7dxLs5fBjJ',
    context: {
      correlationId: 'hVyFHScCNAmSyAPulhtsQ',
    },
    createdAt: createdAt || new Date().getTime(),
    eventId: 'G5xplaPbCdVQ4CmZZYgg',
    payload: {
      amount: '200',
      brandId: '000000000000000000000001',
      currencyCode: 'SEK',
      nextResetTime: 1648032490592,
      previousProgress: '0',
      remainingAmount: '9800.00',
      userId: 'VijPYTEOgK7dxLs5fBjJ',
      userLimitId: 'LKMgxoE0yFgH6F6iShEu',
      ...override,
    },
    sequenceNumber: 6,
    source: 'limitUser',
    type: 'USER_LIMIT_PROGRESS_CHANGED',
  }
}

export const testUserResetLimitEvent = (
  override?: Partial<ResetLimitEventPayload>,
  createdAt?: UserLimitEvent['createdAt'],
  aggregateId?: UserLimitEvent['aggregateId'],
): UserLimitEvent<ResetLimitEventPayload> => {
  return {
    aggregateId: aggregateId || 'VijPYTEOgK7dxLs5fBjJ',
    context: {},
    createdAt: createdAt || new Date().getTime(),
    eventId: 'Anbkg4WAErESb8mcM49S',
    payload: {
      brandId: '000000000000000000000001',
      currencyCode: 'SEK',
      nextResetTime: 1650624545640,
      period: 'DAY',
      resetAmount: '0',
      resetPercentage: '0.00',
      type: 'SESSION',
      unusedAmount: '82800.00',
      userId: 'VijPYTEOgK7dxLs5fBjJ',
      userLimitId: 'O6aupKRcI6JnU89kaQkm',
      ...override,
    },
    sequenceNumber: 238,
    source: 'limitUser',
    type: 'USER_LIMIT_RESET',
  }
}
