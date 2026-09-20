import json
import os
import urllib.error
import urllib.parse
import urllib.request

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import boto3


TOKEN_URL = "https://oauth2.googleapis.com/token"
CALENDAR_BASE_URL = "https://www.googleapis.com/calendar/v3"

secrets_client = boto3.client("secretsmanager")


def get_google_config():
    secret_id = os.environ["GOOGLE_SECRET_ID"]

    response = secrets_client.get_secret_value(
        SecretId=secret_id
    )

    return json.loads(response["SecretString"])


def get_access_token(config: dict) -> str:
    payload = urllib.parse.urlencode({
        "client_id": config["GOOGLE_CLIENT_ID"],
        "client_secret": config["GOOGLE_CLIENT_SECRET"],
        "refresh_token": config["GOOGLE_REFRESH_TOKEN"],
        "grant_type": "refresh_token"
    }).encode("utf-8")

    request = urllib.request.Request(
        url=TOKEN_URL,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/x-www-form-urlencoded"
        }
    )

    with urllib.request.urlopen(
        request,
        timeout=15
    ) as response:
        result = json.loads(
            response.read().decode("utf-8")
        )

    return result["access_token"]


def build_event(
    titulo: str,
    fecha: str,
    hora_inicio: str,
    duracion_minutos: int,
    descripcion: str | None,
    participantes: list[str],
    timezone_name: str
) -> dict:
    timezone = ZoneInfo(timezone_name)

    start_datetime = datetime.strptime(
        f"{fecha} {hora_inicio}",
        "%Y-%m-%d %H:%M"
    ).replace(tzinfo=timezone)

    end_datetime = start_datetime + timedelta(
        minutes=duracion_minutos
    )

    event = {
        "summary": titulo,
        "start": {
            "dateTime": start_datetime.isoformat(),
            "timeZone": timezone_name
        },
        "end": {
            "dateTime": end_datetime.isoformat(),
            "timeZone": timezone_name
        }
    }

    if descripcion:
        event["description"] = descripcion

    if participantes:
        event["attendees"] = [
            {
                "email": email
            }
            for email in participantes
            if email
        ]

    return event


def create_calendar_event(
    config: dict,
    event: dict
) -> dict:
    access_token = get_access_token(config)

    calendar_id = config.get(
        "GOOGLE_CALENDAR_ID",
        "primary"
    )

    encoded_calendar_id = urllib.parse.quote(
        calendar_id,
        safe=""
    )

    url = (
        f"{CALENDAR_BASE_URL}/calendars/"
        f"{encoded_calendar_id}/events"
        "?sendUpdates=all"
    )

    request = urllib.request.Request(
        url=url,
        data=json.dumps(event).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    )

    with urllib.request.urlopen(
        request,
        timeout=15
    ) as response:
        return json.loads(
            response.read().decode("utf-8")
        )


def lambda_handler(event, context):
    try:
        titulo = event.get("titulo")
        fecha = event.get("fecha")
        hora_inicio = event.get("hora_inicio")
        duracion_minutos = event.get("duracion_minutos")
        descripcion = event.get("descripcion")
        participantes = event.get("participantes") or []

        if (
            not titulo
            or not fecha
            or not hora_inicio
            or not duracion_minutos
        ):
            return {
                "success": False,
                "error": (
                    "titulo, fecha, hora_inicio y "
                    "duracion_minutos son obligatorios"
                )
            }

        if duracion_minutos <= 0:
            return {
                "success": False,
                "error": (
                    "duracion_minutos debe ser mayor que cero"
                )
            }

        config = get_google_config()

        timezone_name = os.environ.get(
            "GOOGLE_TIME_ZONE",
            "America/Lima"
        )

        calendar_event = build_event(
            titulo=titulo,
            fecha=fecha,
            hora_inicio=hora_inicio,
            duracion_minutos=duracion_minutos,
            descripcion=descripcion,
            participantes=participantes,
            timezone_name=timezone_name
        )

        created_event = create_calendar_event(
            config=config,
            event=calendar_event
        )

        return {
            "success": True,
            "action": "created",
            "event_id": created_event.get("id"),
            "event_url": created_event.get("htmlLink"),
            "start": (
                created_event
                .get("start", {})
                .get("dateTime")
            ),
            "end": (
                created_event
                .get("end", {})
                .get("dateTime")
            )
        }

    except ValueError:
        return {
            "success": False,
            "error": (
                "La fecha u hora tiene un formato inválido. "
                "Se espera YYYY-MM-DD y HH:MM."
            )
        }

    except urllib.error.HTTPError as error:
        print(
            f"Google Calendar HTTP error: {error.code}"
        )

        return {
            "success": False,
            "error": (
                "Google Calendar rechazó la operación"
            ),
            "status_code": error.code
        }

    except Exception as error:
        print(
            f"Google Calendar integration error: "
            f"{type(error).__name__}"
        )

        return {
            "success": False,
            "error": (
                "No se pudo completar la operación "
                "en Google Calendar"
            ),
            "error_type": type(error).__name__
        }