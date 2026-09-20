import {
  Anchor,
  Badge,
  Box,
  Group,
  Tooltip,
} from "@mantine/core";

import {
  CalendarDays,
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
  result: AssistantResponse;
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
        label: tool.name,
        icon: Wrench,
      };
  }
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

              return (
                <Tooltip
                  key={`${tool.name}-${index}`}
                  label={
                    tool.result.success
                      ? "Acción realizada correctamente"
                      : "La acción produjo un error"
                  }
                >
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
                  >
                    {meta.label}
                  </Badge>
                </Tooltip>
              );
            }
          )}
        </Group>
      )}
    </Box>
  );
}