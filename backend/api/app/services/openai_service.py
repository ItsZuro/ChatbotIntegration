import json

from openai import OpenAI

from app.ai.system_prompt import SYSTEM_PROMPT
from app.ai.tool_schemas import TOOLS
from app.core.config import get_settings


settings = get_settings()


def process_message(
    api_key: str,
    user_message: str,
    previous_response_id: str | None = None,
) -> dict:
    client = OpenAI(api_key=api_key)

    request_params = {
        "model": settings.openai_model,
        "reasoning": {
            "effort": settings.openai_reasoning_effort
        },
        "instructions": SYSTEM_PROMPT,
        "tools": TOOLS,
        "input": user_message,
        "max_output_tokens": (
            settings.openai_max_output_tokens
        ),
    }

    if previous_response_id:
        request_params["previous_response_id"] = (
            previous_response_id
        )

    response = client.responses.create(
        **request_params
    )

    function_calls = []

    for item in response.output:
        if item.type == "function_call":
            function_calls.append(
                {
                    "call_id": item.call_id,
                    "name": item.name,
                    "arguments": json.loads(
                        item.arguments
                    ),
                }
            )

    if function_calls:
        return {
            "type": "function_call",
            "response_id": response.id,
            "function_calls": function_calls,
        }

    return {
        "type": "message",
        "response_id": response.id,
        "response": response.output_text,
    }


def continue_after_tool_calls(
    api_key: str,
    previous_response_id: str,
    tool_outputs: list[dict],
) -> dict:
    client = OpenAI(api_key=api_key)

    function_outputs = []

    for tool_output in tool_outputs:
        function_outputs.append(
            {
                "type": "function_call_output",
                "call_id": tool_output["call_id"],
                "output": json.dumps(
                    tool_output["result"],
                    ensure_ascii=False,
                ),
            }
        )

    response = client.responses.create(
        model=settings.openai_model,
        reasoning={
            "effort": settings.openai_reasoning_effort
        },
        instructions=SYSTEM_PROMPT,
        tools=TOOLS,
        previous_response_id=previous_response_id,
        input=function_outputs,
    )

    function_calls = []

    for item in response.output:
        if item.type == "function_call":
            function_calls.append(
                {
                    "call_id": item.call_id,
                    "name": item.name,
                    "arguments": json.loads(
                        item.arguments
                    ),
                }
            )

    if function_calls:
        return {
            "type": "function_call",
            "response_id": response.id,
            "function_calls": function_calls,
        }

    return {
        "type": "message",
        "response_id": response.id,
        "response": response.output_text,
    }
