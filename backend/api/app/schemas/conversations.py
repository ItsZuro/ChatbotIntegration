from pydantic import (
    BaseModel,
    Field,
    field_validator,
)
from typing import Any

class CreateConversationRequest(BaseModel):
    title: str = "Nueva conversación"

class RenameConversationRequest(
    BaseModel
):
    title: str = Field(
        min_length=1,
        max_length=80,
    )

    @field_validator(
        "title"
    )
    @classmethod
    def validate_title(
        cls,
        value: str,
    ) -> str:
        clean_title = (
            value.strip()
        )

        if not clean_title:
            raise ValueError(
                "El título no puede "
                "estar vacío."
            )

        return clean_title


class ConversationResponse(BaseModel):
    conversation_id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str

class ConversationMessageResponse(BaseModel):
    message_id: str
    conversation_id: str
    role: str
    content: str
    created_at: str
    response_id: str | None = None
    executed_tools: list[dict[str, Any]] = []

class SendConversationMessageRequest(BaseModel):
    message: str
    object_key: str | None = None

class PendingToolCall(BaseModel):
    call_id: str
    name: str
    arguments: dict[str, Any]

class PendingActionDecisionRequest(
    BaseModel
):
    action_id: str = Field(
        min_length=1,
        max_length=100,
    )


class CancelPendingActionResponse(
    BaseModel
):
    success: bool
    action: str
    conversation_id: str

class SendConversationMessageResponse(BaseModel):
    request_id: str
    conversation_id: str

    type: str

    response_id: str
    response: str

    executed_tools: list[
        dict[str, Any]
    ] = Field(
        default_factory=list
    )

    action_id: str | None = None

    pending_calls: list[
        PendingToolCall
    ] = Field(
        default_factory=list
    )

class PendingActionResponse(
    BaseModel
):
    action_id: str
    response_id: str

    pending_calls: list[
        PendingToolCall
    ] = Field(
        default_factory=list
    )

