from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from app.core.config import (
    get_settings,
)

from app.services.secrets_service import (
    get_openai_api_key,
)
from app.services.transcription_service import (
    transcribe_audio,
)
from app.schemas.audio import (
    RealtimeTranscriptionSessionResponse,
    TranscriptionResponse,
)

from app.services.realtime_transcription_service import (
    create_realtime_transcription_secret,
)

from app.core.security import (
    get_current_user,
)
from app.schemas.auth import (
    CurrentUser,
)
from app.services.usage_service import (
    UsageLimitExceeded,
    consume_request_quota,
)



router = APIRouter(
    prefix="/audio",
    tags=["Audio"],
)

settings = get_settings()


MAX_AUDIO_SIZE_BYTES = (
    25 * 1024 * 1024
)

ALLOWED_EXTENSIONS = {
    ".mp3",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".m4a",
    ".wav",
    ".webm",
    ".ogg",
}


@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
)
def transcribe_audio_file(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    file_name = (
        file.filename
        or "recording.webm"
    )

    extension = Path(
        file_name
    ).suffix.lower()

    if (
        extension
        not in ALLOWED_EXTENSIONS
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Formato de audio "
                "no permitido."
            ),
        )

    audio_bytes = file.file.read(
        MAX_AUDIO_SIZE_BYTES + 1
    )

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail=(
                "El archivo de audio "
                "está vacío."
            ),
        )

    if (
        len(audio_bytes)
        > MAX_AUDIO_SIZE_BYTES
    ):
        raise HTTPException(
            status_code=413,
            detail=(
                "El audio supera el "
                "límite de 25 MB."
            ),
        )

    try:
        consume_request_quota(
            user_id=current_user.sub,
            resource="audio",
            minute_limit=(
                settings
                .audio_requests_per_minute
            ),
            daily_limit=(
                settings
                .audio_requests_per_day
            ),
        )

    except UsageLimitExceeded as exc:
        raise HTTPException(
            status_code=429,
            detail=str(exc),
        ) from exc

    try:
        api_key = (
            get_openai_api_key()
        )

        text = transcribe_audio(
            api_key=api_key,
            audio_bytes=audio_bytes,
            file_name=file_name,
            content_type=(
                file.content_type
                or "application/octet-stream"
            ),
        )

        return {
            "text": text,
            "model": (
                settings
                .openai_transcription_model
            ),
        }

    except Exception as exc:
        print(
            "Transcription error: "
            f"{type(exc).__name__}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo transcribir "
                "el audio."
            ),
        ) from exc

@router.post(
    "/realtime-session",
    response_model=(
        RealtimeTranscriptionSessionResponse
    ),
)
def create_realtime_session(
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    try:
        consume_request_quota(
            user_id=current_user.sub,
            resource="realtime",
            minute_limit=(
                settings
                .realtime_sessions_per_minute
            ),
            daily_limit=(
                settings
                .realtime_sessions_per_day
            ),
        )

    except UsageLimitExceeded as exc:
        raise HTTPException(
            status_code=429,
            detail=str(exc),
        ) from exc

    try:
        api_key = (
            get_openai_api_key()
        )

        return (
            create_realtime_transcription_secret(
                api_key=api_key,
            )
        )

    except Exception as exc:
        print(
            "Realtime transcription "
            "session error: "
            f"{type(exc).__name__}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo iniciar "
                "la transcripción "
                "en tiempo real."
            ),
        ) from exc
