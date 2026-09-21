from datetime import datetime, timezone
from uuid import uuid4

import boto3
from boto3.dynamodb.conditions import Key

from app.core.config import get_settings


settings = get_settings()

dynamodb = boto3.resource(
    "dynamodb",
    region_name=settings.aws_region,
)

conversations_table = dynamodb.Table(
    settings.conversations_table_name
)


def create_conversation(
    user_id: str,
    title: str = "Nueva conversación",
) -> dict:
    conversation_id = str(uuid4())

    now = datetime.now(
        timezone.utc
    ).isoformat()

    item = {
        "pk": f"CONV#{conversation_id}",
        "sk": "METADATA",

        "entity_type": "conversation",

        "conversation_id": conversation_id,
        "user_id": user_id,
        "title": title,

        "created_at": now,
        "updated_at": now,

        "gsi1pk": f"USER#{user_id}",
        "gsi1sk": (
            f"{now}#CONV#{conversation_id}"
        ),
    }

    conversations_table.put_item(
        Item=item
    )

    return {
        "conversation_id": conversation_id,
        "user_id": user_id,
        "title": title,
        "created_at": now,
        "updated_at": now,
    }

def list_conversations(
    user_id: str,
) -> list[dict]:
    response = conversations_table.query(
        IndexName="UserConversationsIndex",
        KeyConditionExpression=Key(
            "gsi1pk"
        ).eq(
            f"USER#{user_id}"
        ),
        ScanIndexForward=False,
    )

    conversations = []

    for item in response.get("Items", []):
        conversations.append(
            {
                "conversation_id": item[
                    "conversation_id"
                ],
                "user_id": item["user_id"],
                "title": item["title"],
                "created_at": item["created_at"],
                "updated_at": item["updated_at"],
            }
        )

    return conversations

def save_message(
    conversation_id: str,
    role: str,
    content: str,
    response_id: str | None = None,
    executed_tools: list | None = None,
) -> dict:
    message_id = str(uuid4())

    now = datetime.now(
        timezone.utc
    ).isoformat()

    item = {
        "pk": f"CONV#{conversation_id}",
        "sk": f"MSG#{now}#{message_id}",

        "entity_type": "message",
        "message_id": message_id,
        "conversation_id": conversation_id,

        "role": role,
        "content": content,
        "created_at": now,
    }

    if response_id:
        item["response_id"] = response_id

    if executed_tools is not None:
        item["executed_tools"] = executed_tools

    conversations_table.put_item(
        Item=item
    )

    return {
        "message_id": message_id,
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "created_at": now,
        "response_id": response_id,
        "executed_tools": executed_tools or [],
    }

def list_messages(
    conversation_id: str,
) -> list[dict]:
    response = conversations_table.query(
        KeyConditionExpression=(
            Key("pk").eq(
                f"CONV#{conversation_id}"
            )
            & Key("sk").begins_with("MSG#")
        ),
        ScanIndexForward=True,
    )

    messages = []

    for item in response.get("Items", []):
        messages.append(
            {
                "message_id": item["message_id"],
                "conversation_id": item[
                    "conversation_id"
                ],
                "role": item["role"],
                "content": item["content"],
                "created_at": item["created_at"],
                "response_id": item.get(
                    "response_id"
                ),
                "executed_tools": item.get(
                    "executed_tools",
                    [],
                ),
            }
        )

    return messages

def get_conversation(
    conversation_id: str,
) -> dict | None:
    response = conversations_table.get_item(
        Key={
            "pk": f"CONV#{conversation_id}",
            "sk": "METADATA",
        },
        ConsistentRead=True,
    )

    return response.get("Item")


def update_conversation_context(
    conversation_id: str,
    response_id: str,
) -> None:
    now = datetime.now(
        timezone.utc
    ).isoformat()

    conversations_table.update_item(
        Key={
            "pk": f"CONV#{conversation_id}",
            "sk": "METADATA",
        },
        UpdateExpression=(
            "SET updated_at = :updated_at, "
            "last_response_id = :response_id, "
            "gsi1sk = :gsi1sk"
        ),
        ExpressionAttributeValues={
            ":updated_at": now,
            ":response_id": response_id,
            ":gsi1sk": (
                f"{now}#CONV#{conversation_id}"
            ),
        },
    )

def rename_conversation(
    conversation_id: str,
    title: str,
) -> dict | None:
    conversation = (
        get_conversation(
            conversation_id=(
                conversation_id
            )
        )
    )

    if not conversation:
        return None

    response = (
        conversations_table
        .update_item(
            Key={
                "pk": (
                    f"CONV#"
                    f"{conversation_id}"
                ),
                "sk": (
                    "METADATA"
                ),
            },
            UpdateExpression=(
                "SET title = :title"
            ),
            ExpressionAttributeValues={
                ":title": title,
            },
            ReturnValues=(
                "ALL_NEW"
            ),
        )
    )

    item = response.get(
        "Attributes"
    )

    if not item:
        return None

    return {
        "conversation_id": (
            item[
                "conversation_id"
            ]
        ),
        "user_id": (
            item[
                "user_id"
            ]
        ),
        "title": (
            item[
                "title"
            ]
        ),
        "created_at": (
            item[
                "created_at"
            ]
        ),
        "updated_at": (
            item[
                "updated_at"
            ]
        ),
    }

def get_user_conversation(
    conversation_id: str,
    user_id: str,
) -> dict | None:
    conversation = get_conversation(
        conversation_id=conversation_id
    )

    if not conversation:
        return None

    if (
        conversation.get("user_id")
        != user_id
    ):
        return None

    return conversation


def delete_conversation(
    conversation_id: str,
) -> bool:
    conversation = get_conversation(
        conversation_id=conversation_id
    )

    if not conversation:
        return False

    partition_key = (
        f"CONV#{conversation_id}"
    )

    last_evaluated_key = None

    with conversations_table.batch_writer() as batch:
        while True:
            query_params = {
                "KeyConditionExpression": (
                    Key("pk").eq(
                        partition_key
                    )
                ),
                "ProjectionExpression": (
                    "pk, sk"
                ),
            }

            if last_evaluated_key:
                query_params[
                    "ExclusiveStartKey"
                ] = last_evaluated_key

            response = (
                conversations_table.query(
                    **query_params
                )
            )

            for item in response.get(
                "Items",
                [],
            ):
                batch.delete_item(
                    Key={
                        "pk": item["pk"],
                        "sk": item["sk"],
                    }
                )

            last_evaluated_key = (
                response.get(
                    "LastEvaluatedKey"
                )
            )

            if not last_evaluated_key:
                break

    return True

