import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';
import get from '@functions/get';

const serverlessConfiguration: AWS = {
  service: 'aws-nodejs-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    iamRoleStatements: 
    [
      {
        Effect:'Allow',
        Action:['dynamodb:UpdateItem', 'dynamodb:GetItem'],
        Resource:'arn:aws:dynamodb:${aws:region}:${self:provider.environment.AWS_ACCOUNT_ID}:table/${self:provider.environment.DYNAMO_TABLE}'
      }
    ],
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      DYNAMO_TABLE:'streams',
      AWS_ACCOUNT_ID: '152503629593',
      AWS_REGION: 'us-east-1',
    },
  },
  // import the function via paths
  functions: { hello, get },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  resources:{
    Resources:{
      streamsTable:{
        Type:"AWS::DynamoDB::Table",
        Properties:{
          TableName:"streams",
          AttributeDefinitions:[
            {AttributeName:'id', AttributeType:'N'}
          ],
          KeySchema:[
            {AttributeName:'id', KeyType:'HASH'}
          ],
          BillingMode:'PAY_PER_REQUEST',
        },
      }
    }
  }
};

module.exports = serverlessConfiguration;
