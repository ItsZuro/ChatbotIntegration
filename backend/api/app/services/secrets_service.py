import json

import boto3

from app.core.config import (
    get_settings,
)


settings = get_settings()


secrets_client = boto3.client(
    "secretsmanager",
    region_name=settings.aws_region,
)


def get_json_secret(
    secret_id: str,
) -> dict:
    response = (
        secrets_client
        .get_secret_value(
            SecretId=secret_id,
        )
    )

    return json.loads(
        response[
            "SecretString"
        ]
    )


def get_openai_api_key() -> str:
    secret = get_json_secret(
        settings.openai_secret_id
    )

    return secret[
        "OPENAI_API_KEY"
    ]