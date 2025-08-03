import {Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import { AwsRegularExamLinaStack } from "../lib/aws-regular-exam-lina-stack";

test('SQS Queue Created', () => {
  const app = new App();
  const stack = new AwsRegularExamLinaStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);

  expect(template).toMatchSnapshot();
});
