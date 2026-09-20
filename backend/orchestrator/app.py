import json
import os

import boto3

from openai_service import process_message


secrets_client = boto3.client("secretsmanager")


def get_openai_api_key():
    secret_id = os.environ["OPENAI_SECRET_ID"]

    response = secrets_client.get_secret_value(
        SecretId=secret_id
    )

    secret = json.loads(response["SecretString"])

    return secret["OPENAI_API_KEY"]


def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        message = body.get("message")

        if not message:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps({
                    "message": "El campo 'message' es obligatorio."
                })
            }

        api_key = get_openai_api_key()

        assistant_result = process_message(
            api_key=api_key,
            user_message=message
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
           "body": json.dumps(
                assistant_result,
                ensure_ascii=False
            )
        }

    except Exception as error:
        print(

            f"Error processing request: {type(error).__name__}"
        )

        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "message": "No se pudo procesar la solicitud.",
                "error_type": type(error).__name__
            })
        }