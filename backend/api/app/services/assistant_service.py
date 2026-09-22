from app.services.openai_service import (
    continue_after_tool_calls,
    process_message,
)
from app.services.tool_executor import (
    execute_tool,
)


def _build_confirmation_response(
    response_id: str,
    function_calls: list[dict],
    executed_tools: list[dict] | None = None,
) -> dict:
    action_count = len(
        function_calls
    )

    if action_count == 1:
        response = (
            "He preparado una acción que "
            "requiere tu autorización antes "
            "de ejecutarse."
        )
    else:
        response = (
            f"He preparado {action_count} "
            "acciones que requieren tu "
            "autorización antes de ejecutarse."
        )

    return {
        "type": "confirmation_required",
        "response_id": response_id,
        "response": response,
        "pending_calls": function_calls,
        "executed_tools": (
            executed_tools
            or []
        ),
    }


def run_assistant(
    api_key: str,
    user_message: str,
    previous_response_id: str | None = None,
) -> dict:
    assistant_result = process_message(
        api_key=api_key,
        user_message=user_message,
        previous_response_id=previous_response_id,
    )

    if (
        assistant_result["type"]
        == "function_call"
    ):
        return _build_confirmation_response(
            response_id=(
                assistant_result[
                    "response_id"
                ]
            ),
            function_calls=(
                assistant_result[
                    "function_calls"
                ]
            ),
        )

    return {
        "type": "message",
        "response_id": (
            assistant_result[
                "response_id"
            ]
        ),
        "response": (
            assistant_result[
                "response"
            ]
        ),
        "pending_calls": [],
        "executed_tools": [],
    }


def confirm_tool_calls(
    api_key: str,
    previous_response_id: str,
    function_calls: list[dict],
    user_id: str,
) -> dict:
    tool_outputs = []
    executed_tools = []

    for function_call in function_calls:
        tool_name = (
            function_call["name"]
        )

        arguments = (
            function_call["arguments"]
        )

        tool_result = execute_tool(
            tool_name=tool_name,
            arguments=arguments,
            user_id=user_id,
        )

        executed_tools.append(
            {
                "name": tool_name,
                "result": tool_result,
            }
        )

        tool_outputs.append(
            {
                "call_id": (
                    function_call[
                        "call_id"
                    ]
                ),
                "result": tool_result,
            }
        )

    assistant_result = (
        continue_after_tool_calls(
            api_key=api_key,
            previous_response_id=(
                previous_response_id
            ),
            tool_outputs=tool_outputs,
        )
    )

    if (
        assistant_result["type"]
        == "function_call"
    ):
        return _build_confirmation_response(
            response_id=(
                assistant_result[
                    "response_id"
                ]
            ),
            function_calls=(
                assistant_result[
                    "function_calls"
                ]
            ),
            executed_tools=(
                executed_tools
            ),
        )

    return {
        "type": "message",
        "response_id": (
            assistant_result[
                "response_id"
            ]
        ),
        "response": (
            assistant_result[
                "response"
            ]
        ),
        "pending_calls": [],
        "executed_tools":
            executed_tools,
    }