import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

const localConfig = {
  region: 'eu-west-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
  forcePathStyle: true,
}

export const dynamodb = new DynamoDB(localConfig)
export const documentClient = DynamoDBDocument.from(dynamodb, {
  marshallOptions: { removeUndefinedValues: true },
})
