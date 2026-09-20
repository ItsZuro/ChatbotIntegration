from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.schemas.assistant import (
    AssistantMessageRequest,
    AssistantMessageResponse,
)
from app.services.assistant_service import run_assistant
from app.services.secrets_service import get_openai_api_key


router = APIRouter(
    prefix="/assistant",
    tags=["Assistant"],
)


@router.post(
    "/message",
    response_model=AssistantMessageResponse,
)
def send_message(
    request: AssistantMessageRequest,
):
    request_id = str(uuid4())

    try:
        api_key = get_openai_api_key()

        result = run_assistant(
            api_key=api_key,
            user_message=request.message,
        )

        return {
            "request_id": request_id,
            **result,
        }

    except Exception as exc:
        print(
            f"Assistant error: "
            f"{type(exc).__name__}"
        )

        raise HTTPException(
            status_code=500,
            detail="No se pudo procesar la solicitud.",
        ) from exc