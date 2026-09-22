from datetime import (
    datetime,
    timedelta,
)
from urllib.parse import quote
from zoneinfo import ZoneInfo

import httpx

from app.core.config import (
    get_settings,
)
from app.services.secrets_service import (
    get_json_secret,
)
from app.services.integrations_service import (
    get_google_refresh_token,
)


settings = get_settings()


TOKEN_URL = (
    "https://oauth2.googleapis.com/token"
)

CALENDAR_BASE_URL = (
    "https://www.googleapis.com/calendar/v3"
)


def _get_access_token(
    config: dict,
    refresh_token: str,
) -> str:
    response = httpx.post(
        TOKEN_URL,
        data={
            "client_id": (
                config[
                    "GOOGLE_CLIENT_ID"
                ]
            ),
            "client_secret": (
                config[
                    "GOOGLE_CLIENT_SECRET"
                ]
            ),
            "refresh_token":
                refresh_token,
            "grant_type": (
                "refresh_token"
            ),
        },
        headers={
            "Content-Type": (
                "application/"
                "x-www-form-urlencoded"
            ),
        },
        timeout=15.0,
    )

    response.raise_for_status()

    result = response.json()

    return result[
        "access_token"
    ]


def _build_event(
    titulo: str,
    fecha: str,
    hora_inicio: str,
    duracion_minutos: int,
    descripcion: str | None,
    participantes: list[str],
    timezone_name: str,
) -> dict:
    timezone = ZoneInfo(
        timezone_name
    )

    start_datetime = (
        datetime.strptime(
            (
                f"{fecha} "
                f"{hora_inicio}"
            ),
            "%Y-%m-%d %H:%M",
        )
        .replace(
            tzinfo=timezone
        )
    )

    end_datetime = (
        start_datetime
        + timedelta(
            minutes=(
                duracion_minutos
            )
        )
    )

    event = {
        "summary": titulo,
        "start": {
            "dateTime": (
                start_datetime
                .isoformat()
            ),
            "timeZone": (
                timezone_name
            ),
        },
        "end": {
            "dateTime": (
                end_datetime
                .isoformat()
            ),
            "timeZone": (
                timezone_name
            ),
        },
    }

    if descripcion:
        event[
            "description"
        ] = descripcion

    if participantes:
        event[
            "attendees"
        ] = [
            {
                "email": email,
            }
            for email
            in participantes
            if email
        ]

    return event


def create_google_calendar_event(
    user_id: str,
    titulo: str,
    fecha: str,
    hora_inicio: str,
    duracion_minutos: int,
    descripcion: str | None = None,
    participantes: list[str] | None = None,
) -> dict:
    if (
        not titulo
        or not fecha
        or not hora_inicio
        or not duracion_minutos
    ):
        return {
            "success": False,
            "error": (
                "titulo, fecha, "
                "hora_inicio y "
                "duracion_minutos "
                "son obligatorios"
            ),
        }

    if duracion_minutos <= 0:
        return {
            "success": False,
            "error": (
                "duracion_minutos "
                "debe ser mayor "
                "que cero"
            ),
        }

    refresh_token = (
        get_google_refresh_token(
            user_id=user_id
        )
    )

    if not refresh_token:
        return {
            "success": False,
            "error": (
                "Google Calendar "
                "no está conectado "
                "para este usuario."
            ),
            "error_code":
                "google_calendar_not_connected",
        }

    try:
        config = get_json_secret(
            settings.google_secret_id
        )

        access_token = (
            _get_access_token(
                config=config,
                refresh_token=(
                    refresh_token
                ),
            )
        )

        timezone_name = (
            settings
            .google_time_zone
        )

        calendar_event = (
            _build_event(
                titulo=titulo,
                fecha=fecha,
                hora_inicio=(
                    hora_inicio
                ),
                duracion_minutos=(
                    duracion_minutos
                ),
                descripcion=(
                    descripcion
                ),
                participantes=(
                    participantes
                    or []
                ),
                timezone_name=(
                    timezone_name
                ),
            )
        )

        calendar_id = (
            config.get(
                "GOOGLE_CALENDAR_ID",
                "primary",
            )
        )

        encoded_calendar_id = (
            quote(
                calendar_id,
                safe="",
            )
        )

        url = (
            f"{CALENDAR_BASE_URL}"
            f"/calendars/"
            f"{encoded_calendar_id}"
            "/events"
        )

        response = httpx.post(
            url,
            params={
                "sendUpdates":
                    "all",
            },
            json=calendar_event,
            headers={
                "Authorization": (
                    "Bearer "
                    f"{access_token}"
                ),
                "Accept": (
                    "application/json"
                ),
                "Content-Type": (
                    "application/json"
                ),
            },
            timeout=15.0,
        )

        response.raise_for_status()

        created_event = (
            response.json()
        )

        return {
            "success": True,
            "action": "created",
            "event_id": (
                created_event.get(
                    "id"
                )
            ),
            "event_url": (
                created_event.get(
                    "htmlLink"
                )
            ),
            "start": (
                created_event
                .get(
                    "start",
                    {},
                )
                .get(
                    "dateTime"
                )
            ),
            "end": (
                created_event
                .get(
                    "end",
                    {},
                )
                .get(
                    "dateTime"
                )
            ),
        }

    except ValueError:
        return {
            "success": False,
            "error": (
                "La fecha u hora "
                "tiene un formato "
                "inválido. Se espera "
                "YYYY-MM-DD y HH:MM."
            ),
        }

    except httpx.HTTPStatusError as exc:
        print(
            "Google Calendar "
            "HTTP error: "
            f"{exc.response.status_code}"
        )

        return {
            "success": False,
            "error": (
                "Google Calendar "
                "rechazó la operación"
            ),
            "status_code": (
                exc.response
                .status_code
            ),
        }

    except Exception as exc:
        print(
            "Google Calendar "
            "integration error: "
            f"{type(exc).__name__}"
        )

        return {
            "success": False,
            "error": (
                "No se pudo completar "
                "la operación en "
                "Google Calendar"
            ),
            "error_type": (
                type(exc).__name__
            ),
        }