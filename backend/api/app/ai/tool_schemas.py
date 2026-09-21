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
                },
                "empresa_id": {
                    "type": [
                        "string",
                        "null"
                    ],
                    "description": (
                        "ID real de la empresa "
                        "en HubSpot obtenido "
                        "previamente mediante "
                        "registrar_empresa_en_hubspot. "
                        "Nunca inventarlo."
                    )
                }
            },
            "required": [
                "nombre",
                "apellido",
                "email",
                "empresa",
                "empresa_id"
            ],
            "additionalProperties": False
        },
        "strict": True
    },

        {
        "type": "function",
        "name": "registrar_empresa_en_hubspot",
        "description": (
            "Crea o actualiza una empresa en HubSpot CRM. "
            "Utilizar cuando se identifique una empresa "
            "relacionada con un cliente o prospecto."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "nombre": {
                    "type": "string",
                    "description": (
                        "Nombre oficial o comercial "
                        "de la empresa."
                    )
                },
                "dominio": {
                    "type": [
                        "string",
                        "null"
                    ],
                    "description": (
                        "Dominio web de la empresa, "
                        "por ejemplo techcorp.com. "
                        "Usar null si no se conoce."
                    )
                },
                "sitio_web": {
                    "type": [
                        "string",
                        "null"
                    ],
                    "description": (
                        "URL del sitio web de la empresa. "
                        "Usar null si no fue proporcionada."
                    )
                }
            },
            "required": [
                "nombre",
                "dominio",
                "sitio_web"
            ],
            "additionalProperties": False
        },
        "strict": True
    },

    {
        "type": "function",
        "name": "crear_oportunidad_en_hubspot",
        "description": (
            "Crea una oportunidad comercial en HubSpot CRM "
            "cuando existe una intención comercial clara, "
            "como un proyecto, propuesta, negociación "
            "o intención de compra."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "nombre": {
                    "type": "string",
                    "description": (
                        "Nombre claro y descriptivo "
                        "de la oportunidad comercial."
                    )
                },
                "monto": {
                    "type": [
                        "number",
                        "null"
                    ],
                    "description": (
                        "Valor monetario de la oportunidad. "
                        "Usar null si el usuario no indicó "
                        "un monto."
                    )
                },
                "contacto_id": {
                    "type": [
                        "string",
                        "null"
                    ],
                    "description": (
                        "ID real del contacto en HubSpot "
                        "obtenido previamente mediante una "
                        "herramienta. Nunca inventarlo."
                    )
                },
                "empresa_id": {
                    "type": [
                        "string",
                        "null"
                    ],
                    "description": (
                        "ID real de la empresa en HubSpot "
                        "obtenido previamente mediante una "
                        "herramienta. Nunca inventarlo."
                    )
                }
            },
            "required": [
                "nombre",
                "monto",
                "contacto_id",
                "empresa_id"
            ],
            "additionalProperties": False
        },
        "strict": True
    }
]