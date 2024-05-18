# We only use this the first time we create the a stack and need to shove an image into ECR to allow MapaAppStack to be created.
# IMPORTANT: Change /[env]/ as required

docker build -t 429260965153.dkr.ecr.ap-southeast-2.amazonaws.com/aws-keithmoss/[env]/mapa-django-lambdas:latest ./django

aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin 429260965153.dkr.ecr.ap-southeast-2.amazonaws.com

docker push 429260965153.dkr.ecr.ap-southeast-2.amazonaws.com/aws-keithmoss/[env]/mapa-django-lambdas:latest