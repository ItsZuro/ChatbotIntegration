import json
import os

import boto3


lambda_client = boto3.client("lambda")


def invoke_hubspot(arguments: dict) -> dict:
    function_name = os.environ["HUBSPOT_FUNCTION_NAME"]

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
            "error": "La función de HubSpot produjo un error interno."
        }

    return payload


def execute_tool(tool_name: str, arguments: dict) -> dict:
    if tool_name == "actualizar_contacto_en_hubspot":
        return invoke_hubspot(arguments)

    return {
        "success": False,
        "error": f"Herramienta no implementada: {tool_name}"
    }