from fastapi import APIRouter

from app.schemas.dashboard import (
    DashboardSummaryResponse,
)

from app.services.dashboard_service import (
    get_dashboard_summary,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def get_summary():
    return get_dashboard_summary(
        user_id="default",
    )