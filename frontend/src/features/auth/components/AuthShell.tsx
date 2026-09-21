import {
  Badge,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

import {
  Bot,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import type {
  ReactNode,
} from "react";


interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}


export function AuthShell({
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <Box
      mih="100vh"
      px="md"
      py={40}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        background:
          "radial-gradient(circle at 15% 20%, rgba(124, 58, 237, 0.22), transparent 32%), " +
          "radial-gradient(circle at 85% 75%, rgba(59, 130, 246, 0.18), transparent 35%), " +
          "linear-gradient(135deg, #0d0b16 0%, #11101d 48%, #0b1020 100%)",
      }}
    >
      {/* brillo superior */}
      <Box
        style={{
          position: "absolute",
          top: -180,
          left: "50%",
          transform: "translateX(-50%)",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "rgba(124, 58, 237, 0.12)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <Paper
        radius={28}
        withBorder
        w="100%"
        maw={980}
        p={0}
        style={{
          display: "flex",
          overflow: "hidden",

          background:
            "rgba(24, 24, 32, 0.88)",

          border:
            "1px solid rgba(255, 255, 255, 0.10)",

          boxShadow:
            "0 30px 90px rgba(0, 0, 0, 0.45)",
        }}
      >
        {/* PANEL IZQUIERDO */}
        <Box
          visibleFrom="md"
          w="44%"
          p={42}
          style={{
            position: "relative",

            background:
              "linear-gradient(145deg, rgba(92, 45, 190, 0.95) 0%, rgba(67, 56, 202, 0.92) 48%, rgba(29, 78, 216, 0.88) 100%)",

            overflow: "hidden",
          }}
        >
          <Box
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: "50%",
              right: -100,
              top: -90,

              background:
                "rgba(255, 255, 255, 0.10)",

              filter: "blur(4px)",
            }}
          />

          <Box
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              left: -80,
              bottom: -70,

              background:
                "rgba(56, 189, 248, 0.16)",
            }}
          />

          <Stack
            h="100%"
            justify="space-between"
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box>
              <Group gap="sm">
                <ThemeIcon
                  size={48}
                  radius="xl"
                  variant="white"
                  color="violet"
                >
                  <Bot size={25} />
                </ThemeIcon>

                <Box>
                  <Text
                    fw={800}
                    size="lg"
                    c="white"
                  >
                    UTP Assistant
                  </Text>

                  <Text
                    size="xs"
                    c="rgba(255,255,255,0.70)"
                  >
                    UTPConsult
                  </Text>
                </Box>
              </Group>

              <Badge
                mt={36}
                variant="light"
                color="cyan"
                leftSection={
                  <Sparkles size={12} />
                }
              >
                IA empresarial
              </Badge>

              <Title
                order={2}
                mt="md"
                c="white"
                lh={1.2}
              >
                Convierte solicitudes en acciones reales.
              </Title>

              <Text
                mt="md"
                c="rgba(255,255,255,0.72)"
                lh={1.7}
                size="sm"
              >
                Gestiona conversaciones,
                documentos y tareas conectadas
                con tus herramientas de trabajo.
              </Text>
            </Box>

            <Stack gap="md">
              <Group
                gap="sm"
                wrap="nowrap"
              >
                <ThemeIcon
                  variant="light"
                  color="cyan"
                  radius="xl"
                >
                  <Zap size={16} />
                </ThemeIcon>

                <Text
                  size="sm"
                  c="white"
                >
                  Automatización con IA
                </Text>
              </Group>

              <Group
                gap="sm"
                wrap="nowrap"
              >
                <ThemeIcon
                  variant="light"
                  color="teal"
                  radius="xl"
                >
                  <CheckCircle2 size={16} />
                </ThemeIcon>

                <Text
                  size="sm"
                  c="white"
                >
                  Jira, HubSpot y Calendar
                </Text>
              </Group>

              <Group
                gap="sm"
                wrap="nowrap"
              >
                <ThemeIcon
                  variant="light"
                  color="indigo"
                  radius="xl"
                >
                  <ShieldCheck size={16} />
                </ThemeIcon>

                <Text
                  size="sm"
                  c="white"
                >
                  Acceso seguro con AWS Cognito
                </Text>
              </Group>
            </Stack>
          </Stack>
        </Box>

        {/* FORMULARIO */}
        <Box
          style={{
            flex: 1,
          }}
          p={{
            base: 28,
            sm: 42,
          }}
        >
          <Stack
            gap="xl"
            maw={430}
            mx="auto"
          >
            {/* logo móvil */}
            <Group
              hiddenFrom="md"
              justify="center"
            >
              <ThemeIcon
                size={52}
                radius="xl"
                variant="gradient"
                gradient={{
                  from: "violet",
                  to: "blue",
                }}
              >
                <Bot size={26} />
              </ThemeIcon>
            </Group>

            <Box>
              <Text
                size="xs"
                fw={700}
                tt="uppercase"
                c="violet.3"
                mb={6}
                style={{
                  letterSpacing: 1.2,
                }}
              >
                UTP Assistant
              </Text>

              <Title
                order={2}
                size={32}
                fw={800}
              >
                {title}
              </Title>

              <Text
                size="sm"
                c="dimmed"
                mt={8}
                lh={1.6}
              >
                {description}
              </Text>
            </Box>

            {children}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}