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
    partition_key: str,
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
                    "S": partition_key,
                },
                "sk": {
                    "S": (
                        f"USAGE#{resource}"
                        f"#{window}"
                        f"#{bucket}"
                    ),
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
                    "N": "0",
                },
                ":one": {
                    "N": "1",
                },
                ":limit": {
                    "N": str(limit),
                },
                ":expires_at": {
                    "N": str(
                        expires_at
                    ),
                },
            },
        }
    }


def consume_request_quota(
    user_id: str,
    resource: str,
    minute_limit: int,
    daily_limit: int,
    global_daily_limit: int,
) -> None:
    timezone = ZoneInfo(
        settings.usage_time_zone
    )

    now = datetime.now(
        timezone
    )

    minute_bucket = now.strftime(
        "%Y-%m-%dT%H:%M"
    )

    day_bucket = now.strftime(
        "%Y-%m-%d"
    )

    expires_at = int(
        (
            now
            + timedelta(
                days=2
            )
        ).timestamp()
    )

    effective_daily_limit = (
        get_effective_daily_limit(
            user_id=user_id,
            resource=resource,
            default_limit=daily_limit,
        )
    )

    transaction_items = [
        # 1. Límite por usuario / minuto
        _build_update(
            partition_key=(
                f"USER#{user_id}"
            ),
            resource=resource,
            window="MINUTE",
            bucket=minute_bucket,
            limit=minute_limit,
            expires_at=expires_at,
        ),

        # 2. Límite por usuario / día
        _build_update(
            partition_key=(
                f"USER#{user_id}"
            ),
            resource=resource,
            window="DAY",
            bucket=day_bucket,
            limit=effective_daily_limit,
            expires_at=expires_at,
        ),

        # 3. Límite global / día
        _build_update(
            partition_key=(
                "GLOBAL#OPENAI"
            ),
            resource=resource,
            window="DAY",
            bucket=day_bucket,
            limit=global_daily_limit,
            expires_at=expires_at,
        ),
    ]

    try:
        dynamodb_client.transact_write_items(
            TransactItems=transaction_items
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

            global_exceeded = (
                len(cancellation_reasons) > 2
                and cancellation_reasons[2]
                .get("Code")
                == "ConditionalCheckFailed"
            )

            if global_exceeded:
                raise UsageLimitExceeded(
                    "El límite diario global "
                    "del servicio fue alcanzado. "
                    "Inténtalo nuevamente mañana."
                ) from exc

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
                "S": f"USER#{user_id}",
            },
            "sk": {
                "S": (
                    f"USAGE#{resource}"
                    f"#{window}"
                    f"#{bucket}"
                ),
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

def get_quota_override(
    user_id: str,
) -> dict | None:
    response = dynamodb_client.get_item(
        TableName=settings.usage_table_name,
        Key={
            "pk": {
                "S": f"USER#{user_id}",
            },
            "sk": {
                "S": "QUOTA#OVERRIDE",
            },
        },
        ConsistentRead=True,
    )

    item = response.get("Item")

    if not item:
        return None

    return {
        "assistant": int(
            item.get(
                "assistant_daily",
                {"N": "0"},
            )["N"]
        ),
        "audio": int(
            item.get(
                "audio_daily",
                {"N": "0"},
            )["N"]
        ),
        "realtime": int(
            item.get(
                "realtime_daily",
                {"N": "0"},
            )["N"]
        ),
    }


def set_quota_override(
    user_id: str,
    assistant_daily: int,
    audio_daily: int,
    realtime_daily: int,
) -> dict:
    dynamodb_client.put_item(
        TableName=settings.usage_table_name,
        Item={
            "pk": {
                "S": f"USER#{user_id}",
            },
            "sk": {
                "S": "QUOTA#OVERRIDE",
            },
            "assistant_daily": {
                "N": str(
                    assistant_daily
                ),
            },
            "audio_daily": {
                "N": str(
                    audio_daily
                ),
            },
            "realtime_daily": {
                "N": str(
                    realtime_daily
                ),
            },
        },
    )

    return {
        "assistant":
            assistant_daily,
        "audio":
            audio_daily,
        "realtime":
            realtime_daily,
    }


def delete_quota_override(
    user_id: str,
) -> None:
    dynamodb_client.delete_item(
        TableName=settings.usage_table_name,
        Key={
            "pk": {
                "S": f"USER#{user_id}",
            },
            "sk": {
                "S": "QUOTA#OVERRIDE",
            },
        },
    )


def get_effective_daily_limit(
    user_id: str,
    resource: str,
    default_limit: int,
) -> int:
    override = get_quota_override(
        user_id
    )

    if not override:
        return default_limit

    custom_limit = override.get(
        resource
    )

    if (
        custom_limit is None
        or custom_limit <= 0
    ):
        return default_limit

    return custom_limit


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

        effective_limit = (
            get_effective_daily_limit(
                user_id=user_id,
                resource=resource,
                default_limit=limit,
            )
        )
        
        used = _get_usage_count(
            user_id=user_id,
            resource=resource,
            window="DAY",
            bucket=day_bucket,
        )

        usage[resource] = {
            "used": used,
            "limit":
                effective_limit,

            "remaining": max(
                0,
                effective_limit - used,
            ),
        }

    return {
        "date": day_bucket,
        "time_zone": (
            settings.usage_time_zone
        ),
        "usage": usage,
    }

def get_default_daily_limits() -> dict:
    return {
        "assistant":
            settings
            .assistant_requests_per_day,

        "audio":
            settings
            .audio_requests_per_day,

        "realtime":
            settings
            .realtime_sessions_per_day,
    }


def get_user_quota_settings(
    user_id: str,
) -> dict:
    defaults = (
        get_default_daily_limits()
    )

    override = get_quota_override(
        user_id
    )

    if not override:
        return {
            "user_id": user_id,
            "customized": False,
            "limits": defaults,
            "defaults": defaults,
        }

    return {
        "user_id": user_id,
        "customized": True,
        "limits": {
            "assistant":
                override["assistant"],

            "audio":
                override["audio"],

            "realtime":
                override["realtime"],
        },
        "defaults": defaults,
    }

