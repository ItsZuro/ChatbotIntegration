from pydantic import BaseModel


class TranscriptionResponse(BaseModel):
    text: str
    model: str

class RealtimeTranscriptionSessionResponse(
    BaseModel
):
    client_secret: str
    expires_at: int
    model: str

