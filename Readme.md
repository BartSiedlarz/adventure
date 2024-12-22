# Assumptions

- order of processing stream events is crucial in this case and as i'm not aware which partitionId producers uses,
  i've decided to do not process any events with createdAt value lower that was saved in database.
  That also applies for any further messages for this particular user in stream records
- i'v decided to use local DynamoDB as it was not big overhead

# Next steps

- another lambda to consume Kinesis stream, why?
  - this will be very simple lambda with very low risk of failure (but it is good to have a DQL anyway)
  - pick a SQS (based on event type) to which send an event
  - each message will represent one event - we have more control in case of event processing failure
- new user-limit-queue SQS
  - that new handler could listen for messages in that queue
  - DLQ and retry ability

# Local development

- run `yarn`
- run `yarn setup:dynamodb`
- run `yarn dev`
- you can check dynamo db data under that url [Dynamo DB admin](http://localhost:8001/).

# Tests

## Units

run `yarn test`

## Acceptance test

- run `yarn setup:dynamodb`
- run `yarn test:acceptance`
