import jwt

from fastapi import (
    Depends,
    HTTPException,
    status,
)
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jwt import PyJWKClient
from jwt.exceptions import (
    InvalidTokenError,
    PyJWKClientError,
)

from app.core.config import (
    get_settings,
)
from app.schemas.auth import (
    CurrentUser,
)


settings = get_settings()


bearer_scheme = HTTPBearer(
    auto_error=False,
)


def _get_issuer() -> str:
    return (
        f"https://cognito-idp."
        f"{settings.aws_region}"
        ".amazonaws.com/"
        f"{settings.cognito_user_pool_id}"
    )


def _get_jwks_url() -> str:
    return (
        f"{_get_issuer()}"
        "/.well-known/jwks.json"
    )


jwks_client = PyJWKClient(
    _get_jwks_url(),
    cache_keys=True,
)


def _unauthorized(
    detail: str = "Token de acceso inválido.",
) -> HTTPException:
    return HTTPException(
        status_code=(
            status.HTTP_401_UNAUTHORIZED
        ),
        detail=detail,
        headers={
            "WWW-Authenticate":
                "Bearer",
        },
    )


def verify_access_token(
    token: str,
) -> dict:
    if (
        not settings
        .cognito_user_pool_id
        or not settings
        .cognito_client_id
    ):
        raise RuntimeError(
            "Cognito no está configurado."
        )

    try:
        signing_key = (
            jwks_client
            .get_signing_key_from_jwt(
                token
            )
        )

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=[
                "RS256"
            ],
            issuer=_get_issuer(),
            options={
                "verify_aud": False,
                "require": [
                    "exp",
                    "iss",
                    "sub",
                    "token_use",
                    "client_id",
                ],
            },
        )

    except (
        InvalidTokenError,
        PyJWKClientError,
    ) as exc:
        raise _unauthorized() from exc

    if (
        payload.get(
            "token_use"
        )
        != "access"
    ):
        raise _unauthorized(
            "Se requiere un access token."
        )

    if (
        payload.get(
            "client_id"
        )
        != settings.cognito_client_id
    ):
        raise _unauthorized(
            "El token pertenece "
            "a otro cliente."
        )

    return payload


def get_current_user(
    credentials:
        HTTPAuthorizationCredentials
        | None = Depends(
            bearer_scheme
        ),
) -> CurrentUser:
    if credentials is None:
        raise _unauthorized(
            "Autenticación requerida."
        )

    payload = verify_access_token(
        credentials.credentials
    )

    return CurrentUser(
        sub=payload["sub"],
        username=payload.get(
            "username"
        ),
        groups=payload.get(
            "cognito:groups",
            [],
        ),
    )

def require_admin(
    current_user: CurrentUser = Depends(
        get_current_user
    ),
) -> CurrentUser:
    if (
        "admins"
        not in current_user.groups
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail=(
                "Se requieren permisos "
                "de administrador."
            ),
        )

    return current_user
