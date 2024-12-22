#!/bin/bash
aws $AWS_ENDPOINT dynamodb create-table \
  --table-name local-user-limit \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S AttributeName=userLimitId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH AttributeName=userLimitId,KeyType=RANGE \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5