import json

from openai import OpenAI

from system_prompt import SYSTEM_PROMPT
from tool_schemas import TOOLS


MODEL = "gpt-5.6-terra"


def process_message(api_key: str, user_message: str) -> dict:
    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model=MODEL,
        reasoning={
            "effort": "low"
        },
        instructions=SYSTEM_PROMPT,
        tools=TOOLS,
        input=user_message
    )

    function_calls = []

    for item in response.output:
        if item.type == "function_call":
            function_calls.append({
                "call_id": item.call_id,
                "name": item.name,
                "arguments": json.loads(item.arguments)
            })

    if function_calls:
        return {
            "type": "function_call",
            "function_calls": function_calls
        }

    return {
        "type": "message",
        "response": response.output_text
    }