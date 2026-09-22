import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";

import { Link } from "@tanstack/react-router";

import type { ReactNode } from "react";

import { AssistantMark } from "../../../components/brand/AssistantMark";

interface PublicPageShellProps {
  children: ReactNode;
}

export function PublicPageShell({ children }: PublicPageShellProps) {
  return (
    <Box mih="100vh" bg="var(--mantine-color-dark-9)">
      <Box
        component="header"
        py="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-dark-5)",
        }}
      >
        <Container size="md">
          <Group justify="space-between" wrap="wrap">
            <Group gap="sm">
              <AssistantMark size={42} />

              <Box>
                <Text fw={700} size="lg">
                  UTP Assistant
                </Text>

                <Text size="xs" c="dimmed">
                  Asistente empresarial con inteligencia artificial
                </Text>
              </Box>
            </Group>

            <Group gap="xs">
              <Anchor component={Link} to="/about" c="dimmed" size="sm">
                Acerca de
              </Anchor>

              <Anchor component={Link} to="/privacy" c="dimmed" size="sm">
                Privacidad
              </Anchor>

              <Anchor component={Link} to="/terms" c="dimmed" size="sm">
                Términos
              </Anchor>

              <Button
                component={Link}
                to="/auth/login"
                size="xs"
                radius="md"
                variant="light"
                color="violet"
              >
                Iniciar sesión
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      <Container size="md" py={48}>
        <Paper
          withBorder
          radius="lg"
          p={{
            base: "lg",
            sm: "xl",
          }}
          bg="var(--mantine-color-dark-8)"
        >
          {children}
        </Paper>

        <Stack gap={4} align="center" mt="xl">
          <Text size="xs" c="dimmed" ta="center">
            UTP Assistant
          </Text>

          <Text size="xs" c="dimmed" ta="center">
            Proyecto académico y demostrativo de automatización empresarial.
          </Text>

          <Text size="xs" c="dimmed" ta="center">
            Contacto: darckproyect8@gmail.com
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
