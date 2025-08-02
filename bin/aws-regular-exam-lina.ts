import * as cdk from 'aws-cdk-lib';
import { AwsRegularExamLinaStack } from '../lib/aws-regular-exam-lina-stack';

const app = new cdk.App();
new AwsRegularExamLinaStack(app, 'AwsRegularExamLinaStack', {
});