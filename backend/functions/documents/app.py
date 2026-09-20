import json
import os
import uuid
from datetime import datetime, timezone

import boto3


s3_client = boto3.client("s3")

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
}

PRESIGNED_URL_EXPIRATION = 900


def lambda_handler(event, context):
    try:
        file_name = event.get("file_name")
        content_type = event.get("content_type")

        if not file_name or not content_type:
            return {
                "success": False,
                "error": "file_name y content_type son obligatorios"
            }

        if content_type not in ALLOWED_CONTENT_TYPES:
            return {
                "success": False,
                "error": "Tipo de archivo no permitido"
            }

        bucket_name = os.environ["DOCUMENTS_BUCKET"]

        now = datetime.now(timezone.utc)

        unique_id = str(uuid.uuid4())

        safe_file_name = os.path.basename(file_name)

        object_key = (
            f"uploads/{now.year}/"
            f"{now.month:02d}/"
            f"{unique_id}-{safe_file_name}"
        )

        upload_url = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": bucket_name,
                "Key": object_key,
                "ContentType": content_type
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION
        )

        return {
            "success": True,
            "bucket": bucket_name,
            "object_key": object_key,
            "upload_url": upload_url,
            "expires_in": PRESIGNED_URL_EXPIRATION
        }

    except Exception as error:
        print(
            f"Document upload URL error: "
            f"{type(error).__name__}"
        )

        return {
            "success": False,
            "error": "No se pudo generar la URL de carga",
            "error_type": type(error).__name__
        }