import io

from openai import OpenAI

from app.core.config import get_settings


settings = get_settings()


def transcribe_audio(
    api_key: str,
    audio_bytes: bytes,
    file_name: str,
    content_type: str,
) -> str:
    client = OpenAI(
        api_key=api_key
    )

    audio_file = io.BytesIO(
        audio_bytes
    )

    media_type = (
        content_type
        or "application/octet-stream"
    ).split(";")[0]

    transcription = (
        client.audio.transcriptions.create(
            model=(
                settings
                .openai_transcription_model
            ),
            file=(
                file_name,
                audio_file,
                media_type,
            ),
            extra_body={
                "languages": [
                    "es",
                    "en",
                ],
                "keywords": [
                    "UTPConsult",
                    "Jira",
                    "HubSpot",
                    "Google Calendar",
                    "CRM",
                    "ERP",
                ],
            },
        )
    )

    return transcription.text