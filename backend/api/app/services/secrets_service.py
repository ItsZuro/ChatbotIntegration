import json

import boto3

from app.core.config import get_settings


settings = get_settings()


def get_openai_api_key() -> str:
    client = boto3.client(
        "secretsmanager",
        region_name=settings.aws_region,
    )

    response = client.get_secret_value(
        SecretId=settings.openai_secret_id,
    )

    secret = json.loads(
        response["SecretString"]
    )

    return secret["OPENAI_API_KEY"]