from urllib.parse import (
    urlencode,
)

import httpx

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from fastapi.responses import (
    RedirectResponse,
)

from app.core.config import (
    get_settings,
)
from app.core.security import (
    get_current_user,
)
from app.schemas.auth import (
    CurrentUser,
)
from app.schemas.integrations import (
    GoogleConnectResponse,
    GoogleDisconnectResponse,
    GoogleIntegrationStatusResponse,
)
from app.services.google_oauth_service import (
    build_google_authorization_url,
    exchange_google_code,
    revoke_google_token,
)
from app.services.integrations_service import (
    create_google_oauth_state,
    consume_google_oauth_state,
    delete_google_integration,
    get_google_integration_status,
    get_google_refresh_token,
    save_google_integration,
)


router = APIRouter(
    prefix="/integrations",
    tags=["Integrations"],
)


settings = get_settings()


def _frontend_redirect(
    status: str,
) -> RedirectResponse:
    query = urlencode(
        {
            "google_calendar":
                status,
        }
    )

    url = (
        f"{settings.frontend_base_url.rstrip('/')}"
        f"/integrations?{query}"
    )

    return RedirectResponse(
        url=url,
        status_code=302,
    )


@router.get(
    "/google/connect",
    response_model=GoogleConnectResponse,
)
def connect_google_calendar(
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    state = create_google_oauth_state(
        user_id=current_user.sub
    )

    authorization_url = (
        build_google_authorization_url(
            state=state
        )
    )

    return {
        "authorization_url":
            authorization_url,
    }


@router.get(
    "/google/callback",
)
def google_calendar_callback(
    code: str | None = Query(
        default=None
    ),
    state: str | None = Query(
        default=None
    ),
    error: str | None = Query(
        default=None
    ),
):
    if not state:
        return _frontend_redirect(
            "invalid_state"
        )

    user_id = (
        consume_google_oauth_state(
            state=state
        )
    )

    if not user_id:
        return _frontend_redirect(
            "invalid_state"
        )

    if error:
        return _frontend_redirect(
            "cancelled"
        )

    if not code:
        return _frontend_redirect(
            "missing_code"
        )

    try:
        token_data = (
            exchange_google_code(
                code=code
            )
        )

        save_google_integration(
            user_id=user_id,
            refresh_token=(
                token_data[
                    "refresh_token"
                ]
            ),
            scope=token_data.get(
                "scope"
            ),
        )

        return _frontend_redirect(
            "connected"
        )

    except (
        httpx.HTTPError,
        RuntimeError,
    ):
        return _frontend_redirect(
            "error"
        )


@router.get(
    "/google/status",
    response_model=(
        GoogleIntegrationStatusResponse
    ),
)
def get_google_calendar_status(
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    return (
        get_google_integration_status(
            user_id=current_user.sub
        )
    )


@router.post(
    "/google/disconnect",
    response_model=(
        GoogleDisconnectResponse
    ),
)
def disconnect_google_calendar(
    current_user: CurrentUser = Depends(
        get_current_user
    ),
):
    refresh_token = (
        get_google_refresh_token(
            user_id=current_user.sub
        )
    )

    if refresh_token:
        revoke_google_token(
            refresh_token=(
                refresh_token
            )
        )

    delete_google_integration(
        user_id=current_user.sub
    )

    return {
        "success": True,
        "provider":
            "GOOGLE_CALENDAR",
    }