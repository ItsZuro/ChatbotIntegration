TOOLS = [
    {
        "type": "function",
        "name": "crear_ticket_en_jira",
        "description": (
            "Crea un ticket en Jira para registrar una tarea o requisito "
            "relacionado con un proyecto de software. Utilizar únicamente "
            "cuando la solicitud contenga información suficiente para "
            "describir la tarea."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "titulo": {
                    "type": "string",
                    "description": (
                        "Título breve y específico del ticket."
                    )
                },
                "descripcion": {
                    "type": "string",
                    "description": (
                        "Descripción completa de la tarea o requisito "
                        "identificado."
                    )
                },
                "cliente": {
                    "type": ["string", "null"],
                    "description": (
                        "Nombre de la empresa o cliente relacionado. "
                        "Usar null si no fue proporcionado."
                    )
                },
                "modulo": {
                    "type": ["string", "null"],
                    "description": (
                        "Módulo o componente del sistema relacionado. "
                        "Usar null si no fue proporcionado."
                    )
                }
            },
            "required": [
                "titulo",
                "descripcion",
                "cliente",
                "modulo"
            ],
            "additionalProperties": False
        },
        "strict": True
    },

    {
        "type": "function",
        "name": "agendar_reunion_en_google_calendar",
        "description": (
            "Programa una reunión en Google Calendar. No utilizar si faltan "
            "la fecha, la hora de inicio o la duración. Si el usuario desea "
            "invitar participantes, deben estar disponibles sus correos."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "titulo": {
                    "type": "string",
                    "description": "Título de la reunión."
                },
                "fecha": {
                    "type": "string",
                    "description": (
                        "Fecha de la reunión en formato YYYY-MM-DD."
                    )
                },
                "hora_inicio": {
                    "type": "string",
                    "description": (
                        "Hora de inicio en formato de 24 horas HH:MM."
                    )
                },
                "duracion_minutos": {
                    "type": "integer",
                    "description": (
                        "Duración de la reunión expresada en minutos."
                    )
                },
                "descripcion": {
                    "type": ["string", "null"],
                    "description": (
                        "Descripción o asunto adicional de la reunión. "
                        "Usar null cuando no corresponda."
                    )
                },
                "participantes": {
                    "type": "array",
                    "description": (
                        "Correos electrónicos de los participantes que "
                        "deben recibir invitación."
                    ),
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": [
                "titulo",
                "fecha",
                "hora_inicio",
                "duracion_minutos",
                "descripcion",
                "participantes"
            ],
            "additionalProperties": False
        },
        "strict": True
    },

    {
        "type": "function",
        "name": "actualizar_contacto_en_hubspot",
        "description": (
            "Crea o actualiza un contacto o prospecto en HubSpot CRM. "
            "Utilizar cuando exista información suficiente para identificar "
            "de forma segura al contacto. El correo electrónico es "
            "obligatorio."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "nombre": {
                    "type": "string",
                    "description": "Nombre del contacto."
                },
                "apellido": {
                    "type": ["string", "null"],
                    "description": (
                        "Apellido del contacto. Usar null si no está "
                        "disponible."
                    )
                },
                "email": {
                    "type": "string",
                    "description": (
                        "Correo electrónico del contacto."
                    )
                },
                "empresa": {
                    "type": ["string", "null"],
                    "description": (
                        "Empresa a la que pertenece el contacto. "
                        "Usar null si no está disponible."
                    )
                }
            },
            "required": [
                "nombre",
                "apellido",
                "email",
                "empresa"
            ],
            "additionalProperties": False
        },
        "strict": True
    }
]