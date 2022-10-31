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

const get: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const params = 
  {
    TableName: process.env.DYNAMO_TABLE,
    Key: 
    {
      id: event.pathParameters.id,
    },
  };

  const result = await dynamoDb.get(params).promise()
  console.log(JSON.stringify(result));

  if(result.Item.streamCount <= 3)
  {
    const updateParams = 
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
    await dynamoDb.update(updateParams).promise()
    return formatJSONResponse({
      message: `Happy streaming!`,
      event,
    });
  }
  return;
};

export const main = middyfy(get);
