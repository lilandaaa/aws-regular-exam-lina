import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {CreateScheduleCommand, SchedulerClient} from "@aws-sdk/client-scheduler";
import {APIGatewayProxyEvent} from "aws-lambda";
import * as uuid from "uuid";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";


const ddb = new DynamoDBClient();
const schedulerClient = new SchedulerClient();
const sns = new SNSClient();

export const handler = async (event: APIGatewayProxyEvent) => {
    console.log(JSON.stringify(event));
    const tableName = process.env.TABLE_NAME;

    const { valid, value, description, buyer } = JSON.parse(event.body!);

    if (valid){
        const snsTopic = process.env.SNS_TOPIC;

        await sns.send(new PublishCommand({
            TopicArn: snsTopic,
            Message: JSON.stringify(event.body)
        }))
    }
    else {
        const jsonUuid = uuid.v4();
        await ddb.send(new PutItemCommand({
            TableName: tableName,
            Item: {
                PK: {
                    S: `JSON#${jsonUuid}`
                },
                SK: {
                    S: `METADATA#${jsonUuid}`
                },
                valid: {
                    BOOL: valid
                },
                value: {
                    N: value
                },
                description: {
                    S: description
                },
                buyer: {
                    S: buyer
                }
            }
        }))


        const isoTime = new Date().toISOString();

        const result = await schedulerClient.send(new CreateScheduleCommand({
            Name: `Validate-${jsonUuid}`,
            ScheduleExpression: `at(${isoTime})`,
            Target: {
                Arn: `arn:aws:lambda:${this.region}:${this.account}:function:deleteElementLambdaFunction`,
                Input: JSON.stringify(jsonUuid, valid, value),
                RoleArn: `arn:aws:iam::${this.account}:role/SchedulerInvocationRole`
            },
            FlexibleTimeWindow: {
                Mode: "OFF"
            }
        }))

    }

    return {
        statusCode: 200,
        body: JSON.stringify({})
    };
};