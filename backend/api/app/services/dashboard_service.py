import json

from app.services.audit_service import (
    audit_table,
)
from app.services.conversation_service import (
    list_conversations,
)
from boto3.dynamodb.conditions import Attr


TOOL_INTEGRATIONS = {
    "actualizar_contacto_en_hubspot": "HubSpot",
    "crear_ticket_en_jira": "Jira",
    "agendar_reunion_en_google_calendar": (
        "Google Calendar"
    ),
}


def _scan_user_audit_records(
    user_id: str,
) -> list[dict]:
    items: list[dict] = []

    scan_kwargs = {
        "FilterExpression": (
            Attr("user_id").eq(
                user_id
            )
        ),
    }

    while True:
        response = audit_table.scan(
            **scan_kwargs
        )

        items.extend(
            response.get(
                "Items",
                [],
            )
        )

        last_evaluated_key = (
            response.get(
                "LastEvaluatedKey"
            )
        )

        if not last_evaluated_key:
            break

        scan_kwargs[
            "ExclusiveStartKey"
        ] = last_evaluated_key

    return items


def _parse_executed_tools(
    value,
) -> list[dict]:
    if isinstance(
        value,
        list,
    ):
        return value

    if not isinstance(
        value,
        str,
    ):
        return []

    try:
        parsed = json.loads(
            value
        )

        if isinstance(
            parsed,
            list,
        ):
            return parsed

        return []

    except json.JSONDecodeError:
        return []


def _tool_succeeded(
    tool: dict,
) -> bool:
    result = tool.get(
        "result"
    )

    if not isinstance(
        result,
        dict,
    ):
        return False

    return (
        result.get(
            "success"
        )
        is True
    )


def _build_activity_title(
    tool_name: str,
    result: dict,
) -> str:
    if (
        tool_name
        == "actualizar_contacto_en_hubspot"
    ):
        action = result.get(
            "action"
        )

        if action == "created":
            return (
                "Contacto creado"
            )

        return (
            "Contacto actualizado"
        )

    if (
        tool_name
        == "crear_ticket_en_jira"
    ):
        issue_key = result.get(
            "issue_key"
        )

        if issue_key:
            return (
                f"Tarea {issue_key} creada"
            )

        return (
            "Tarea creada en Jira"
        )

    if (
        tool_name
        == (
            "agendar_reunion_en_"
            "google_calendar"
        )
    ):
        return (
            "Reunión programada"
        )

    return (
        "Acción ejecutada"
    )


def _build_activity_description(
    tool_name: str,
    result: dict,
) -> str:
    if (
        tool_name
        == "actualizar_contacto_en_hubspot"
    ):
        email = result.get(
            "email"
        )

        if email:
            return str(
                email
            )

        return (
            "Contacto procesado en HubSpot"
        )

    if (
        tool_name
        == "crear_ticket_en_jira"
    ):
        issue_key = result.get(
            "issue_key"
        )

        if issue_key:
            return (
                f"Ticket {issue_key}"
            )

        return (
            "Ticket registrado en Jira"
        )

    if (
        tool_name
        == (
            "agendar_reunion_en_"
            "google_calendar"
        )
    ):
        start = result.get(
            "start"
        )

        if start:
            return (
                f"Inicio: {start}"
            )

        return (
            "Evento creado en Google Calendar"
        )

    return (
        "Acción externa completada"
    )


def _build_recent_activity(
    audit_records: list[dict],
    limit: int = 8,
) -> list[dict]:
    activities: list[dict] = []

    sorted_records = sorted(
        audit_records,
        key=lambda item: item.get(
            "timestamp",
            "",
        ),
        reverse=True,
    )

    for record in sorted_records:
        tools = (
            _parse_executed_tools(
                record.get(
                    "executed_tools"
                )
            )
        )

        for index, tool in enumerate(
            tools
        ):
            if not isinstance(
                tool,
                dict,
            ):
                continue

            tool_name = tool.get(
                "name"
            )

            result = tool.get(
                "result"
            )

            if (
                not isinstance(
                    tool_name,
                    str,
                )
                or not isinstance(
                    result,
                    dict,
                )
            ):
                continue

            integration = (
                TOOL_INTEGRATIONS.get(
                    tool_name,
                    "Integración",
                )
            )

            success = (
                _tool_succeeded(
                    tool
                )
            )

            activities.append(
                {
                    "id": (
                        f"{record.get('request_id', '')}"
                        f"-{index}"
                    ),
                    "title": (
                        _build_activity_title(
                            tool_name,
                            result,
                        )
                    ),
                    "description": (
                        _build_activity_description(
                            tool_name,
                            result,
                        )
                    ),
                    "integration": integration,
                    "status": (
                        "SUCCESS"
                        if success
                        else "ERROR"
                    ),
                    "timestamp": record.get(
                        "timestamp",
                        "",
                    ),
                }
            )

            if (
                len(
                    activities
                )
                >= limit
            ):
                return activities

    return activities


def get_dashboard_summary(
    user_id: str,
) -> dict:
    audit_records = (
        _scan_user_audit_records(
            user_id=user_id
        )
    )

    total_requests = len(
        audit_records
    )

    successful_requests = sum(
        1
        for record
        in audit_records
        if record.get(
            "status"
        )
        == "SUCCESS"
    )

    failed_requests = sum(
        1
        for record
        in audit_records
        if record.get(
            "status"
        )
        == "ERROR"
    )

    executed_actions = 0

    for record in audit_records:
        tools = (
            _parse_executed_tools(
                record.get(
                    "executed_tools"
                )
            )
        )

        executed_actions += sum(
            1
            for tool in tools
            if (
                isinstance(
                    tool,
                    dict,
                )
                and _tool_succeeded(
                    tool
                )
            )
        )

    conversations = (
        list_conversations(
            user_id=user_id
        )
    )

    return {
        "metrics": {
            "total_requests": (
                total_requests
            ),
            "successful_requests": (
                successful_requests
            ),
            "failed_requests": (
                failed_requests
            ),
            "executed_actions": (
                executed_actions
            ),
            "conversations": len(
                conversations
            ),
        },
        "recent_activity": (
            _build_recent_activity(
                audit_records,
            )
        ),
    }

def get_recent_activity(
    user_id: str,
    limit: int = 50,
) -> list[dict]:
    audit_records = (
        _scan_user_audit_records(
            user_id=user_id
        )
    )

    return _build_recent_activity(
        audit_records,
        limit=limit,
    )