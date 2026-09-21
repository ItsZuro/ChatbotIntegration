import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <Paper
      withBorder
      radius="xl"
      p={{
        base: "lg",
        sm: "xl",
      }}
      mb="xl"
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(125deg, rgba(91, 33, 182, 0.54) 0%, rgba(67, 56, 202, 0.34) 48%, rgba(29, 78, 216, 0.28) 100%)",
        border:
          "1px solid rgba(167, 139, 250, 0.26)",
        boxShadow:
          "0 24px 60px rgba(0, 0, 0, 0.24)",
      }}
    >
      <Box
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          right: -80,
          top: -150,
          background:
            "rgba(139, 92, 246, 0.24)",
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />

      <Box
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          left: "45%",
          bottom: -170,
          background:
            "rgba(59, 130, 246, 0.18)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      <Group
        justify="space-between"
        align="center"
        gap="xl"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack gap={6}>
          <Group gap="sm">
            <Title
              order={2}
              fw={800}
              c="white"
            >
              Centro de operaciones
            </Title>

            <Badge
              color="teal"
              variant="light"
              leftSection={
                <CheckCircle2 size={11} />
              }
            >
              Cloud activo
            </Badge>
          </Group>

          <Text
            c="rgba(255,255,255,0.70)"
            maw={680}
          >
            Gestiona solicitudes, documentos y
            acciones automatizadas de UTPConsult.
          </Text>
        </Stack>

        <Button
          leftSection={<Sparkles size={17} />}
          rightSection={<ArrowRight size={16} />}
          variant="gradient"
          size="md"
          radius="md"
          gradient={{
            from: "violet",
            to: "blue",
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
    </Paper>
  );
}
