from fastapi import (
    APIRouter,
    Query,
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
):
    return get_recent_activity(
        limit=limit,
    )