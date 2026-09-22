from datetime import datetime
from pydantic import (
    BaseModel,
    Field,
)


class AdminUserResponse(BaseModel):
    sub: str
    email: str | None = None
    status: str
    enabled: bool
    created_at: datetime



class AdminQuotaLimits(BaseModel):
    assistant: int = Field(
        ge=1,
        le=1000,
    )
    audio: int = Field(
        ge=1,
        le=1000,
    )
    realtime: int = Field(
        ge=1,
        le=1000,
    )


class AdminQuotaResponse(BaseModel):
    user_id: str
    customized: bool
    limits: AdminQuotaLimits
    defaults: AdminQuotaLimits