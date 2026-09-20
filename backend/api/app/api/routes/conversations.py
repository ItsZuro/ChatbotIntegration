from fastapi import APIRouter

from app.schemas.conversations import (
    CreateConversationRequest,
    ConversationResponse,
    ConversationMessageResponse,
)
from app.services.conversation_service import (
    create_conversation,
    list_conversations,
    list_messages,
    get_conversation,
    save_message,
    update_conversation_context,
)
from uuid import uuid4

from fastapi import HTTPException

from app.schemas.conversations import (
    SendConversationMessageRequest,
    SendConversationMessageResponse,
)
from app.services.assistant_service import run_assistant
from app.services.audit_service import write_audit_record
from app.services.documents_service import extract_document_text
from app.services.secrets_service import get_openai_api_key


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


@router.post(
    "",
    response_model=ConversationResponse,
)
def create_new_conversation(
    request: CreateConversationRequest,
):
    return create_conversation(
        user_id="default",
        title=request.title,
    )

@router.get(
    "",
    response_model=list[ConversationResponse],
)
def get_conversations():
    return list_conversations(
        user_id="default",
    )

@router.get(
    "/{conversation_id}/messages",
    response_model=list[ConversationMessageResponse],
)
def get_conversation_messages(
    conversation_id: str,
):
    return list_messages(
        conversation_id=conversation_id,
    )

@router.post(
    "/{conversation_id}/messages",
    response_model=SendConversationMessageResponse,
)
def send_conversation_message(
    conversation_id: str,
    request: SendConversationMessageRequest,
):
    request_id = str(uuid4())

    conversation = get_conversation(
        conversation_id=conversation_id
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="La conversación no existe.",
        )

    try:
        save_message(
            conversation_id=conversation_id,
            role="user",
            content=request.message,
        )

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

        api_key = get_openai_api_key()

        result = run_assistant(
            api_key=api_key,
            user_message=effective_message,
            previous_response_id=conversation.get(
                "last_response_id"
            ),
        )

        save_message(
            conversation_id=conversation_id,
            role="assistant",
            content=result["response"],
            response_id=result["response_id"],
            executed_tools=result["executed_tools"],
        )

        update_conversation_context(
            conversation_id=conversation_id,
            response_id=result["response_id"],
        )

        write_audit_record(
            request_id=request_id,
            user_message=request.message,
            status="SUCCESS",
            response_id=result["response_id"],
            final_response=result["response"],
            executed_tools=result["executed_tools"],
        )

        return {
            "request_id": request_id,
            "conversation_id": conversation_id,
            "response_id": result["response_id"],
            "response": result["response"],
            "executed_tools": result["executed_tools"],
        }

    except Exception as exc:
        write_audit_record(
            request_id=request_id,
            user_message=request.message,
            status="ERROR",
            error_type=type(exc).__name__,
        )

        raise HTTPException(
            status_code=500,
            detail="No se pudo procesar el mensaje.",
        ) from exc

