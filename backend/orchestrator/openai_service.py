from openai import OpenAI


MODEL = "gpt-5.6-terra"


def generate_response(api_key: str, user_message: str) -> str:
    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model=MODEL,
        reasoning={
            "effort": "low"
        },
        instructions=(
            "Eres UTP Assistant, un asistente profesional de UTPConsult. "
            "Responde de forma clara, breve y profesional."
        ),
        input=user_message
    )

    return response.output_text