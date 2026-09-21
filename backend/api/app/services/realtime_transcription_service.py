import httpx

from app.core.config import (
    get_settings,
)


settings = get_settings()


OPENAI_REALTIME_CLIENT_SECRETS_URL = (
    "https://api.openai.com/v1/"
    "realtime/client_secrets"
)


def create_realtime_transcription_secret(
    api_key: str,
) -> dict:
    payload = {
        "expires_after": {
            "anchor": "created_at",
            "seconds": 120,
        },
        "session": {
            "type": "transcription",
            "audio": {
                "input": {
                    "transcription": {
                        "model": (
                            settings
                            .openai_realtime_transcription_model
                        ),
                        "prompt": (
                            "Conversación relacionada con "
                            "UTPConsult, atención al cliente, "
                            "Jira, HubSpot, Google Calendar, "
                            "CRM y ERP."
                        ),
                        "keywords": [
                            "UTPConsult",
                            "Jira",
                            "HubSpot",
                            "Google Calendar",
                            "CRM",
                            "ERP",
                        ],
                        "languages": [
                            "es",
                            "en",
                        ],
                        "delay": "minimal",
                    },
                    "turn_detection": None,
                }
            },
        },
    }


    with httpx.Client(
        timeout=15.0
    ) as client:
        response = client.post(
            OPENAI_REALTIME_CLIENT_SECRETS_URL,
            headers={
                "Authorization": (
                    f"Bearer {api_key}"
                ),
                "Content-Type": (
                    "application/json"
                ),
            },
            json=payload,
        )


    response.raise_for_status()

    data = response.json()


    return {
        "client_secret": data["value"],
        "expires_at": data["expires_at"],
        "model": (
            settings
            .openai_realtime_transcription_model
        ),
    }