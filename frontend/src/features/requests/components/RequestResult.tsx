import {
  Anchor,
  Badge,
  Box,
  Code,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";

import {
  CalendarDays,
  CheckCircle2,
  TicketCheck,
  Users,
  Wrench,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { AssistantResponse, ExecutedTool } from "../../../types/api.types";

interface RequestResultProps {
  result: AssistantResponse;
}

function getToolMeta(tool: ExecutedTool) {
  switch (tool.name) {
    case "actualizar_contacto_en_hubspot":
      return {
        label: "HubSpot",
        icon: Users,
        color: "orange",
      };

    case "crear_ticket_en_jira":
      return {
        label: "Jira",
        icon: TicketCheck,
        color: "blue",
      };

    case "agendar_reunion_en_google_calendar":
      return {
        label: "Google Calendar",
        icon: CalendarDays,
        color: "teal",
      };

    default:
      return {
        label: tool.name,
        icon: Wrench,
        color: "gray",
      };
  }
}

export function RequestResult({ result }: RequestResultProps) {
  return (
    <Paper withBorder radius="lg" p="xl">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Box>
          <Group gap="sm">
            <ThemeIcon color="teal" variant="light" radius="xl">
              <CheckCircle2 size={18} />
            </ThemeIcon>

            <Text fw={700} size="lg">
              Resultado
            </Text>
          </Group>

          <Text size="sm" c="dimmed" mt={4}>
            Solicitud procesada correctamente.
          </Text>
        </Box>

        <Badge color="teal" variant="light">
          {result.executed_tools.length} acciones
        </Badge>
      </Group>

      <Box className="assistant-markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <Anchor href={href} target="_blank" rel="noreferrer">
                {children}
              </Anchor>
            ),
          }}
        >
          {result.response}
        </ReactMarkdown>
      </Box>

      {result.executed_tools.length > 0 && (
        <>
          <Divider my="xl" />

          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="md">
            Acciones ejecutadas
          </Text>

          <Stack gap="sm">
            {result.executed_tools.map((tool, index) => {
              const meta = getToolMeta(tool);

              const Icon = meta.icon;

              return (
                <Paper
                  key={`${tool.name}-${index}`}
                  withBorder
                  radius="md"
                  p="md"
                >
                  <Group justify="space-between" align="flex-start">
                    <Group wrap="nowrap" align="flex-start">
                      <ThemeIcon color={meta.color} variant="light" radius="md">
                        <Icon size={17} />
                      </ThemeIcon>

                      <div>
                        <Text fw={600} size="sm">
                          {meta.label}
                        </Text>

                        <Text size="xs" c="dimmed">
                          {tool.result.action ?? "Ejecutado"}
                        </Text>
                      </div>
                    </Group>

                    <Badge
                      color={tool.result.success ? "teal" : "red"}
                      variant="light"
                    >
                      {tool.result.success ? "Éxito" : "Error"}
                    </Badge>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        </>
      )}

      <Divider my="lg" />

      <Group justify="space-between" gap="md">
        <Text size="xs" c="dimmed">
          Request ID
        </Text>

        <Code>{result.request_id}</Code>
      </Group>
    </Paper>
  );
}
