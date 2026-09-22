from app.services.google_calendar_service import (
    create_google_calendar_event,
)
from app.services.hubspot_service import (
    create_hubspot_deal,
    update_hubspot_company,
    update_hubspot_contact,
)
from app.services.jira_service import (
    create_jira_ticket,
)


def execute_tool(
    tool_name: str,
    arguments: dict,
    user_id: str | None = None,
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
            empresa_id=arguments.get(
                "empresa_id"
            ),
        )

    if tool_name == (
        "registrar_empresa_en_hubspot"
    ):
        return update_hubspot_company(
            nombre=arguments[
                "nombre"
            ],
            dominio=arguments.get(
                "dominio"
            ),
            sitio_web=arguments.get(
                "sitio_web"
            ),
        )

    if tool_name == (
        "crear_oportunidad_en_hubspot"
    ):
        return create_hubspot_deal(
            nombre=arguments[
                "nombre"
            ],
            monto=arguments.get(
                "monto"
            ),
            contacto_id=arguments.get(
                "contacto_id"
            ),
            empresa_id=arguments.get(
                "empresa_id"
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
        if not user_id:
            return {
                "success": False,
                "error": (
                    "No se pudo identificar "
                    "al usuario para acceder "
                    "a Google Calendar."
                ),
            }

        return create_google_calendar_event(
            user_id=user_id,
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