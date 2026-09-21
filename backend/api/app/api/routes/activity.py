from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from app.core.security import (
    get_current_user,
)
from app.schemas.auth import (
    CurrentUser,
)
from app.schemas.dashboard import (
    DashboardActivityItem,
)
from app.services.dashboard_service import (
    get_recent_activity,
)


router = APIRouter(
    prefix="/activity",
    tags=["Activity"],
)


@router.get(
    "",
    response_model=list[
        DashboardActivityItem
    ],
)
def get_activity(
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    return get_recent_activity(
        user_id=current_user.sub,
        limit=limit,
    )