import secrets
import time
from datetime import (
    datetime,
    timezone,
)

import boto3

from app.core.config import (
    get_settings,
)


settings = get_settings()


dynamodb = boto3.resource(
    "dynamodb",
    region_name=settings.aws_region,
)

integrations_table = dynamodb.Table(
    settings.integrations_table_name
)


GOOGLE_PROVIDER = "GOOGLE_CALENDAR"

OAUTH_STATE_TTL_SECONDS = 600


def create_google_oauth_state(
    user_id: str,
) -> str:
    state = secrets.token_urlsafe(
        32
    )

    expires_at = (
        int(time.time())
        + OAUTH_STATE_TTL_SECONDS
    )

    integrations_table.put_item(
        Item={
            "pk": (
                f"OAUTH#{state}"
            ),
            "sk": "STATE",
            "entity_type":
                "oauth_state",
            "provider":
                GOOGLE_PROVIDER,
            "user_id":
                user_id,
            "expires_at":
                expires_at,
        }
    )

    return state


def consume_google_oauth_state(
    state: str,
) -> str | None:
    response = (
        integrations_table.delete_item(
            Key={
                "pk": f"OAUTH#{state}",
                "sk": "STATE",
            },
            ReturnValues="ALL_OLD",
        )
    )

    item = response.get(
        "Attributes"
    )

    if not item:
        return None

    expires_at = int(
        item.get(
            "expires_at",
            0,
        )
    )

    if expires_at < int(
        time.time()
    ):
        return None

    if (
        item.get("provider")
        != GOOGLE_PROVIDER
    ):
        return None

    return item.get(
        "user_id"
    )


def save_google_integration(
    user_id: str,
    refresh_token: str,
    scope: str | None = None,
) -> dict:
    now = datetime.now(
        timezone.utc
    ).isoformat()

    item = {
        "pk": (
            f"USER#{user_id}"
        ),
        "sk": GOOGLE_PROVIDER,

        "entity_type":
            "integration",

        "provider":
            GOOGLE_PROVIDER,

        "refresh_token":
            refresh_token,

        "connected_at":
            now,

        "updated_at":
            now,
    }

    if scope:
        item["scope"] = scope

    integrations_table.put_item(
        Item=item
    )

    return {
        "provider":
            GOOGLE_PROVIDER,
        "connected": True,
        "connected_at":
            now,
    }


def get_google_integration(
    user_id: str,
) -> dict | None:
    response = (
        integrations_table.get_item(
            Key={
                "pk": (
                    f"USER#{user_id}"
                ),
                "sk":
                    GOOGLE_PROVIDER,
            },
            ConsistentRead=True,
        )
    )

    return response.get(
        "Item"
    )


def get_google_refresh_token(
    user_id: str,
) -> str | None:
    integration = (
        get_google_integration(
            user_id=user_id
        )
    )

    if not integration:
        return None

    return integration.get(
        "refresh_token"
    )


def delete_google_integration(
    user_id: str,
) -> None:
    integrations_table.delete_item(
        Key={
            "pk": (
                f"USER#{user_id}"
            ),
            "sk":
                GOOGLE_PROVIDER,
        }
    )


def get_google_integration_status(
    user_id: str,
) -> dict:
    integration = (
        get_google_integration(
            user_id=user_id
        )
    )

    if not integration:
        return {
            "provider":
                GOOGLE_PROVIDER,
            "connected":
                False,
            "connected_at":
                None,
        }

    return {
        "provider":
            GOOGLE_PROVIDER,
        "connected":
            True,
        "connected_at":
            integration.get(
                "connected_at"
            ),
    }