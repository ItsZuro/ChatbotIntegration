import {
  Button,
  Divider,
  Group,
  List,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { Link } from "@tanstack/react-router";

import {
  Bot,
  CalendarDays,
  FileText,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { PublicPageShell } from "../features/public/components/PublicPageShell";

export function AboutPage() {
  return (
    <PublicPageShell>
      <Stack gap="xl">
        <Stack gap="sm">
          <Text c="violet.3" fw={700} size="sm">
            UTP ASSISTANT
          </Text>

          <Title order={1}>
            Automatización empresarial mediante inteligencia artificial
          </Title>

          <Text c="dimmed" size="lg" lh={1.7}>
            UTP Assistant es una aplicación web académica y demostrativa
            diseñada para facilitar la gestión de solicitudes empresariales
            mediante un asistente conversacional con inteligencia artificial.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="md">
          <Title order={2} size="h3">
            Funcionalidades
          </Title>

          <List
            spacing="md"
            size="sm"
            icon={<Bot size={18} color="var(--mantine-color-violet-4)" />}
          >
            <List.Item>
              Asistente conversacional para procesar solicitudes y consultas.
            </List.Item>

            <List.Item
              icon={
                <FileText size={18} color="var(--mantine-color-violet-4)" />
              }
            >
              Procesamiento de documentos PDF, DOCX y TXT.
            </List.Item>

            <List.Item
              icon={
                <Workflow size={18} color="var(--mantine-color-violet-4)" />
              }
            >
              Integración con servicios empresariales como Jira y HubSpot.
            </List.Item>

            <List.Item
              icon={
                <CalendarDays size={18} color="var(--mantine-color-violet-4)" />
              }
            >
              Integración opcional con Google Calendar para crear eventos
              solicitados por el usuario.
            </List.Item>

            <List.Item
              icon={
                <ShieldCheck size={18} color="var(--mantine-color-violet-4)" />
              }
            >
              Confirmación del usuario antes de ejecutar acciones externas que
              modifican servicios conectados.
            </List.Item>
          </List>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            Google Calendar
          </Title>

          <Text c="dimmed" lh={1.7}>
            La conexión con Google Calendar es opcional. El usuario debe
            autorizar expresamente la integración mediante Google OAuth.
          </Text>

          <Text c="dimmed" lh={1.7}>
            La implementación actual utiliza Google Calendar para crear eventos
            solicitados por el propio usuario. Antes de realizar la acción, UTP
            Assistant muestra una confirmación dentro de la aplicación.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            Finalidad del proyecto
          </Title>

          <Text c="dimmed" lh={1.7}>
            UTP Assistant ha sido desarrollado con fines académicos y
            demostrativos para aplicar conceptos de inteligencia artificial,
            desarrollo web, arquitectura cloud, seguridad e integración con APIs
            externas.
          </Text>
        </Stack>

        <Group>
          <Button
            component={Link}
            to="/auth/login"
            variant="gradient"
            gradient={{
              from: "violet",
              to: "blue",
            }}
          >
            Acceder a UTP Assistant
          </Button>
        </Group>
      </Stack>
    </PublicPageShell>
  );
}
