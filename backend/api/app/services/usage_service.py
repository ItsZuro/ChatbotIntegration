from datetime import (
    datetime,
    timedelta,
)
from zoneinfo import ZoneInfo

import boto3

from botocore.exceptions import (
    ClientError,
)

from app.core.config import (
    get_settings,
)


settings = get_settings()


dynamodb_client = boto3.client(
    "dynamodb",
    region_name=settings.aws_region,
)


class UsageLimitExceeded(
    Exception
):
    pass


def _build_update(
    user_id: str,
    resource: str,
    window: str,
    bucket: str,
    limit: int,
    expires_at: int,
) -> dict:
    return {
        "Update": {
            "TableName":
                settings.usage_table_name,

            "Key": {
                "pk": {
                    "S":
                        f"USER#{user_id}"
                },
                "sk": {
                    "S": (
                        f"USAGE#{resource}"
                        f"#{window}"
                        f"#{bucket}"
                    )
                },
            },

            "UpdateExpression": (
                "SET #count = "
                "if_not_exists("
                "#count, :zero"
                ") + :one, "
                "expires_at = :expires_at"
            ),

            "ConditionExpression": (
                "attribute_not_exists("
                "#count"
                ") OR #count < :limit"
            ),

            "ExpressionAttributeNames": {
                "#count": "count",
            },

            "ExpressionAttributeValues": {
                ":zero": {
                    "N": "0"
                },
                ":one": {
                    "N": "1"
                },
                ":limit": {
                    "N": str(limit)
                },
                ":expires_at": {
                    "N": str(
                        expires_at
                    )
                },
            },
        }
    }


def consume_request_quota(
    user_id: str,
    resource: str,
    minute_limit: int,
    daily_limit: int,
) -> None:
    timezone = ZoneInfo(
        settings.usage_time_zone
    )

    now = datetime.now(
        timezone
    )

    minute_bucket = (
        now.strftime(
            "%Y-%m-%dT%H:%M"
        )
    )

    day_bucket = (
        now.strftime(
            "%Y-%m-%d"
        )
    )

    expires_at = int(
        (
            now
            + timedelta(
                days=2
            )
        ).timestamp()
    )

    transaction_items = [
        _build_update(
            user_id=user_id,
            resource=resource,
            window="MINUTE",
            bucket=minute_bucket,
            limit=minute_limit,
            expires_at=expires_at,
        ),
        _build_update(
            user_id=user_id,
            resource=resource,
            window="DAY",
            bucket=day_bucket,
            limit=daily_limit,
            expires_at=expires_at,
        ),
    ]

    try:
        dynamodb_client.transact_write_items(
            TransactItems=(
                transaction_items
            )
        )

    except ClientError as exc:
        error_code = (
            exc.response
            .get(
                "Error",
                {},
            )
            .get(
                "Code"
            )
        )

        if (
            error_code
            == "TransactionCanceledException"
        ):
            cancellation_reasons = (
                exc.response.get(
                    "CancellationReasons",
                    [],
                )
            )

            minute_exceeded = (
                len(cancellation_reasons) > 0
                and cancellation_reasons[0]
                .get("Code")
                == "ConditionalCheckFailed"
            )

            daily_exceeded = (
                len(cancellation_reasons) > 1
                and cancellation_reasons[1]
                .get("Code")
                == "ConditionalCheckFailed"
            )

            # Si ambos están agotados,
            # mostramos primero el diario,
            # porque esperar un minuto
            # no solucionaría nada.
            if daily_exceeded:
                raise UsageLimitExceeded(
                    "Has alcanzado tu "
                    "límite diario de uso."
                ) from exc

            if minute_exceeded:
                raise UsageLimitExceeded(
                    "Has realizado demasiadas "
                    "solicitudes en poco tiempo. "
                    "Espera un minuto e "
                    "inténtalo nuevamente."
                ) from exc

            raise UsageLimitExceeded(
                "Has alcanzado el "
                "límite de uso permitido."
            ) from exc

        raise

def _get_usage_count(
    user_id: str,
    resource: str,
    window: str,
    bucket: str,
) -> int:
    response = dynamodb_client.get_item(
        TableName=settings.usage_table_name,
        Key={
            "pk": {
                "S": f"USER#{user_id}"
            },
            "sk": {
                "S": (
                    f"USAGE#{resource}"
                    f"#{window}"
                    f"#{bucket}"
                )
            },
        },
        ConsistentRead=True,
    )

    item = response.get("Item")

    if not item:
        return 0

    count = item.get(
        "count",
        {},
    ).get(
        "N",
        "0",
    )

    return int(count)


def get_usage_summary(
    user_id: str,
) -> dict:
    timezone = ZoneInfo(
        settings.usage_time_zone
    )

    now = datetime.now(
        timezone
    )

    day_bucket = now.strftime(
        "%Y-%m-%d"
    )

    resources = {
        "assistant": (
            settings
            .assistant_requests_per_day
        ),
        "audio": (
            settings
            .audio_requests_per_day
        ),
        "realtime": (
            settings
            .realtime_sessions_per_day
        ),
    }

    usage = {}

    for resource, limit in (
        resources.items()
    ):
        used = _get_usage_count(
            user_id=user_id,
            resource=resource,
            window="DAY",
            bucket=day_bucket,
        )

        usage[resource] = {
            "used": used,
            "limit": limit,
            "remaining": max(
                0,
                limit - used,
            ),
        }

    return {
        "date": day_bucket,
        "time_zone": (
            settings.usage_time_zone
        ),
        "usage": usage,
    }
