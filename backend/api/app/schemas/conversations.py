from pydantic import BaseModel
from typing import Any

class CreateConversationRequest(BaseModel):
    title: str = "Nueva conversación"


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


class SendConversationMessageResponse(BaseModel):
    request_id: str
    conversation_id: str
    response_id: str
    response: str
    executed_tools: list[dict[str, Any]]