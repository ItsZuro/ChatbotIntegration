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


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.get(
    "/me",
    response_model=CurrentUser,
)
def get_me(
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    return current_user