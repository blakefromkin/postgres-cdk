import { RemovalPolicy, Duration, Stack, StackProps } from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export class PostgresCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a vpc
    const vpc = new ec2.Vpc(this, "VPC");

    // Create a database secret
    const pgDatabaseCredentialsSecret = new secretsmanager.Secret(
      this,
      "pgCredentialsSecret",
      {
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ username: "postgres" }),
          generateStringKey: "password",
          excludePunctuation: true,
          excludeCharacters: '/@"',
          includeSpace: false,
          passwordLength: 16,
        },
      }
    );

    // Create the RDS database
    new rds.DatabaseInstance(this, "Graphile-Queue", {
      vpc: vpc,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO
      ),
      backupRetention: Duration.days(0), // disable automatic DB snapshot retention
      deleteAutomatedBackups: true,
      credentials: rds.Credentials.fromSecret(pgDatabaseCredentialsSecret), // Use the generated secret for credentials
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
