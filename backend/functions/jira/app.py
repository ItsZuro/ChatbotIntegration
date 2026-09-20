import base64
import json
import os
import urllib.error
import urllib.request

import boto3


secrets_client = boto3.client("secretsmanager")


def get_jira_config():
    secret_id = os.environ["JIRA_SECRET_ID"]

    response = secrets_client.get_secret_value(
        SecretId=secret_id
    )

    return json.loads(response["SecretString"])


def build_auth_header(email: str, api_token: str) -> str:
    credentials = f"{email}:{api_token}"

    encoded = base64.b64encode(
        credentials.encode("utf-8")
    ).decode("utf-8")

    return f"Basic {encoded}"


def build_description(
    descripcion: str,
    cliente: str | None,
    modulo: str | None
) -> dict:
    paragraphs = [
        descripcion
    ]

    if cliente:
        paragraphs.append(f"Cliente: {cliente}")

    if modulo:
        paragraphs.append(f"Módulo: {modulo}")

    content = []

    for paragraph in paragraphs:
        content.append({
            "type": "paragraph",
            "content": [
                {
                    "type": "text",
                    "text": paragraph
                }
            ]
        })

    return {
        "type": "doc",
        "version": 1,
        "content": content
    }


def create_jira_issue(
    config: dict,
    titulo: str,
    descripcion: str,
    cliente: str | None,
    modulo: str | None
) -> dict:
    cloud_id = config["JIRA_CLOUD_ID"]
    project_key = config["JIRA_PROJECT_KEY"]
    email = config["JIRA_EMAIL"]
    api_token = config["JIRA_API_TOKEN"]

    url = (
        f"https://api.atlassian.com/ex/jira/"
        f"{cloud_id}/rest/api/3/issue"
    )

    payload = {
        "fields": {
            "project": {
                "key": project_key
            },
            "summary": titulo,
            "description": build_description(
                descripcion=descripcion,
                cliente=cliente,
                modulo=modulo
            ),
            "issuetype": {
                "name": "Task"
            }
        }
    }

    request = urllib.request.Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": build_auth_header(
                email=email,
                api_token=api_token
            ),
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
        descripcion = event.get("descripcion")
        cliente = event.get("cliente")
        modulo = event.get("modulo")

        if not titulo or not descripcion:
            return {
                "success": False,
                "error": (
                    "titulo y descripcion son obligatorios"
                )
            }

        config = get_jira_config()

        issue = create_jira_issue(
            config=config,
            titulo=titulo,
            descripcion=descripcion,
            cliente=cliente,
            modulo=modulo
        )

        issue_key = issue.get("key")

        site_url = config["JIRA_SITE_URL"].rstrip("/")

        return {
            "success": True,
            "action": "created",
            "issue_id": issue.get("id"),
            "issue_key": issue_key,
            "issue_url": (
                f"{site_url}/browse/{issue_key}"
                if issue_key
                else None
            )
        }

    except urllib.error.HTTPError as error:
        print(
            f"Jira HTTP error: {error.code}"
        )

        return {
            "success": False,
            "error": "Jira rechazó la operación",
            "status_code": error.code
        }

    except Exception as error:
        print(
            f"Jira integration error: "
            f"{type(error).__name__}"
        )

        return {
            "success": False,
            "error": (
                "No se pudo completar la operación en Jira"
            ),
            "error_type": type(error).__name__
        }