import json
import os

import boto3


lambda_client = boto3.client("lambda")


def invoke_lambda(function_name: str, arguments: dict) -> dict:
    response = lambda_client.invoke(
        FunctionName=function_name,
        InvocationType="RequestResponse",
        Payload=json.dumps(arguments).encode("utf-8")
    )

    payload = json.loads(
        response["Payload"].read().decode("utf-8")
    )

    if "FunctionError" in response:
        return {
            "success": False,
            "error": (
                f"La función {function_name} produjo "
                "un error interno."
            )
        }

    return payload


def execute_tool(tool_name: str, arguments: dict) -> dict:
    if tool_name == "actualizar_contacto_en_hubspot":
        return invoke_lambda(
            function_name=os.environ["HUBSPOT_FUNCTION_NAME"],
            arguments=arguments
        )

    if tool_name == "crear_ticket_en_jira":
        return invoke_lambda(
            function_name=os.environ["JIRA_FUNCTION_NAME"],
            arguments=arguments
        )

    return {
        "success": False,
        "error": f"Herramienta no implementada: {tool_name}"
    }