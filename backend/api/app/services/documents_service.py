import json

import boto3

from app.core.config import get_settings


settings = get_settings()

lambda_client = boto3.client(
    "lambda",
    region_name=settings.aws_region,
)


def extract_document_text(
    object_key: str,
) -> str:
    response = lambda_client.invoke(
        FunctionName=settings.documents_function_name,
        InvocationType="RequestResponse",
        Payload=json.dumps(
            {
                "action": "extract_text",
                "object_key": object_key,
            }
        ).encode("utf-8"),
    )

    payload = json.loads(
        response["Payload"]
        .read()
        .decode("utf-8")
    )

    if "FunctionError" in response:
        raise RuntimeError(
            "La función de documentos produjo "
            "un error interno."
        )

    if not payload.get("success"):
        raise RuntimeError(
            payload.get(
                "error",
                "No se pudo procesar el documento.",
            )
        )

    return payload["text"]

def generate_upload_url(
    file_name: str,
    content_type: str,
) -> dict:
    response = lambda_client.invoke(
        FunctionName=settings.documents_function_name,
        InvocationType="RequestResponse",
        Payload=json.dumps(
            {
                "action": "generate_upload_url",
                "file_name": file_name,
                "content_type": content_type,
            }
        ).encode("utf-8"),
    )

    payload = json.loads(
        response["Payload"]
        .read()
        .decode("utf-8")
    )

    if "FunctionError" in response:
        raise RuntimeError(
            "La función de documentos produjo "
            "un error interno."
        )

    if not payload.get("success"):
        raise ValueError(
            payload.get(
                "error",
                "No se pudo generar la URL de subida.",
            )
        )

    return payload

