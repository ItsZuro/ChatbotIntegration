from fastapi import APIRouter, HTTPException

from app.schemas.documents import (
    UploadUrlRequest,
    UploadUrlResponse,
)
from app.services.documents_service import generate_upload_url


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "/upload-url",
    response_model=UploadUrlResponse,
)
def create_upload_url(
    request: UploadUrlRequest,
):
    try:
        return generate_upload_url(
            file_name=request.file_name,
            content_type=request.content_type,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(
            f"Documents error: "
            f"{type(exc).__name__}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo generar la URL "
                "de subida."
            ),
        ) from exc