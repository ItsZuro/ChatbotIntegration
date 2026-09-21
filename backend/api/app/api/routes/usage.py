from fastapi import (
    APIRouter,
    Depends,
)

from app.core.security import (
    get_current_user,
)
from app.schemas.auth import (
    CurrentUser,
)
from app.schemas.usage import (
    UsageSummaryResponse,
)
from app.services.usage_service import (
    get_usage_summary,
)


router = APIRouter(
    prefix="/usage",
    tags=["Usage"],
)


@router.get(
    "/me",
    response_model=UsageSummaryResponse,
)
def get_my_usage(
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    return get_usage_summary(
        user_id=current_user.sub,
    )