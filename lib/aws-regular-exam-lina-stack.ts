import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "node:path";
import {LambdaIntegration, RestApi} from "aws-cdk-lib/aws-apigateway";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";
import {Subscription, SubscriptionProtocol, Topic} from "aws-cdk-lib/aws-sns";
import {ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {Tags} from "aws-cdk-lib";
import {BaseFunction} from "./functions";

export class AwsRegularExamLinaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const invalidJsonTable = new Table(this, 'invalidJsonTable', {
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'SK',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST
    });

    Tags.of(invalidJsonTable).add('Name', 'invalidJsonTable');
    Tags.of(invalidJsonTable).add('Environment', 'prod');
    Tags.of(invalidJsonTable).add('Owner', 'lina');

    const topic = new Topic(this, 'SisiTopic');
    const subscription = new Subscription(this, 'SisiSubscription', {
      topic,
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'zlatelina.kazakova@gmail.com'
    })

    Tags.of(topic).add('Name', 'SisiTopic');
    Tags.of(topic).add('Environment', 'prod');
    Tags.of(topic).add('Owner', 'lina');

    const deleteTopic = new Topic(this, 'DeleteTopic');
    const deleteSubscription = new Subscription(this, 'DeleteSubscription', {
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'zlatelina.kazakova@gmail.com',
      topic: deleteTopic
    })

    Tags.of(deleteTopic).add('Name', 'DeleteTopic');
    Tags.of(deleteTopic).add('Environment', 'prod');
    Tags.of(deleteTopic).add('Owner', 'lina');

    const environmentProps1 = {
      topic: topic.topicName
    }

    const validateJsonLambdaFunction = new BaseFunction(this, 'validateJsonLambdaFunction', environmentProps1)

    invalidJsonTable.grantWriteData(validateJsonLambdaFunction);

    Tags.of(validateJsonLambdaFunction).add('Name', 'validateJsonLambdaFunction');
    Tags.of(validateJsonLambdaFunction).add('Environment', 'prod');
    Tags.of(validateJsonLambdaFunction).add('Owner', 'lina');

    const environmentProps2 = {
      topic: deleteTopic.topicName
    }

    const deleteElementLambdaFunction = new BaseFunction(this, 'deleteElementLambdaFunction', environmentProps2)

    deleteElementLambdaFunction.addPermission('AllowEventBridgeRuleInvoke', {
      principal: new ServicePrincipal('events.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: `arn:aws:events:${this.region}:${this.account}:rule/*`
    })

    Tags.of(deleteElementLambdaFunction).add('Name', 'deleteElementLambdaFunction');
    Tags.of(deleteElementLambdaFunction).add('Environment', 'prod');
    Tags.of(deleteElementLambdaFunction).add('Owner', 'lina');

    const api = new RestApi(this, 'validateJsonLambdaApi');
    const resource = api.root.addResource('json');
    resource.addMethod('POST', new LambdaIntegration(validateJsonLambdaFunction, {
      proxy: true
    }));

    Tags.of(api).add('Name', 'validateJsonLambdaApi');
    Tags.of(api).add('Environment', 'prod');
    Tags.of(api).add('Owner', 'lina');
  }
}
