import { Context, KinesisStreamEvent } from 'aws-lambda'
import { handler } from '../index'
import { DynamoDb } from '../repository/userLimit'
import { Payload, UserLimitEvent } from '../types/event'

export const eventsToKinesisStreamEvent = <T extends Payload>(
  events: UserLimitEvent<T>[],
): KinesisStreamEvent => {
  return {
    Records: events.map((event) => ({
      kinesis: {
        kinesisSchemaVersion: '1.0',
        partitionKey: '1',
        sequenceNumber: '49590338271490256608559692538361571095921575989136588898',
        data: Buffer.from(JSON.stringify(event)).toString('base64'),
        approximateArrivalTimestamp: 1545084650.987,
      },
      eventSource: 'aws:kinesis',
      eventVersion: '1.0',
      eventID: 'shardId-000000000006:49590338271490256608559692538361571095921575989136588898',
      eventName: 'aws:kinesis:record',
      invokeIdentityArn: 'arn:aws:iam::111122223333:role/lambda-kinesis-role',
      awsRegion: 'us-east-2',
      eventSourceARN: 'arn:aws:kinesis:us-east-2:111122223333:stream/lambda-stream',
    })),
  }
}

export const invokeLambda = async (streamEvent: KinesisStreamEvent) => {
  handler(streamEvent, {} as Context, () => {})
}

export const dynamoStorage = new DynamoDb()
