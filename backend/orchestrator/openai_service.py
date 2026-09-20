from openai import OpenAI

from system_prompt import SYSTEM_PROMPT


MODEL = "gpt-5.6-terra"


def generate_response(api_key: str, user_message: str) -> str:
    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model=MODEL,
        reasoning={
            "effort": "low"
        },
        instructions=SYSTEM_PROMPT,
        input=user_message
    )

    return response.output_text