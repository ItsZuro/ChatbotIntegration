from fastapi import (
    APIRouter,
    HTTPException,
    Response,
    Depends
)

from app.schemas.conversations import (
    CreateConversationRequest,
    ConversationResponse,
    ConversationMessageResponse,
    RenameConversationRequest,
    SendConversationMessageRequest,
    SendConversationMessageResponse,
    PendingActionDecisionRequest,
    PendingActionResponse,
    CancelPendingActionResponse,
)
from app.services.conversation_service import (
    create_conversation,
    list_conversations,
    list_messages,
    get_conversation,
    save_message,
    update_conversation_context,
    delete_conversation,
    rename_conversation,
    get_user_conversation,
    save_pending_action,
    get_pending_action,
    clear_pending_action,
)
from uuid import uuid4

from fastapi import HTTPException

from app.schemas.conversations import (
    SendConversationMessageRequest,
    SendConversationMessageResponse,
)
from app.services.assistant_service import (
    confirm_tool_calls,
    run_assistant,
)
from app.services.audit_service import write_audit_record
from app.services.documents_service import extract_document_text
from app.services.secrets_service import get_openai_api_key
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

settings = get_settings()

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
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    return create_conversation(
        user_id=current_user.sub,
        title=request.title,
    )

@router.get(
    "",
    response_model=list[ConversationResponse],
)
def get_conversations(
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    return list_conversations(
        user_id=current_user.sub,
    )

@router.get(
    "/{conversation_id}/messages",
    response_model=list[ConversationMessageResponse],
)
def get_conversation_messages(
    conversation_id: str,
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    conversation = get_user_conversation(
        conversation_id=conversation_id,
        user_id=current_user.sub,
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail=(
                "La conversación no existe."
            ),
        )

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
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    request_id = str(uuid4())

    conversation = get_user_conversation(
        conversation_id=conversation_id,
        user_id=current_user.sub,
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="La conversación no existe.",
        )

    pending_action = (
        get_pending_action(
            conversation_id=conversation_id
        )
    )

    if pending_action:
        raise HTTPException(
            status_code=409,
            detail=(
                "Existe una acción pendiente "
                "de confirmación. Confírmala "
                "o cancélala antes de enviar "
                "otro mensaje."
            ),
        )

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
            global_daily_limit=(
                settings
                .assistant_global_requests_per_day
            ),
        )
    except UsageLimitExceeded as exc:
        raise HTTPException(
            status_code=429,
            detail=str(exc),
        ) from exc

    try:
        save_message(
            conversation_id=conversation_id,
            role="user",
            content=request.message,
        )

        effective_message = request.message

        if request.object_key:
            document_text = extract_document_text(
                user_id=current_user.sub,
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

        if (
            result["type"]
            == "confirmation_required"
        ):
            pending = save_pending_action(
                conversation_id=(
                    conversation_id
                ),
                response_id=(
                    result["response_id"]
                ),
                function_calls=(
                    result["pending_calls"]
                ),
            )

            save_message(
                conversation_id=(
                    conversation_id
                ),
                role="assistant",
                content=(
                    result["response"]
                ),
                response_id=(
                    result["response_id"]
                ),
                executed_tools=[],
            )

            return {
                "request_id":
                    request_id,
                "conversation_id":
                    conversation_id,
                "type":
                    "confirmation_required",
                "response_id":
                    result["response_id"],
                "response":
                    result["response"],
                "executed_tools": [],
                "action_id":
                    pending["action_id"],
                "pending_calls":
                    result["pending_calls"],
            }

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
            user_id=current_user.sub,
            user_message=request.message,
            status="SUCCESS",
            response_id=result["response_id"],
            final_response=result["response"],
            executed_tools=result["executed_tools"],
        )
        return {
            "request_id":
                request_id,
            "conversation_id":
                conversation_id,
            "type":
                "message",
            "response_id":
                result["response_id"],
            "response":
                result["response"],
            "executed_tools":
                result[
                    "executed_tools"
                ],
            "action_id": None,
            "pending_calls": [],
        }

    except Exception as exc:
        write_audit_record(
            request_id=request_id,
            user_id=current_user.sub,
            user_message=request.message,
            status="ERROR",
            error_type=type(exc).__name__,
        )

        raise HTTPException(
            status_code=500,
            detail="No se pudo procesar el mensaje.",
        ) from exc

@router.get(
    "/{conversation_id}/actions/pending",
    response_model=(
        PendingActionResponse | None
    ),
)
def get_conversation_pending_action(
    conversation_id: str,
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    conversation = (
        get_user_conversation(
            conversation_id=(
                conversation_id
            ),
            user_id=current_user.sub,
        )
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail=(
                "La conversación no existe."
            ),
        )

    pending = get_pending_action(
        conversation_id=conversation_id
    )

    if not pending:
        return None

    return {
        "action_id":
            pending["action_id"],
        "response_id":
            pending["response_id"],
        "pending_calls":
            pending["function_calls"],
    }

@router.post(
    "/{conversation_id}/actions/confirm",
    response_model=(
        SendConversationMessageResponse
    ),
)
def confirm_conversation_action(
    conversation_id: str,
    request: PendingActionDecisionRequest,
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    request_id = str(uuid4())

    conversation = (
        get_user_conversation(
            conversation_id=(
                conversation_id
            ),
            user_id=current_user.sub,
        )
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail=(
                "La conversación no existe."
            ),
        )

    pending = get_pending_action(
        conversation_id=conversation_id
    )

    if not pending:
        raise HTTPException(
            status_code=404,
            detail=(
                "No existe una acción "
                "pendiente."
            ),
        )

    if (
        pending["action_id"]
        != request.action_id
    ):
        raise HTTPException(
            status_code=409,
            detail=(
                "La acción pendiente "
                "ya cambió o no coincide."
            ),
        )

    try:
        api_key = (
            get_openai_api_key()
        )

        result = confirm_tool_calls(
            api_key=api_key,
            previous_response_id=(
                pending[
                    "response_id"
                ]
            ),
            function_calls=(
                pending[
                    "function_calls"
                ]
            ),
        )

        if (
            result["type"]
            == "confirmation_required"
        ):
            next_pending = (
                save_pending_action(
                    conversation_id=(
                        conversation_id
                    ),
                    response_id=(
                        result[
                            "response_id"
                        ]
                    ),
                    function_calls=(
                        result[
                            "pending_calls"
                        ]
                    ),
                )
            )

            save_message(
                conversation_id=(
                    conversation_id
                ),
                role="assistant",
                content=(
                    result["response"]
                ),
                response_id=(
                    result["response_id"]
                ),
                executed_tools=(
                    result[
                        "executed_tools"
                    ]
                ),
            )

            write_audit_record(
                request_id=request_id,
                user_id=current_user.sub,
                user_message=(
                    "Confirmación de "
                    "acción pendiente"
                ),
                status="SUCCESS",
                response_id=(
                    result[
                        "response_id"
                    ]
                ),
                final_response=(
                    result["response"]
                ),
                executed_tools=(
                    result[
                        "executed_tools"
                    ]
                ),
            )

            return {
                "request_id":
                    request_id,
                "conversation_id":
                    conversation_id,
                "type":
                    "confirmation_required",
                "response_id":
                    result["response_id"],
                "response":
                    result["response"],
                "executed_tools":
                    result[
                        "executed_tools"
                    ],
                "action_id":
                    next_pending[
                        "action_id"
                    ],
                "pending_calls":
                    result[
                        "pending_calls"
                    ],
            }

        clear_pending_action(
            conversation_id=conversation_id
        )

        save_message(
            conversation_id=(
                conversation_id
            ),
            role="assistant",
            content=(
                result["response"]
            ),
            response_id=(
                result["response_id"]
            ),
            executed_tools=(
                result[
                    "executed_tools"
                ]
            ),
        )

        update_conversation_context(
            conversation_id=(
                conversation_id
            ),
            response_id=(
                result["response_id"]
            ),
        )

        write_audit_record(
            request_id=request_id,
            user_id=current_user.sub,
            user_message=(
                "Confirmación de "
                "acción pendiente"
            ),
            status="SUCCESS",
            response_id=(
                result["response_id"]
            ),
            final_response=(
                result["response"]
            ),
            executed_tools=(
                result[
                    "executed_tools"
                ]
            ),
        )

        return {
            "request_id":
                request_id,
            "conversation_id":
                conversation_id,
            "type":
                "message",
            "response_id":
                result["response_id"],
            "response":
                result["response"],
            "executed_tools":
                result[
                    "executed_tools"
                ],
            "action_id": None,
            "pending_calls": [],
        }

    except Exception as exc:
        write_audit_record(
            request_id=request_id,
            user_id=current_user.sub,
            user_message=(
                "Confirmación de "
                "acción pendiente"
            ),
            status="ERROR",
            error_type=(
                type(exc).__name__
            ),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo ejecutar "
                "la acción confirmada."
            ),
        ) from exc

@router.post(
    "/{conversation_id}/actions/cancel",
    response_model=(
        CancelPendingActionResponse
    ),
)
def cancel_conversation_action(
    conversation_id: str,
    request: PendingActionDecisionRequest,
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    conversation = (
        get_user_conversation(
            conversation_id=(
                conversation_id
            ),
            user_id=current_user.sub,
        )
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail=(
                "La conversación no existe."
            ),
        )

    pending = get_pending_action(
        conversation_id=conversation_id
    )

    if not pending:
        raise HTTPException(
            status_code=404,
            detail=(
                "No existe una acción "
                "pendiente."
            ),
        )

    if (
        pending["action_id"]
        != request.action_id
    ):
        raise HTTPException(
            status_code=409,
            detail=(
                "La acción pendiente "
                "ya cambió o no coincide."
            ),
        )

    clear_pending_action(
        conversation_id=conversation_id
    )

    save_message(
        conversation_id=conversation_id,
        role="assistant",
        content=(
            "Acción cancelada. "
            "No se realizó ningún "
            "cambio externo."
        ),
        executed_tools=[],
    )

    return {
        "success": True,
        "action": "cancelled",
        "conversation_id":
            conversation_id,
    }


@router.patch(
    "/{conversation_id}",
    response_model=ConversationResponse,
)
def rename_existing_conversation(
    conversation_id: str,
    request: RenameConversationRequest,
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    existing_conversation = (
        get_user_conversation(
            conversation_id=conversation_id,
            user_id=current_user.sub,
        )
    )

    if not existing_conversation:
        raise HTTPException(
            status_code=404,
            detail=(
                "La conversación "
                "no existe."
            ),
        )

    conversation = rename_conversation(
        conversation_id=conversation_id,
        title=request.title,
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail=(
                "La conversación "
                "no existe."
            ),
        )

    return conversation

@router.delete(
    "/{conversation_id}",
    status_code=204,
)
def remove_conversation(
    conversation_id: str,
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):

    conversation = get_user_conversation(
        conversation_id=conversation_id,
        user_id=current_user.sub,
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail=(
                "La conversación no existe."
            ),
        )
    
    deleted = delete_conversation(
        conversation_id=conversation_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=(
                "La conversación no existe."
            ),
        )

    return Response(
        status_code=204
    )

