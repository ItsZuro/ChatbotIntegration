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


def _get_service_config() -> dict:
    return get_json_secret(
        settings.hubspot_secret_id
    )


def _get_service_key() -> str:
    return _get_service_config()[
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


def _find_company(
    service_key: str,
    nombre: str,
    dominio: str | None = None,
) -> dict | None:
    if dominio:
        property_name = "domain"
        value = dominio
    else:
        property_name = "name"
        value = nombre

    payload = {
        "filterGroups": [
            {
                "filters": [
                    {
                        "propertyName":
                            property_name,
                        "operator": "EQ",
                        "value": value,
                    }
                ]
            }
        ],
        "properties": [
            "name",
            "domain",
            "website",
        ],
        "limit": 1,
    }

    result = _request(
        method="POST",
        path=(
            "/crm/v3/objects/"
            "companies/search"
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


def _associate_default(
    service_key: str,
    from_object_type: str,
    from_object_id: str,
    to_object_type: str,
    to_object_id: str,
) -> None:
    response = httpx.put(
        (
            f"{HUBSPOT_BASE_URL}"
            "/crm/v4/objects/"
            f"{from_object_type}/"
            f"{from_object_id}/"
            "associations/default/"
            f"{to_object_type}/"
            f"{to_object_id}"
        ),
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


def update_hubspot_contact(
    nombre: str,
    email: str,
    apellido: str | None = None,
    empresa: str | None = None,
    empresa_id: str | None = None,
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

        contact_id = (
            contact.get("id")
        )

        association_warning = None

        if empresa_id and contact_id:
            try:
                _associate_default(
                    service_key=service_key,
                    from_object_type=(
                        "contacts"
                    ),
                    from_object_id=(
                        contact_id
                    ),
                    to_object_type=(
                        "companies"
                    ),
                    to_object_id=(
                        empresa_id
                    ),
                )
            except Exception:
                association_warning = (
                    "No se pudo asociar "
                    "el contacto con "
                    "la empresa."
                )

        return {
            "success": True,
            "action": action,
            "contact_id": contact_id,
            "email": email,
            "company_id":
                empresa_id,
            "warning":
                association_warning,
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


    
def update_hubspot_company(
    nombre: str,
    dominio: str | None = None,
    sitio_web: str | None = None,
) -> dict:
    if not nombre:
        return {
            "success": False,
            "error": (
                "nombre es obligatorio"
            ),
        }

    try:
        service_key = (
            _get_service_key()
        )

        properties = {
            "name": nombre,
        }

        if dominio:
            properties[
                "domain"
            ] = dominio

        if sitio_web:
            properties[
                "website"
            ] = sitio_web

        existing_company = (
            _find_company(
                service_key=service_key,
                nombre=nombre,
                dominio=dominio,
            )
        )

        if existing_company:
            company = _request(
                method="PATCH",
                path=(
                    "/crm/v3/objects/"
                    "companies/"
                    f"{existing_company['id']}"
                ),
                service_key=service_key,
                payload={
                    "properties":
                        properties
                },
            )

            action = "updated"

        else:
            company = _request(
                method="POST",
                path=(
                    "/crm/v3/objects/"
                    "companies"
                ),
                service_key=service_key,
                payload={
                    "properties":
                        properties
                },
            )

            action = "created"

        return {
            "success": True,
            "action": action,
            "company_id": (
                company.get("id")
            ),
            "name": nombre,
            "domain": dominio,
        }

    except httpx.HTTPStatusError as exc:
        print(
            "HubSpot company HTTP error: "
            f"{exc.response.status_code}"
        )

        return {
            "success": False,
            "error": (
                "HubSpot rechazó "
                "la operación"
            ),
            "status_code": (
                exc.response.status_code
            ),
        }

    except Exception as exc:
        print(
            "HubSpot company error: "
            f"{type(exc).__name__}"
        )

        return {
            "success": False,
            "error": (
                "No se pudo registrar "
                "la empresa en HubSpot"
            ),
            "error_type":
                type(exc).__name__,
        }

def create_hubspot_deal(
    nombre: str,
    monto: float | None = None,
    contacto_id: str | None = None,
    empresa_id: str | None = None,
) -> dict:
    if not nombre:
        return {
            "success": False,
            "error": (
                "nombre es obligatorio"
            ),
        }

    if (
        monto is not None
        and monto < 0
    ):
        return {
            "success": False,
            "error": (
                "monto no puede "
                "ser negativo"
            ),
        }

    try:
        config = (
            _get_service_config()
        )

        service_key = config[
            "HUBSPOT_SERVICE_KEY"
        ]

        pipeline_id = config[
            "HUBSPOT_PIPELINE_ID"
        ]

        deal_stage_id = config[
            "HUBSPOT_DEAL_STAGE_ID"
        ]

        properties = {
            "dealname": nombre,
            "pipeline": pipeline_id,
            "dealstage": deal_stage_id,
        }

        if monto is not None:
            properties[
                "amount"
            ] = str(monto)

        deal = _request(
            method="POST",
            path=(
                "/crm/v3/objects/deals"
            ),
            service_key=service_key,
            payload={
                "properties":
                    properties
            },
        )

        deal_id = deal.get("id")

        association_warnings = []

        if contacto_id and deal_id:
            try:
                _associate_default(
                    service_key=service_key,
                    from_object_type=(
                        "deals"
                    ),
                    from_object_id=(
                        deal_id
                    ),
                    to_object_type=(
                        "contacts"
                    ),
                    to_object_id=(
                        contacto_id
                    ),
                )
            except Exception:
                association_warnings.append(
                    "No se pudo asociar "
                    "el contacto."
                )

        if empresa_id and deal_id:
            try:
                _associate_default(
                    service_key=service_key,
                    from_object_type=(
                        "deals"
                    ),
                    from_object_id=(
                        deal_id
                    ),
                    to_object_type=(
                        "companies"
                    ),
                    to_object_id=(
                        empresa_id
                    ),
                )
            except Exception:
                association_warnings.append(
                    "No se pudo asociar "
                    "la empresa."
                )

        return {
            "success": True,
            "action": "created",
            "deal_id": deal_id,
            "name": nombre,
            "amount": monto,
            "contact_id":
                contacto_id,
            "company_id":
                empresa_id,
            "warnings":
                association_warnings,
        }

    except KeyError as exc:
        return {
            "success": False,
            "error": (
                "Falta configuración "
                "de HubSpot para Deals"
            ),
            "missing":
                str(exc),
        }

    except httpx.HTTPStatusError as exc:
        print(
            "HubSpot deal HTTP error: "
            f"{exc.response.status_code}"
        )

        return {
            "success": False,
            "error": (
                "HubSpot rechazó "
                "la oportunidad"
            ),
            "status_code": (
                exc.response.status_code
            ),
        }

    except Exception as exc:
        print(
            "HubSpot deal error: "
            f"{type(exc).__name__}"
        )

        return {
            "success": False,
            "error": (
                "No se pudo crear "
                "la oportunidad "
                "en HubSpot"
            ),
            "error_type":
                type(exc).__name__,
        }



