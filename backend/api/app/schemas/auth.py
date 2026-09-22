from pydantic import (
    BaseModel,
    Field,
)


class CurrentUser(BaseModel):
    sub: str
    username: str | None = None
    groups: list[str] = Field(
        default_factory=list
    )