import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import {DeleteItemCommand, DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {EventBridgeEvent} from "aws-lambda";
import {CreateScheduleCommand, SchedulerClient} from "@aws-sdk/client-scheduler";


const snsClient = SNSClient;
const ddb = new DynamoDBClient();
const deleteTime = new Date(Date.now() + 24*60*60*1000).toISOString();

export const handler = async (event: EventBridgeEvent<string, string>) => {
    console.log(JSON.stringify(event));

    const {jsonUuid, valid, value} = event["detail-type"];

    const tableName = process.env.TABLE_NAME;
    const topicArn = process.env.SNS_TOPIC;

    await snsClient.send(new PublishCommand({
        TopicArn: topicArn,
        Subject: "Deleted Element",
        Message: "Deleted Element which lasted for" + deleteTime - isoTime
    }))

    await ddb.send(new DeleteItemCommand({
        TableName: tableName,
        Key: {
            PK:{
                S: `JSON#${jsonUuid}`
            },
            SK: {
                S: `METADATA#${jsonUuid}`
            },
        }
    }))


    return {
        statusCode: 200,
        body: JSON.stringify({})
    };
};