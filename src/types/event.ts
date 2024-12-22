import { LimitPeriod, LimitStatus, LimitType } from './user-limit'

type EventPayload = {
  brandId: string
  currencyCode: string
  nextResetTime: number
  userId: string
  userLimitId: string
}

export type CreateLimitEventPayload = EventPayload & {
  activeFrom: number
  period: keyof typeof LimitPeriod
  status: keyof typeof LimitStatus
  type: keyof typeof LimitType
  value: string
}

export type ChangeLimitEventPayload = EventPayload & {
  amount: string
  previousProgress: string
  remainingAmount: string
}

export type ResetLimitEventPayload = EventPayload & {
  period: keyof typeof LimitPeriod
  resetAmount: string
  resetPercentage: string
  type: keyof typeof LimitType
  unusedAmount: string
}

type EventType =
  | 'USER_LIMIT_CREATED'
  | 'USER_LIMIT_PROGRESS_CHANGED'
  | 'USER_LIMIT_RESET'
  | 'LIMIT_USER_PENDING_PAYMENT_CREATED'

export type Payload =
  | CreateLimitEventPayload
  | ChangeLimitEventPayload
  | ResetLimitEventPayload
  | EventPayload

export type UserLimitEvent<T extends Payload = EventPayload> = Record<string, unknown> & {
  type: EventType
  aggregateId: string
  createdAt: number
  payload: T
}
