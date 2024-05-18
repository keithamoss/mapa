tl;dr Abandoned because it's not worth the yak shaving - and AWS has a better solution (linked below) using permission boundaries.

https://betterdev.blog/cdk-bootstrap-least-deployment-privilege/

aws iam create-policy --policy-name cdkCFExecutionPolicy --policy-document file://cdkCFExecutionPolicy.json

ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
cdk bootstrap aws://$ACCOUNT_ID/eu-west-1 --cloudformation-execution-policies "arn:aws:iam::$ACCOUNT_ID:policy/cdkCFExecutionPolicy"

cdk bootstrap aws://429260965153/ap-southeast-2 --cloudformation-execution-policies "arn:aws:iam::429260965153:policy/cdkCFExecutionPolicy" --context env=staging --profile **FIXME mapa-cdk-role/default**

aws iam create-policy-version --policy-arn arn:aws:iam::429260965153:policy/cdkCFExecutionPolicy --policy-document file://cdkCFExecutionPolicy.json --set-as-default

aws iam list-policy-versions --policy-arn arn:aws:iam::429260965153:policy/cdkCFExecutionPolicy
aws iam delete-policy-version --policy-arn arn:aws:iam::429260965153:policy/cdkCFExecutionPolicy --version-id <VERSION>

Eh, actually, screw it.

Resetting:

cdk bootstrap aws://429260965153/ap-southeast-2 --context env=staging --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess

An alternative approach (from AWS themselves) using permission boundaries: https://aws.amazon.com/blogs/devops/secure-cdk-deployments-with-iam-permission-boundaries/
