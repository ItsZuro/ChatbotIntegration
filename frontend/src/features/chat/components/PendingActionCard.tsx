import {
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";

import {
  Building2,
  CalendarDays,
  Handshake,
  ShieldCheck,
  TicketCheck,
  Users,
} from "lucide-react";

import type {
  PendingActionResponse,
  PendingToolCall,
} from "../../../types/api.types";

interface PendingActionCardProps {
  action: PendingActionResponse;

  confirming: boolean;
  cancelling: boolean;

  onConfirm: () => void;
  onCancel: () => void;
}

function getToolMeta(call: PendingToolCall) {
  switch (call.name) {
    case "crear_ticket_en_jira":
      return {
        label: "Crear ticket en Jira",
        service: "Jira",
        icon: TicketCheck,
      };

    case "agendar_reunion_en_google_calendar":
      return {
        label: "Agendar reunión",
        service: "Google Calendar",
        icon: CalendarDays,
      };

    case "actualizar_contacto_en_hubspot":
      return {
        label: "Registrar contacto",
        service: "HubSpot",
        icon: Users,
      };

    case "registrar_empresa_en_hubspot":
      return {
        label: "Registrar empresa",
        service: "HubSpot",
        icon: Building2,
      };

    case "crear_oportunidad_en_hubspot":
      return {
        label: "Crear oportunidad",
        service: "HubSpot",
        icon: Handshake,
      };

    default:
      return {
        label: "Acción externa",
        service: "Integración",
        icon: ShieldCheck,
      };
  }
}

function formatArgumentValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "No especificado";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "Ninguno";
    }

    return value.map((item) => String(item)).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function getVisibleArguments(call: PendingToolCall) {
  const entries = Object.entries(call.arguments);

  return entries.filter(
    ([key]) => key !== "contacto_id" && key !== "empresa_id",
  );
}

function formatArgumentLabel(key: string): string {
  const labels: Record<string, string> = {
    titulo: "Título",
    descripcion: "Descripción",
    cliente: "Cliente",
    modulo: "Módulo",

    fecha: "Fecha",
    hora_inicio: "Hora",
    duracion_minutos: "Duración",
    participantes: "Participantes",

    nombre: "Nombre",
    apellido: "Apellido",
    email: "Correo",
    empresa: "Empresa",

    dominio: "Dominio",
    sitio_web: "Sitio web",

    monto: "Monto",
  };

  return labels[key] ?? key.replaceAll("_", " ");
}

export function PendingActionCard({
  action,
  confirming,
  cancelling,
  onConfirm,
  onCancel,
}: PendingActionCardProps) {
  return (
    <Paper withBorder radius="lg" p="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <ThemeIcon size={38} radius="xl" color="yellow" variant="light">
              <ShieldCheck size={20} />
            </ThemeIcon>

            <div>
              <Text fw={700}>Confirmación requerida</Text>

              <Text size="sm" c="dimmed">
                Revisa las acciones antes de permitir cambios en servicios
                externos.
              </Text>
            </div>
          </Group>

          <Badge color="yellow" variant="light">
            Pendiente
          </Badge>
        </Group>

        <Divider />

        <Stack gap="sm">
          {action.pending_calls.map((call, index) => {
            const meta = getToolMeta(call);

            const Icon = meta.icon;

            const argumentsToShow = getVisibleArguments(call);

            return (
              <Paper key={call.call_id} withBorder radius="md" p="md">
                <Stack gap="xs">
                  <Group gap="sm">
                    <ThemeIcon
                      variant="light"
                      color="violet"
                      size={30}
                      radius="xl"
                    >
                      <Icon size={16} />
                    </ThemeIcon>

                    <div>
                      <Text fw={600} size="sm">
                        {index + 1}. {meta.label}
                      </Text>

                      <Text size="xs" c="dimmed">
                        {meta.service}
                      </Text>
                    </div>
                  </Group>

                  {argumentsToShow.length > 0 && (
                    <Stack gap={4} mt={4}>
                      {argumentsToShow.map(([key, value]) => (
                        <Group
                          key={key}
                          gap="xs"
                          align="flex-start"
                          wrap="nowrap"
                        >
                          <Text size="xs" c="dimmed" miw={95}>
                            {formatArgumentLabel(key)}
                          </Text>

                          <Text
                            size="xs"
                            fw={500}
                            style={{
                              wordBreak: "break-word",
                            }}
                          >
                            {formatArgumentValue(value)}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>

        <Text size="xs" c="dimmed">
          Ninguna de estas acciones se ejecutará hasta que confirmes.
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button
            variant="default"
            disabled={confirming}
            loading={cancelling}
            onClick={onCancel}
          >
            Cancelar
          </Button>

          <Button
            color="violet"
            disabled={cancelling}
            loading={confirming}
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
