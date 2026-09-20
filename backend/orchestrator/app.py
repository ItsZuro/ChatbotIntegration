import json
import os

import boto3

from openai_service import (
    continue_after_tool_calls,
    process_message
)
from tool_executor import execute_tool


secrets_client = boto3.client("secretsmanager")

MAX_TOOL_ROUNDS = 5


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
                "body": json.dumps(
                    {
                        "message": "El campo 'message' es obligatorio."
                    },
                    ensure_ascii=False
                )
            }

        api_key = get_openai_api_key()

        assistant_result = process_message(
            api_key=api_key,
            user_message=message
        )

        executed_tools = []
        tool_round = 0

        while assistant_result["type"] == "function_call":
            if tool_round >= MAX_TOOL_ROUNDS:
                return {
                    "statusCode": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": json.dumps(
                        {
                            "message": (
                                "Se alcanzó el límite de ejecuciones "
                                "de herramientas."
                            )
                        },
                        ensure_ascii=False
                    )
                }

            tool_outputs = []

            for function_call in assistant_result["function_calls"]:
                tool_name = function_call["name"]
                arguments = function_call["arguments"]

                tool_result = execute_tool(
                    tool_name=tool_name,
                    arguments=arguments
                )

                executed_tools.append({
                    "name": tool_name,
                    "result": tool_result
                })

                tool_outputs.append({
                    "call_id": function_call["call_id"],
                    "result": tool_result
                })

            assistant_result = continue_after_tool_calls(
                api_key=api_key,
                previous_response_id=assistant_result["response_id"],
                tool_outputs=tool_outputs
            )

            tool_round += 1

        response_body = {
            "type": assistant_result["type"],
            "response_id": assistant_result["response_id"],
            "response": assistant_result["response"],
            "executed_tools": executed_tools
        }

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(
                response_body,
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
            "body": json.dumps(
                {
                    "message": "No se pudo procesar la solicitud.",
                    "error_type": type(error).__name__
                },
                ensure_ascii=False
            )
        }