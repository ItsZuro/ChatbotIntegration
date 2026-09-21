import json
from datetime import datetime, timezone

import boto3

from app.core.config import get_settings


settings = get_settings()

dynamodb = boto3.resource(
    "dynamodb",
    region_name=settings.aws_region,
)

audit_table = dynamodb.Table(
    settings.audit_table_name
)


def write_audit_record(
    request_id: str,
    user_id: str,
    user_message: str | None,
    status: str,
    response_id: str | None = None,
    final_response: str | None = None,
    executed_tools: list | None = None,
    error_type: str | None = None,
) -> None:
    try:
        item = {
            "request_id": request_id,
            "user_id": user_id,
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),
            "status": status,
            "user_message": user_message or "",
            "executed_tools": json.dumps(
                executed_tools or [],
                ensure_ascii=False,
            ),
        }

        if response_id:
            item["response_id"] = response_id

        if final_response:
            item["final_response"] = final_response

        if error_type:
            item["error_type"] = error_type

        audit_table.put_item(
            Item=item
        )

    except Exception as audit_error:
        print(
            "Audit error: "
            f"{type(audit_error).__name__}"
        )