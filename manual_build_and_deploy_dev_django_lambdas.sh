# We only use this for debugging tricky Lambda-only issues that we can't solve in local dev within Docker
# i.e. Issues caused by or related to the Lambda and AWS environment, rather than Python or Django issues.

docker build -t 429260965153.dkr.ecr.ap-southeast-2.amazonaws.com/aws-keithmoss/development/mapa-django-lambdas:latest ./django

aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin 429260965153.dkr.ecr.ap-southeast-2.amazonaws.com

docker push 429260965153.dkr.ecr.ap-southeast-2.amazonaws.com/aws-keithmoss/development/mapa-django-lambdas --all-tags

aws lambda update-function-code --function-name Mapa-Development-Django-App-Lambda --image-uri 429260965153.dkr.ecr.ap-southeast-2.amazonaws.com/aws-keithmoss/development/mapa-django-lambdas:latest --region ap-southeast-2

aws lambda update-function-code --function-name Mapa-Development-Django-Cron-Lambda --image-uri 429260965153.dkr.ecr.ap-southeast-2.amazonaws.com/aws-keithmoss/development/mapa-django-lambdas:latest --region ap-southeast-2