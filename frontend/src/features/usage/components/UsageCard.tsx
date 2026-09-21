import {
  Badge,
  Group,
  Paper,
  Progress,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

import { Bot, Mic, Radio } from "lucide-react";

import type { UsageResource } from "../../../types/api.types";

interface UsageRowProps {
  label: string;
  description: string;
  value: UsageResource;
  icon: React.ElementType;
}

function UsageRow({ label, description, value, icon: Icon }: UsageRowProps) {
  const percentage =
    value.limit > 0
      ? Math.min(100, Math.round((value.used / value.limit) * 100))
      : 0;

  return (
    <Stack gap={7}>
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <ThemeIcon variant="light" color="violet" radius="md">
            <Icon size={17} />
          </ThemeIcon>

          <div>
            <Text size="sm" fw={600}>
              {label}
            </Text>

            <Text size="xs" c="dimmed">
              {description}
            </Text>
          </div>
        </Group>

        <Text size="sm" fw={600}>
          {value.used} / {value.limit}
        </Text>
      </Group>

      <Progress value={percentage} radius="xl" size="sm" />

      <Text size="xs" c="dimmed" ta="right">
        {value.remaining} disponibles
      </Text>
    </Stack>
  );
}

interface UsageCardProps {
  loading?: boolean;

  usage?: {
    assistant: UsageResource;
    audio: UsageResource;
    realtime: UsageResource;
  };
}

export function UsageCard({ loading = false, usage }: UsageCardProps) {
  return (
    <Paper
      withBorder
      radius="xl"
      p="lg"
      h="100%"
      style={{
        background:
          "linear-gradient(145deg, rgba(33, 28, 52, 0.95), rgba(15, 22, 41, 0.94))",
        border:
          "1px solid rgba(99, 102, 241, 0.20)",
        boxShadow:
          "0 18px 48px rgba(0, 0, 0, 0.20)",
      }}
    >
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={4}>Uso diario</Title>

          <Text size="sm" c="dimmed">
            Consumo de servicios con IA
          </Text>
        </div>

        <Badge color="violet" variant="light">
          Hoy
        </Badge>
      </Group>

      {loading || !usage ? (
        <Stack gap="lg">
          <Skeleton height={65} />
          <Skeleton height={65} />
          <Skeleton height={65} />
        </Stack>
      ) : (
        <Stack gap="xl">
          <UsageRow
            label="Asistente IA"
            description="Mensajes procesados"
            value={usage.assistant}
            icon={Bot}
          />

          <UsageRow
            label="Audio"
            description="Transcripciones"
            value={usage.audio}
            icon={Mic}
          />

          <UsageRow
            label="Realtime"
            description="Sesiones de voz"
            value={usage.realtime}
            icon={Radio}
          />
        </Stack>
      )}
    </Paper>
  );
}
