from pydantic import BaseModel


class UploadUrlRequest(
    BaseModel
):
    file_name: str
    content_type: str


class UploadUrlResponse(
    BaseModel
):
    success: bool
    action: str
    bucket: str
    object_key: str
    upload_url: str
    expires_in: int


class DocumentItem(
    BaseModel
):
    object_key: str
    file_name: str
    size: int
    last_modified: str


class DocumentListResponse(
    BaseModel
):
    success: bool
    documents: list[
        DocumentItem
    ]


class DownloadUrlRequest(
    BaseModel
):
    object_key: str


class DownloadUrlResponse(
    BaseModel
):
    success: bool
    action: str
    object_key: str
    download_url: str
    expires_in: int


class DeleteDocumentResponse(
    BaseModel
):
    success: bool
    action: str
    object_key: str
    deleted_versions: int
