import json
import os
import urllib.error
import urllib.request

import boto3


HUBSPOT_BASE_URL = "https://api.hubapi.com"

secrets_client = boto3.client("secretsmanager")


def get_hubspot_service_key():
    secret_id = os.environ["HUBSPOT_SECRET_ID"]

    response = secrets_client.get_secret_value(
        SecretId=secret_id
    )

    secret = json.loads(response["SecretString"])

    return secret["HUBSPOT_SERVICE_KEY"]


def hubspot_request(method, path, service_key, payload=None):
    url = f"{HUBSPOT_BASE_URL}{path}"

    data = None

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    request = urllib.request.Request(
        url=url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json"
        }
    )

    with urllib.request.urlopen(request, timeout=15) as response:
        response_body = response.read().decode("utf-8")

        if not response_body:
            return {}

        return json.loads(response_body)


def find_contact_by_email(service_key, email):
    payload = {
        "filterGroups": [
            {
                "filters": [
                    {
                        "propertyName": "email",
                        "operator": "EQ",
                        "value": email
                    }
                ]
            }
        ],
        "properties": [
            "firstname",
            "lastname",
            "email",
            "company"
        ],
        "limit": 1
    }

    result = hubspot_request(
        method="POST",
        path="/crm/v3/objects/contacts/search",
        service_key=service_key,
        payload=payload
    )

    results = result.get("results", [])

    if not results:
        return None

    return results[0]


def create_contact(service_key, properties):
    return hubspot_request(
        method="POST",
        path="/crm/v3/objects/contacts",
        service_key=service_key,
        payload={
            "properties": properties
        }
    )


def update_contact(service_key, contact_id, properties):
    return hubspot_request(
        method="PATCH",
        path=f"/crm/v3/objects/contacts/{contact_id}",
        service_key=service_key,
        payload={
            "properties": properties
        }
    )


def lambda_handler(event, context):
    try:
        nombre = event.get("nombre")
        apellido = event.get("apellido")
        email = event.get("email")
        empresa = event.get("empresa")

        if not nombre or not email:
            return {
                "success": False,
                "error": "nombre y email son obligatorios"
            }

        service_key = get_hubspot_service_key()

        properties = {
            "firstname": nombre,
            "email": email
        }

        if apellido:
            properties["lastname"] = apellido

        if empresa:
            properties["company"] = empresa

        existing_contact = find_contact_by_email(
            service_key=service_key,
            email=email
        )

        if existing_contact:
            contact = update_contact(
                service_key=service_key,
                contact_id=existing_contact["id"],
                properties=properties
            )

            action = "updated"

        else:
            contact = create_contact(
                service_key=service_key,
                properties=properties
            )

            action = "created"

        return {
            "success": True,
            "action": action,
            "contact_id": contact.get("id"),
            "email": email
        }

    except urllib.error.HTTPError as error:
        print(
            f"HubSpot HTTP error: {error.code}"
        )

        return {
            "success": False,
            "error": "HubSpot rechazó la operación",
            "status_code": error.code
        }

    except Exception as error:
        print(
            f"HubSpot integration error: {type(error).__name__}"
        )

        return {
            "success": False,
            "error": "No se pudo completar la operación en HubSpot",
            "error_type": type(error).__name__
        }