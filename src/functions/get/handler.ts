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
  //fetch user from the database
  const result = await dynamoDb.get(params).promise()
  if(result.Item.streamCount < 3)
  {
    try {
      const updateParams = 
      {
        TableName: process.env.DYNAMO_TABLE,
        Key:
        { 
          id: event.pathParameters.id
        },
        UpdateExpression: 'set streamCount = streamCount + :val',
        ExpressionAttributeValues: {
          ":val": 1
        },
        ReturnValues: "UPDATED_NEW"

      }
      await dynamoDb.update(updateParams).promise()
    } catch (error) {
      return error;
    }
    return formatJSONResponse({
      message: `Hello ${event.headers.Host}, welcome to the exciting Serverless world!`,
      event,
    });
  }
  
};

export const main = middyfy(get);
