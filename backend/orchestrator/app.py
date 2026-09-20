import json
import os
from datetime import datetime, timezone

import boto3

from openai_service import (
    continue_after_tool_calls,
    process_message
)
from tool_executor import execute_tool


secrets_client = boto3.client("secretsmanager")
dynamodb = boto3.resource("dynamodb")

MAX_TOOL_ROUNDS = 5


def get_openai_api_key():
    secret_id = os.environ["OPENAI_SECRET_ID"]

    response = secrets_client.get_secret_value(
        SecretId=secret_id
    )

    secret = json.loads(response["SecretString"])

    return secret["OPENAI_API_KEY"]


def write_audit_record(
    request_id: str,
    user_message: str | None,
    status: str,
    response_id: str | None = None,
    final_response: str | None = None,
    executed_tools: list | None = None,
    error_type: str | None = None
):
    try:
        table_name = os.environ["AUDIT_TABLE_NAME"]
        table = dynamodb.Table(table_name)

        item = {
            "request_id": request_id,
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),
            "status": status,
            "user_message": user_message or "",
            "executed_tools": json.dumps(
                executed_tools or [],
                ensure_ascii=False
            )
        }

        if response_id:
            item["response_id"] = response_id

        if final_response:
            item["final_response"] = final_response

        if error_type:
            item["error_type"] = error_type

        table.put_item(
            Item=item
        )

    except Exception as audit_error:
        print(
            "Audit error: "
            f"{type(audit_error).__name__}"
        )


def lambda_handler(event, context):
    request_id = context.aws_request_id
    message = None

    try:
        body = json.loads(event.get("body") or "{}")

        message = body.get("message")

        if not message:
            write_audit_record(
                request_id=request_id,
                user_message=message,
                status="VALIDATION_ERROR"
            )

            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps(
                    {
                        "request_id": request_id,
                        "message": (
                            "El campo 'message' es obligatorio."
                        )
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
                write_audit_record(
                    request_id=request_id,
                    user_message=message,
                    status="TOOL_LIMIT",
                    response_id=assistant_result.get(
                        "response_id"
                    ),
                    executed_tools=executed_tools
                )

                return {
                    "statusCode": 500,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": json.dumps(
                        {
                            "request_id": request_id,
                            "message": (
                                "Se alcanzó el límite de "
                                "ejecuciones de herramientas."
                            )
                        },
                        ensure_ascii=False
                    )
                }

            tool_outputs = []

            for function_call in assistant_result[
                "function_calls"
            ]:
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
                previous_response_id=assistant_result[
                    "response_id"
                ],
                tool_outputs=tool_outputs
            )

            tool_round += 1

        response_body = {
            "request_id": request_id,
            "type": assistant_result["type"],
            "response_id": assistant_result["response_id"],
            "response": assistant_result["response"],
            "executed_tools": executed_tools
        }

        write_audit_record(
            request_id=request_id,
            user_message=message,
            status="SUCCESS",
            response_id=assistant_result["response_id"],
            final_response=assistant_result["response"],
            executed_tools=executed_tools
        )

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
            f"Error processing request: "
            f"{type(error).__name__}"
        )

        write_audit_record(
            request_id=request_id,
            user_message=message,
            status="ERROR",
            error_type=type(error).__name__
        )

        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(
                {
                    "request_id": request_id,
                    "message": (
                        "No se pudo procesar la solicitud."
                    ),
                    "error_type": type(error).__name__
                },
                ensure_ascii=False
            )
        }