import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';

import schema from './schema';

const dynamoDb = new DynamoDB.DocumentClient(
  {
    region: process.env.AWS_REGION
  }
)

const update: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const params = 
  {
    TableName: process.env.DYNAMO_TABLE,
    Key: 
    {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      '#streamCount': 'streamCount',
    },
    ExpressionAttributeValues: {
      ':streamCount': event.body.streamCount + 1,
    },
    UpdateExpression: 'SET #streamCount = :streamCount',
    ReturnValues: 'ALL_NEW',
  };
  
  //fetch user from the database
  const result = await dynamoDb.update(params).promise()
  return formatJSONResponse({
    message: `${result.$response}`,
    event,
  });
};

export const main = middyfy(update);
