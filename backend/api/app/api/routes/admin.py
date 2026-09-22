from fastapi import (
    APIRouter,
    Depends,
)

from app.core.security import (
    require_admin,
)
from app.schemas.admin import (
    AdminQuotaLimits,
    AdminQuotaResponse,
    AdminUserResponse,
)
from app.schemas.auth import (
    CurrentUser,
)
from app.services.admin_service import (
    list_application_users,
)
from app.services.usage_service import (
    delete_quota_override,
    get_user_quota_settings,
    set_quota_override,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/users",
    response_model=list[
        AdminUserResponse
    ],
)
def list_users(
    _: CurrentUser = Depends(
        require_admin
    ),
):
    return list_application_users()


@router.get(
    "/users/{user_id}/quota",
    response_model=AdminQuotaResponse,
)
def get_user_quota(
    user_id: str,
    _: CurrentUser = Depends(
        require_admin
    ),
):
    return get_user_quota_settings(
        user_id
    )


@router.put(
    "/users/{user_id}/quota",
    response_model=AdminQuotaResponse,
)
def update_user_quota(
    user_id: str,
    request: AdminQuotaLimits,
    _: CurrentUser = Depends(
        require_admin
    ),
):
    set_quota_override(
        user_id=user_id,
        assistant_daily=(
            request.assistant
        ),
        audio_daily=(
            request.audio
        ),
        realtime_daily=(
            request.realtime
        ),
    )

    return get_user_quota_settings(
        user_id
    )


@router.delete(
    "/users/{user_id}/quota",
    response_model=AdminQuotaResponse,
)
def reset_user_quota(
    user_id: str,
    _: CurrentUser = Depends(
        require_admin
    ),
):
    delete_quota_override(
        user_id
    )

    return get_user_quota_settings(
        user_id
    )
