import { Badge, Button, Group, Stack, Text, Title } from "@mantine/core";

import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <Group justify="space-between" align="flex-start" mb="xl">
      <Stack gap={4}>
        <Group gap="sm">
          <Title order={2}>Centro de operaciones</Title>

          <Badge
            color="teal"
            variant="light"
            leftSection={<CheckCircle2 size={11} />}
          >
            Cloud activo
          </Badge>
        </Group>

        <Text c="dimmed">
          Gestiona solicitudes, documentos y acciones automatizadas de
          UTPConsult.
        </Text>
      </Stack>

      <Button
        leftSection={<Sparkles size={17} />}
        rightSection={<ArrowRight size={16} />}
        variant="gradient"
        gradient={{
          from: "violet",
          to: "indigo",
        }}
        onClick={() =>
          navigate({
            to: "/",
          })
        }
      >
        Nueva solicitud
      </Button>
    </Group>
  );
}
