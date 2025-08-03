import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import {DeleteItemCommand, DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {EventBridgeEvent} from "aws-lambda";


const snsClient = SNSClient;
const ddb = new DynamoDBClient();

export const handler = async (event: EventBridgeEvent<string, string>) => {
    console.log(JSON.stringify(event));

    const {jsonUuid, valid, value} = event["detail-type"];

    const tableName = process.env.TABLE_NAME;
    const topicArn = process.env.SNS_TOPIC;

    await snsClient.send(new PublishCommand({
        TopicArn: topicArn,
        Subject: "Deleted Element",
        Message: "Deleted Element"
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
        },
    }))


    return {
        statusCode: 200,
        body: JSON.stringify({})
    };
};