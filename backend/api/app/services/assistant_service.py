from app.services.openai_service import (
    continue_after_tool_calls,
    process_message,
)
from app.services.tool_executor import execute_tool


MAX_TOOL_ROUNDS = 5


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

    executed_tools = []
    tool_round = 0

    while assistant_result["type"] == "function_call":
        if tool_round >= MAX_TOOL_ROUNDS:
            raise RuntimeError(
                "Se alcanzó el límite de ejecuciones "
                "de herramientas."
            )

        tool_outputs = []

        for function_call in assistant_result[
            "function_calls"
        ]:
            tool_name = function_call["name"]
            arguments = function_call["arguments"]

            tool_result = execute_tool(
                tool_name=tool_name,
                arguments=arguments,
            )

            executed_tools.append(
                {
                    "name": tool_name,
                    "result": tool_result,
                }
            )

            tool_outputs.append(
                {
                    "call_id": function_call["call_id"],
                    "result": tool_result,
                }
            )

        assistant_result = continue_after_tool_calls(
            api_key=api_key,
            previous_response_id=assistant_result[
                "response_id"
            ],
            tool_outputs=tool_outputs,
        )

        tool_round += 1

    return {
        "type": assistant_result["type"],
        "response_id": assistant_result["response_id"],
        "response": assistant_result["response"],
        "executed_tools": executed_tools,
    }