import type {
  QueryCommandInput,
  ReturnValuesOnConditionCheckFailure,
} from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommandInput,
  GetCommandInput,
  PutCommandInput,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'

const TABLE_NAME = 'local-user-limit'

export class DynamoDbBuilder {
  private tableName: string
  private item: Record<string, unknown> | undefined
  private key: Record<string, unknown> | undefined
  private keyConditionExpression: string | undefined
  private expressionAttributeValues: { key: string; value: unknown }[] = []
  private updateExpressions: string[] = []
  private conditionExpressions: string[] = []
  private expressionAttributeNames: { key: string; value: unknown }[] = []
  private returnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure | undefined
  private batchWriteDeleteItems: {
    DeleteRequest: { Key: Record<string, unknown> }
  }[] = []

  constructor() {
    this.tableName = TABLE_NAME
  }

  public setItem(item: Record<string, unknown>): this {
    this.item = item
    return this
  }

  public setKey(key: Record<string, unknown>): this {
    this.key = key
    return this
  }

  public setKeyConditionExpression(condition: string): this {
    this.keyConditionExpression = condition
    return this
  }

  public setConditionExpression(expression: string): this {
    if (this.conditionExpressions.length) {
      this.conditionExpressions.push('AND')
    }

    this.conditionExpressions.push(expression)

    return this
  }

  public setUpdateExpression(expression: string): this {
    this.updateExpressions.push(expression)

    return this
  }

  public setExpressionAttributeValue(value: { key: string; value: unknown }): this {
    this.expressionAttributeValues.push(value)

    return this
  }

  public setExpressionAttributeNames(value: { key: string; value: unknown }): this {
    this.expressionAttributeNames.push(value)

    return this
  }

  public setReturnValuesOnConditionCheckFailure(
    returnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure,
  ) {
    this.returnValuesOnConditionCheckFailure = returnValuesOnConditionCheckFailure
    return this
  }

  public setBatchWriteDelete(batchWriteDeleteItem: {
    DeleteRequest: { Key: Record<string, unknown> }
  }) {
    this.batchWriteDeleteItems.push(batchWriteDeleteItem)
    return this
  }

  public buildPut(): PutCommandInput {
    return {
      TableName: this.tableName,
      Item: this.item,
      ConditionExpression: this.conditionExpressions.join(' '),
      ReturnValuesOnConditionCheckFailure: this.returnValuesOnConditionCheckFailure,
    }
  }

  public buildUpdate(): UpdateCommandInput {
    return {
      TableName: this.tableName,
      Key: this.key,
      ConditionExpression: this.conditionExpressions.join(' '),
      UpdateExpression: `SET ${this.updateExpressions.join(', ')}`,
      ExpressionAttributeValues: this.expressionAttributeValues.reduce(
        (acc, { key, value }) => ({ ...acc, [key]: value }),
        {},
      ),
      ExpressionAttributeNames: this.expressionAttributeNames.reduce(
        (acc, { key, value }) => ({ ...acc, [key]: value }),
        {},
      ),
    }
  }

  public buildGet(): GetCommandInput {
    return {
      TableName: this.tableName,
      Key: this.key,
    }
  }

  public buildQuery(): QueryCommandInput {
    return {
      TableName: this.tableName,
      KeyConditionExpression: this.keyConditionExpression,
      ExpressionAttributeValues: this.expressionAttributeValues.reduce(
        (acc, { key, value }) => ({ ...acc, [key]: value }),
        {},
      ),
    }
  }

  public buildBatchWrite(): BatchWriteCommandInput {
    return {
      RequestItems: {
        [this.tableName]: this.batchWriteDeleteItems.map((item) => item),
      },
    }
  }
}
