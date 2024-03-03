#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PostgresCdkStack } from "../lib/postgres-cdk-stack";

const app = new cdk.App();
new PostgresCdkStack(app, "PostgresCdkStack");
