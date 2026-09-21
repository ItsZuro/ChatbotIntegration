from pydantic import BaseModel


class UsageResource(BaseModel):
    used: int
    limit: int
    remaining: int


class UsageItems(BaseModel):
    assistant: UsageResource
    audio: UsageResource
    realtime: UsageResource


class UsageSummaryResponse(BaseModel):
    date: str
    time_zone: str
    usage: UsageItems