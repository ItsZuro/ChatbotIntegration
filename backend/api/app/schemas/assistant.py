from typing import Any

from pydantic import (
    BaseModel,
    Field,
)


class AssistantMessageRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=20_000,
    )

    object_key: str | None = None


class ExecutedTool(BaseModel):
    name: str
    result: dict[str, Any]


class PendingToolCall(BaseModel):
    call_id: str
    name: str
    arguments: dict[str, Any]


class AssistantMessageResponse(BaseModel):
    request_id: str

    type: str

    response_id: str
    response: str

    executed_tools: list[
        ExecutedTool
    ] = Field(
        default_factory=list
    )

    action_id: str | None = None

    pending_calls: list[
        PendingToolCall
    ] = Field(
        default_factory=list
    )