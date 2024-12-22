import { LimitPeriod, LimitStatus, LimitType, UserLimit } from '../types/user-limit'

export const testUserLimit = (override?: Partial<UserLimit>): UserLimit => {
  return {
    createdAt: 1734806185969,
    period: LimitPeriod.WEEK,
    brandId: '000000000000000000000001',
    nextResetTime: 1648550890760,
    progress: '65',
    userLimitId: 'limit-reset-1',
    type: LimitType.DEPOSIT,
    currencyCode: 'SEK',
    userId: 'acc-test-user-1',
    value: '2200',
    activeFrom: 1647946090760,
    status: LimitStatus.ACTIVE,
    ...override,
  }
}

export const testUserLimitItem = (
  override?: Partial<UserLimit>,
): { userId: UserLimit['userId']; userLimitId: UserLimit['userLimitId']; data: UserLimit } => {
  return {
    userId: override?.userId || 'acc-test-user-1',
    userLimitId: override?.userLimitId || 'limit-reset-1',
    data: testUserLimit(override),
  }
}
