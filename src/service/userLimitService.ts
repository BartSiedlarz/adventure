import { calculateProgress } from '../helpers'
import { Storage } from '../repository/userLimit'
import {
  ChangeLimitEventPayload,
  CreateLimitEventPayload,
  ResetLimitEventPayload,
  UserLimitEvent,
} from '../types/event'

const isCreateLimitEvent = (
  event: UserLimitEvent,
): event is UserLimitEvent<CreateLimitEventPayload> => event.type === 'USER_LIMIT_CREATED'

const isChangeProgressLimitEvent = (
  event: UserLimitEvent,
): event is UserLimitEvent<ChangeLimitEventPayload> => event.type === 'USER_LIMIT_PROGRESS_CHANGED'

const isResetLimitEvent = (
  event: UserLimitEvent,
): event is UserLimitEvent<ResetLimitEventPayload> => event.type === 'USER_LIMIT_RESET'

export class UserLimitService {
  constructor(private storage: Storage) {}

  async processUserEvents(events: UserLimitEvent[]): Promise<void> {
    for await (const event of events) {
      if (isCreateLimitEvent(event)) {
        await this.storage.createUserLimit(event)
      }
      if (isChangeProgressLimitEvent(event)) {
        const {
          payload: { userId, userLimitId, remainingAmount },
          createdAt,
        } = event

        const userLimit = await this.storage.getUserLimit(userId, userLimitId)
        if (!userLimit) {
          throw new Error(`User limit for user ${userId} not found`)
        }

        await this.storage.updateUserLimit({
          userId,
          userLimitId,
          createdAt: createdAt,
          progress: calculateProgress(userLimit.value, remainingAmount),
        })
      }
      if (isResetLimitEvent(event)) {
        const {
          payload: { userId, userLimitId },
          createdAt,
        } = event

        await this.storage.updateUserLimit({
          userId,
          userLimitId,
          createdAt: createdAt,
          progress: '0',
        })
      }
    }
  }
}
