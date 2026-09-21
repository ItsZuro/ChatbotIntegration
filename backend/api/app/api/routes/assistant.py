from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from app.core.config import (
    get_settings,
)
from app.services.usage_service import (
    UsageLimitExceeded,
    consume_request_quota,
)

from app.core.security import (
    get_current_user,
)
from app.schemas.auth import (
    CurrentUser,
)
from app.services.documents_service import extract_document_text

from app.schemas.assistant import (
    AssistantMessageRequest,
    AssistantMessageResponse,
)
from app.services.assistant_service import run_assistant
from app.services.audit_service import write_audit_record
from app.services.secrets_service import get_openai_api_key

settings = get_settings()

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
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    request_id = str(uuid4())

    # AQUÍ VA EL PUNTO 5
    try:
        consume_request_quota(
            user_id=current_user.sub,
            resource="assistant",
            minute_limit=(
                settings
                .assistant_requests_per_minute
            ),
            daily_limit=(
                settings
                .assistant_requests_per_day
            ),
        )

    except UsageLimitExceeded as exc:
        raise HTTPException(
            status_code=429,
            detail=str(exc),
        ) from exc

    # DESDE AQUÍ SIGUE TU CÓDIGO NORMAL
    try:
        api_key = (
            get_openai_api_key()
        )

        effective_message = (
            request.message
        )

        if request.object_key:
            document_text = (
                extract_document_text(
                    user_id=current_user.sub,
                    object_key=(
                        request.object_key
                    ),
                )
            )

            effective_message = (
                f"{request.message}\n\n"
                "DOCUMENTO ADJUNTO:\n"
                f"{document_text}"
            )

        result = run_assistant(
            api_key=api_key,
            user_message=effective_message,
        )

        write_audit_record(
            request_id=request_id,
            user_id=current_user.sub,
            user_message=request.message,
            status="SUCCESS",
            response_id=(
                result["response_id"]
            ),
            final_response=(
                result["response"]
            ),
            executed_tools=(
                result["executed_tools"]
            ),
        )

        return {
            "request_id": request_id,
            **result,
        }

    except Exception as exc:
        write_audit_record(
            request_id=request_id,
            user_id=current_user.sub,
            user_message=request.message,
            status="ERROR",
            error_type=(
                type(exc).__name__
            ),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo procesar "
                "la solicitud."
            ),
        ) from exc
