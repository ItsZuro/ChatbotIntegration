from urllib.parse import (
    urlencode,
)

import httpx

from app.core.config import (
    get_settings,
)
from app.services.secrets_service import (
    get_json_secret,
)


settings = get_settings()


GOOGLE_AUTHORIZATION_URL = (
    "https://accounts.google.com/o/oauth2/v2/auth"
)

GOOGLE_TOKEN_URL = (
    "https://oauth2.googleapis.com/token"
)

GOOGLE_REVOKE_URL = (
    "https://oauth2.googleapis.com/revoke"
)

GOOGLE_CALENDAR_SCOPE = (
    "https://www.googleapis.com/auth/calendar.events"
)


def _get_google_oauth_config() -> dict:
    config = get_json_secret(
        settings.google_secret_id
    )

    client_id = config.get(
        "GOOGLE_CLIENT_ID"
    )

    client_secret = config.get(
        "GOOGLE_CLIENT_SECRET"
    )

    if (
        not client_id
        or not client_secret
    ):
        raise RuntimeError(
            "Google OAuth no está configurado."
        )

    return {
        "client_id": client_id,
        "client_secret": client_secret,
    }


def build_google_authorization_url(
    state: str,
) -> str:
    config = (
        _get_google_oauth_config()
    )

    params = {
        "client_id":
            config["client_id"],

        "redirect_uri":
            settings.google_oauth_redirect_uri,

        "response_type":
            "code",

        "scope":
            GOOGLE_CALENDAR_SCOPE,

        "access_type":
            "offline",

        "prompt":
            "consent",

        "include_granted_scopes":
            "true",

        "state":
            state,
    }

    return (
        f"{GOOGLE_AUTHORIZATION_URL}"
        f"?{urlencode(params)}"
    )


def exchange_google_code(
    code: str,
) -> dict:
    config = (
        _get_google_oauth_config()
    )

    response = httpx.post(
        GOOGLE_TOKEN_URL,
        data={
            "code":
                code,

            "client_id":
                config["client_id"],

            "client_secret":
                config["client_secret"],

            "redirect_uri":
                settings.google_oauth_redirect_uri,

            "grant_type":
                "authorization_code",
        },
        headers={
            "Content-Type":
                "application/"
                "x-www-form-urlencoded",
        },
        timeout=15.0,
    )

    response.raise_for_status()

    token_data = response.json()

    refresh_token = (
        token_data.get(
            "refresh_token"
        )
    )

    if not refresh_token:
        raise RuntimeError(
            "Google no devolvió "
            "un refresh token."
        )

    return {
        "refresh_token":
            refresh_token,

        "scope":
            token_data.get(
                "scope"
            ),
    }


def revoke_google_token(
    refresh_token: str,
) -> bool:
    try:
        response = httpx.post(
            GOOGLE_REVOKE_URL,
            data={
                "token":
                    refresh_token,
            },
            headers={
                "Content-Type":
                    "application/"
                    "x-www-form-urlencoded",
            },
            timeout=15.0,
        )

        return (
            response.status_code
            == 200
        )

    except httpx.HTTPError:
        return False