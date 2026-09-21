import httpx

from app.core.config import (
    get_settings,
)

from app.services.secrets_service import (
    get_json_secret,
)


settings = get_settings()


def _build_description(
    descripcion: str,
    cliente: str | None,
    modulo: str | None,
) -> dict:
    paragraphs = [
        descripcion
    ]

    if cliente:
        paragraphs.append(
            f"Cliente: {cliente}"
        )

    if modulo:
        paragraphs.append(
            f"Módulo: {modulo}"
        )

    content = []

    for paragraph in paragraphs:
        content.append(
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": paragraph,
                    }
                ],
            }
        )

    return {
        "type": "doc",
        "version": 1,
        "content": content,
    }


def create_jira_ticket(
    titulo: str,
    descripcion: str,
    cliente: str | None = None,
    modulo: str | None = None,
) -> dict:
    if not titulo or not descripcion:
        return {
            "success": False,
            "error": (
                "titulo y descripcion "
                "son obligatorios"
            ),
        }

    try:
        config = get_json_secret(
            settings.jira_secret_id
        )

        cloud_id = config[
            "JIRA_CLOUD_ID"
        ]

        project_key = config[
            "JIRA_PROJECT_KEY"
        ]

        email = config[
            "JIRA_EMAIL"
        ]

        api_token = config[
            "JIRA_API_TOKEN"
        ]

        site_url = config[
            "JIRA_SITE_URL"
        ].rstrip("/")

        url = (
            "https://api.atlassian.com/"
            f"ex/jira/{cloud_id}/"
            "rest/api/3/issue"
        )

        payload = {
            "fields": {
                "project": {
                    "key":
                        project_key,
                },
                "summary":
                    titulo,
                "description":
                    _build_description(
                        descripcion=(
                            descripcion
                        ),
                        cliente=(
                            cliente
                        ),
                        modulo=(
                            modulo
                        ),
                    ),
                "issuetype": {
                    "name":
                        "Task",
                },
            }
        }

        response = httpx.post(
            url,
            json=payload,
            auth=httpx.BasicAuth(
                email,
                api_token,
            ),
            headers={
                "Accept":
                    "application/json",
                "Content-Type":
                    "application/json",
            },
            timeout=15.0,
        )

        response.raise_for_status()

        issue = response.json()

        issue_key = (
            issue.get(
                "key"
            )
        )

        return {
            "success": True,
            "action": "created",
            "issue_id": (
                issue.get(
                    "id"
                )
            ),
            "issue_key": (
                issue_key
            ),
            "issue_url": (
                (
                    f"{site_url}/"
                    f"browse/"
                    f"{issue_key}"
                )
                if issue_key
                else None
            ),
        }

    except httpx.HTTPStatusError as exc:
        print(
            "Jira HTTP error: "
            f"{exc.response.status_code}"
        )

        return {
            "success": False,
            "error": (
                "Jira rechazó "
                "la operación"
            ),
            "status_code": (
                exc.response
                .status_code
            ),
        }

    except Exception as exc:
        print(
            "Jira integration error: "
            f"{type(exc).__name__}"
        )

        return {
            "success": False,
            "error": (
                "No se pudo completar "
                "la operación en Jira"
            ),
            "error_type": (
                type(exc).__name__
            ),
        }