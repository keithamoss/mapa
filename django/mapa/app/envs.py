from os import environ


def is_development():
    return environ.get("ENVIRONMENT") == "DEVELOPMENT"

def is_staging():
    return environ.get("ENVIRONMENT") == "STAGING"

def is_production():
    return environ.get("ENVIRONMENT") == "PRODUCTION"

def is_running_in_aws_lambda():
    return environ.get("AWS_LAMBDA_DEPLOYMENT") == "TRUE"

def are_management_tasks_allowed():
    return environ.get("ALLOW_MANAGEMENT_API") == "TRUE"