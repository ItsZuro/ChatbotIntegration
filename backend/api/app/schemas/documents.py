from pydantic import BaseModel


class UploadUrlRequest(BaseModel):
    file_name: str
    content_type: str


class UploadUrlResponse(BaseModel):
    success: bool
    action: str
    bucket: str
    object_key: str
    upload_url: str
    expires_in: int