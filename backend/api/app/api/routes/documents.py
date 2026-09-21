from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from fastapi import Depends

from app.core.security import (
    get_current_user,
)
from app.schemas.auth import (
    CurrentUser,
)


from app.services.documents_service import (
    generate_download_url,
    generate_upload_url,
    list_documents,
    delete_document,
)

from app.schemas.documents import (
    DocumentListResponse,
    DownloadUrlRequest,
    DownloadUrlResponse,
    UploadUrlRequest,
    UploadUrlResponse,
    DeleteDocumentResponse
)

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
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    try:
        return generate_upload_url(
            user_id=current_user.sub,
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


@router.get(
    "",
    response_model=(
        DocumentListResponse
    ),
)
def get_documents(
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    try:
        return list_documents(
            user_id=current_user.sub,
            limit=100,
        )

    except Exception as exc:
        print(
            "Documents list error: "
            f"{type(exc).__name__}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudieron listar "
                "los documentos."
            ),
        ) from exc


@router.post(
    "/download-url",
    response_model=(
        DownloadUrlResponse
    ),
)
def create_download_url(
    request: DownloadUrlRequest,
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    try:
        return generate_download_url(
            user_id=current_user.sub,
            object_key=request.object_key,
        )

    except Exception as exc:
        print(
            "Document download "
            "URL error: "
            f"{type(exc).__name__}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo generar "
                "la URL de descarga."
            ),
        ) from exc

@router.delete(
    "",
    response_model=(
        DeleteDocumentResponse
    ),
)
def remove_document(
    object_key: str = Query(
        min_length=1,
    ),
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    try:
        return delete_document(
            user_id=current_user.sub,
            object_key=object_key,
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(
            "Document delete error: "
            f"{type(exc).__name__}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo eliminar "
                "el documento."
            ),
        ) from exc
