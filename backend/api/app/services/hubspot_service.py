import httpx

from app.core.config import (
    get_settings,
)

from app.services.secrets_service import (
    get_json_secret,
)


settings = get_settings()

HUBSPOT_BASE_URL = (
    "https://api.hubapi.com"
)


def _get_service_key() -> str:
    secret = get_json_secret(
        settings.hubspot_secret_id
    )

    return secret[
        "HUBSPOT_SERVICE_KEY"
    ]


def _request(
    method: str,
    path: str,
    service_key: str,
    payload: dict | None = None,
) -> dict:
    response = httpx.request(
        method=method,
        url=(
            f"{HUBSPOT_BASE_URL}"
            f"{path}"
        ),
        json=payload,
        headers={
            "Authorization": (
                f"Bearer {service_key}"
            ),
            "Content-Type": (
                "application/json"
            ),
        },
        timeout=15.0,
    )

    response.raise_for_status()

    if not response.content:
        return {}

    return response.json()


def _find_contact_by_email(
    service_key: str,
    email: str,
) -> dict | None:
    payload = {
        "filterGroups": [
            {
                "filters": [
                    {
                        "propertyName": (
                            "email"
                        ),
                        "operator": "EQ",
                        "value": email,
                    }
                ]
            }
        ],
        "properties": [
            "firstname",
            "lastname",
            "email",
            "company",
        ],
        "limit": 1,
    }

    result = _request(
        method="POST",
        path=(
            "/crm/v3/objects/"
            "contacts/search"
        ),
        service_key=service_key,
        payload=payload,
    )

    results = result.get(
        "results",
        [],
    )

    if not results:
        return None

    return results[0]


def update_hubspot_contact(
    nombre: str,
    email: str,
    apellido: str | None = None,
    empresa: str | None = None,
) -> dict:
    if not nombre or not email:
        return {
            "success": False,
            "error": (
                "nombre y email "
                "son obligatorios"
            ),
        }

    try:
        service_key = (
            _get_service_key()
        )

        properties = {
            "firstname": nombre,
            "email": email,
        }

        if apellido:
            properties[
                "lastname"
            ] = apellido

        if empresa:
            properties[
                "company"
            ] = empresa

        existing_contact = (
            _find_contact_by_email(
                service_key=service_key,
                email=email,
            )
        )

        if existing_contact:
            contact = _request(
                method="PATCH",
                path=(
                    "/crm/v3/objects/"
                    "contacts/"
                    f"{existing_contact['id']}"
                ),
                service_key=(
                    service_key
                ),
                payload={
                    "properties":
                        properties
                },
            )

            action = "updated"

        else:
            contact = _request(
                method="POST",
                path=(
                    "/crm/v3/objects/"
                    "contacts"
                ),
                service_key=(
                    service_key
                ),
                payload={
                    "properties":
                        properties
                },
            )

            action = "created"

        return {
            "success": True,
            "action": action,
            "contact_id": (
                contact.get("id")
            ),
            "email": email,
        }

    except httpx.HTTPStatusError as exc:
        print(
            "HubSpot HTTP error: "
            f"{exc.response.status_code}"
        )

        return {
            "success": False,
            "error": (
                "HubSpot rechazó "
                "la operación"
            ),
            "status_code": (
                exc.response
                .status_code
            ),
        }

    except Exception as exc:
        print(
            "HubSpot integration error: "
            f"{type(exc).__name__}"
        )

        return {
            "success": False,
            "error": (
                "No se pudo completar "
                "la operación en HubSpot"
            ),
            "error_type": (
                type(exc).__name__
            ),
        }