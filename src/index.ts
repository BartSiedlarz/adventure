import { KinesisStreamEvent, KinesisStreamHandler, KinesisStreamRecord } from 'aws-lambda'
import { Buffer } from 'buffer'
import { logger } from './infra/logger'
import { DynamoDb } from './repository/userLimit'
import { UserLimitService } from './service/userLimitService'
import { UserLimitEvent } from './types/event'

const userLimitService = new UserLimitService(new DynamoDb())

const getEventsPerUsers = (records: KinesisStreamRecord[]) => {
  const userLimitEvents: UserLimitEvent[] = records.map(({ kinesis: { data } }) =>
    JSON.parse(Buffer.from(data, 'base64').toString('utf-8')),
  )

  return userLimitEvents.reduce<Record<string, UserLimitEvent[]>>(
    (acc, record) => ({
      ...acc,
      [record.aggregateId]: [...(acc[record.aggregateId] || []), record],
    }),
    {},
  )
}

const handleErrors = (results: PromiseSettledResult<void>[]) => {
  results.forEach((result) => {
    if (result.status === 'rejected') {
      // we can send failed events to a DLQ
      logger.error(`An error occurred ${result.reason}`, result.reason)
    }
  })
}

export const handler: KinesisStreamHandler = async ({
  Records,
}: KinesisStreamEvent): Promise<void> => {
  logger.debug(`Received ${Records.length} records.`)

  const eventsPerUser = getEventsPerUsers(Records)

  const results = await Promise.allSettled(
    Object.keys(eventsPerUser).map((key) => userLimitService.processUserEvents(eventsPerUser[key])),
  )

  handleErrors(results)

  logger.debug(`Successfully processed ${Records.length} records.`)
}
