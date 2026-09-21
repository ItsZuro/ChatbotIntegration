from app.services.google_calendar_service import (
    create_google_calendar_event,
)
from app.services.hubspot_service import (
    update_hubspot_contact,
)
from app.services.jira_service import (
    create_jira_ticket,
)


def execute_tool(
    tool_name: str,
    arguments: dict,
) -> dict:
    if tool_name == (
        "actualizar_contacto_en_hubspot"
    ):
        return update_hubspot_contact(
            nombre=arguments[
                "nombre"
            ],
            email=arguments[
                "email"
            ],
            apellido=arguments.get(
                "apellido"
            ),
            empresa=arguments.get(
                "empresa"
            ),
        )

    if tool_name == (
        "crear_ticket_en_jira"
    ):
        return create_jira_ticket(
            titulo=arguments[
                "titulo"
            ],
            descripcion=arguments[
                "descripcion"
            ],
            cliente=arguments.get(
                "cliente"
            ),
            modulo=arguments.get(
                "modulo"
            ),
        )

    if tool_name == (
        "agendar_reunion_en_google_calendar"
    ):
        return create_google_calendar_event(
            titulo=arguments[
                "titulo"
            ],
            fecha=arguments[
                "fecha"
            ],
            hora_inicio=arguments[
                "hora_inicio"
            ],
            duracion_minutos=arguments[
                "duracion_minutos"
            ],
            descripcion=arguments.get(
                "descripcion"
            ),
            participantes=arguments.get(
                "participantes"
            ),
        )

    return {
        "success": False,
        "error": (
            "Herramienta no implementada: "
            f"{tool_name}"
        ),
    }