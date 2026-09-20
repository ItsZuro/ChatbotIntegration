from uuid import uuid4

from fastapi import APIRouter, HTTPException
from app.services.documents_service import extract_document_text

from app.schemas.assistant import (
    AssistantMessageRequest,
    AssistantMessageResponse,
)
from app.services.assistant_service import run_assistant
from app.services.audit_service import write_audit_record
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

        effective_message = request.message

        if request.object_key:
            document_text = extract_document_text(
                object_key=request.object_key,
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
            user_message=request.message,
            status="SUCCESS",
            response_id=result["response_id"],
            final_response=result["response"],
            executed_tools=result[
                "executed_tools"
            ],
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

        write_audit_record(
            request_id=request_id,
            user_message=request.message,
            status="ERROR",
            error_type=type(exc).__name__,
        )

        raise HTTPException(
            status_code=500,
            detail="No se pudo procesar la solicitud.",
        ) from exc