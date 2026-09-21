from pydantic import BaseModel


class CurrentUser(BaseModel):
    sub: str
    username: str | None = None