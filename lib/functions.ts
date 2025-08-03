import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";
import {Construct} from "constructs";
import {Runtime} from "aws-cdk-lib/aws-lambda";


interface BaseFunctionProps {
    topic: string;
}

export class BaseFunction extends NodejsFunction {
    constructor(scope: Construct, id: string, props?: BaseFunctionProps) {
        super(scope, id, {
            ...props,
            handler: 'handler',
            runtime: Runtime.NODEJS_20_X,
            entry: path.join(__dirname, `../src/${id}.ts`),
        });
    }
}