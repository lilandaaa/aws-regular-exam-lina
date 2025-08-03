import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "node:path";
import {LambdaIntegration, RestApi} from "aws-cdk-lib/aws-apigateway";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";
import {Subscription, SubscriptionProtocol, Topic} from "aws-cdk-lib/aws-sns";
import {ServicePrincipal} from "aws-cdk-lib/aws-iam";

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

    const topic = new Topic(this, 'SisiTopic');
    const subscription = new Subscription(this, 'SisiSubscription', {
      topic,
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'zlatelina.kazakova@gmail.com'
    })

    const validateJsonLambdaFunction = new NodejsFunction(this, 'validateJsonLambdaFunction', {
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../src/validateJsonLambdaFunction.ts'),
    });

    invalidJsonTable.grantWriteData(validateJsonLambdaFunction);

    const deleteElementLambdaFunction = new NodejsFunction(this, 'deleteElementLambdaFunction', {
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../src/deleteElementLambdaFunction.ts'),
    });

    deleteElementLambdaFunction.addPermission('AllowEventBridgeRuleInvoke', {
      principal: new ServicePrincipal('events.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: `arn:aws:events:${this.region}:${this.account}:rule/*`
    })

    const api = new RestApi(this, 'validateJsonLambdaApi');
    const resource = api.root.addResource('json');
    resource.addMethod('POST', new LambdaIntegration(validateJsonLambdaFunction, {
      proxy: true
    }));
  }
}
