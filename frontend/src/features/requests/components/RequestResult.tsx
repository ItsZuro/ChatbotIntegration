import {
  Anchor,
  Badge,
  Box,
  Group,
  Tooltip,
} from "@mantine/core";

import {
  Building2,
  CalendarDays,
  Handshake,
  TicketCheck,
  Users,
  Wrench,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type {
  AssistantResponse,
  ExecutedTool,
} from "../../../types/api.types";


interface RequestResultProps {
  result: Pick<
    AssistantResponse,
    "response" | "executed_tools"
  >;
}


function getToolMeta(
  tool: ExecutedTool
) {
  switch (tool.name) {
    case "actualizar_contacto_en_hubspot":
      return {
        label: "HubSpot",
        icon: Users,
      };

    case "registrar_empresa_en_hubspot":
      return {
        label: "HubSpot",
        icon: Building2,
      };

    case "crear_oportunidad_en_hubspot":
      return {
        label: "HubSpot",
        icon: Handshake,
      };

    case "crear_ticket_en_jira":
      return {
        label: "Jira",
        icon: TicketCheck,
      };

    case "agendar_reunion_en_google_calendar":
      return {
        label: "Google Calendar",
        icon: CalendarDays,
      };

    default:
      return {
        label: "Integración",
        icon: Wrench,
      };
  }
}


function getToolUrl(
  tool: ExecutedTool
): string | null {
  if (
    tool.name ===
    "crear_ticket_en_jira"
  ) {
    const issueUrl =
      tool.result.issue_url;

    if (
      typeof issueUrl === "string" &&
      issueUrl.length > 0
    ) {
      return issueUrl;
    }
  }

  if (
    tool.name ===
    "agendar_reunion_en_google_calendar"
  ) {
    const eventUrl =
      tool.result.event_url;

    if (
      typeof eventUrl === "string" &&
      eventUrl.length > 0
    ) {
      return eventUrl;
    }
  }

  return null;
}


function getTooltipLabel(
  tool: ExecutedTool,
  url: string | null
) {
  if (!tool.result.success) {
    return "La acción produjo un error";
  }

  if (
    url &&
    tool.name === "crear_ticket_en_jira"
  ) {
    return "Abrir ticket en Jira";
  }

  if (
    url &&
    tool.name ===
      "agendar_reunion_en_google_calendar"
  ) {
    return "Abrir evento en Google Calendar";
  }

  return "Acción realizada correctamente";
}


export function RequestResult({
  result,
}: RequestResultProps) {
  return (
    <Box>
      <Box className="assistant-markdown">
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
          ]}
          components={{
            a: ({
              href,
              children,
            }) => (
              <Anchor
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                {children}
              </Anchor>
            ),
          }}
        >
          {result.response}
        </ReactMarkdown>
      </Box>

      {result.executed_tools.length >
        0 && (
        <Group
          gap="xs"
          mt="md"
        >
          {result.executed_tools.map(
            (tool, index) => {
              const meta =
                getToolMeta(tool);

              const Icon =
                meta.icon;

              const url =
                getToolUrl(tool);

              const badge = (
                <Badge
                  variant="light"
                  color={
                    tool.result.success
                      ? "teal"
                      : "red"
                  }
                  leftSection={
                    <Icon
                      size={13}
                    />
                  }
                  style={
                    url
                      ? {
                          cursor: "pointer",
                        }
                      : undefined
                  }
                >
                  {meta.label}
                  {url ? " ↗" : ""}
                </Badge>
              );

              return (
                <Tooltip
                  key={`${tool.name}-${index}`}
                  label={getTooltipLabel(
                    tool,
                    url
                  )}
                >
                  {url ? (
                    <Anchor
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      underline="never"
                    >
                      {badge}
                    </Anchor>
                  ) : (
                    badge
                  )}
                </Tooltip>
              );
            }
          )}
        </Group>
      )}
    </Box>
  );
}