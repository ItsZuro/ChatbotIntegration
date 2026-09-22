import boto3

from app.core.config import (
    get_settings,
)


settings = get_settings()


cognito_client = boto3.client(
    "cognito-idp",
    region_name=settings.aws_region,
)


def list_application_users() -> list[dict]:
    users: list[dict] = []

    pagination_token: str | None = None

    while True:
        params = {
            "UserPoolId":
                settings.cognito_user_pool_id,
            "Limit":
                60,
        }

        if pagination_token:
            params["PaginationToken"] = (
                pagination_token
            )

        response = (
            cognito_client.list_users(
                **params
            )
        )

        for user in response.get(
            "Users",
            [],
        ):
            attributes = {
                attribute["Name"]:
                    attribute["Value"]
                for attribute
                in user.get(
                    "Attributes",
                    [],
                )
            }

            users.append({
                "sub":
                    attributes.get(
                        "sub",
                        user["Username"],
                    ),

                "email":
                    attributes.get(
                        "email"
                    ),

                "status":
                    user.get(
                        "UserStatus",
                        "UNKNOWN",
                    ),

                "enabled":
                    user.get(
                        "Enabled",
                        False,
                    ),

                "created_at":
                    user[
                        "UserCreateDate"
                    ],
            })

        pagination_token = (
            response.get(
                "PaginationToken"
            )
        )

        if not pagination_token:
            break

    users.sort(
        key=lambda item:
            (
                item["email"]
                or ""
            ).lower()
    )

    return users