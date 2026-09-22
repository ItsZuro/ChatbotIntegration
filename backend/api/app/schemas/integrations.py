from pydantic import (
    BaseModel,
)


class GoogleConnectResponse(
    BaseModel
):
    authorization_url: str


class GoogleIntegrationStatusResponse(
    BaseModel
):
    provider: str
    connected: bool
    connected_at: str | None = None


class GoogleDisconnectResponse(
    BaseModel
):
    success: bool
    provider: str