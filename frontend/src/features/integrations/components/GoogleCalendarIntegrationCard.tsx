import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";

import {
  CalendarDays,
  CheckCircle2,
  Link2,
  Unplug,
} from "lucide-react";

import {
  notifications,
} from "@mantine/notifications";

import {
  useEffect,
} from "react";

import {
  useConnectGoogleCalendar,
  useDisconnectGoogleCalendar,
  useGoogleCalendarStatus,
} from "../hooks/useGoogleCalendarIntegration";


export function GoogleCalendarIntegrationCard() {
  const {
    data: status,
    isLoading,
    refetch,
  } = useGoogleCalendarStatus();

  const {
    mutateAsync: connect,
    isPending: connecting,
  } = useConnectGoogleCalendar();

  const {
    mutateAsync: disconnect,
    isPending: disconnecting,
  } = useDisconnectGoogleCalendar();


  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    const oauthStatus =
      params.get(
        "google_calendar",
      );

    if (!oauthStatus) {
      return;
    }

    if (
      oauthStatus ===
      "connected"
    ) {
      notifications.show({
        title:
          "Google Calendar conectado",
        message:
          "Tu calendario personal ya puede utilizarse desde UTP Assistant.",
        color: "teal",
      });

      void refetch();
    }

    if (
      oauthStatus ===
      "cancelled"
    ) {
      notifications.show({
        title:
          "Conexión cancelada",
        message:
          "Google Calendar no fue conectado.",
        color: "gray",
      });
    }

    if (
      oauthStatus ===
        "invalid_state" ||
      oauthStatus ===
        "missing_code" ||
      oauthStatus ===
        "error"
    ) {
      notifications.show({
        title:
          "No se pudo conectar Google Calendar",
        message:
          "La autorización no pudo completarse. Inténtalo nuevamente.",
        color: "red",
      });
    }

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname,
    );
  }, [refetch]);


  const handleConnect = async () => {
    try {
      const result =
        await connect();

      window.location.assign(
        result.authorization_url,
      );
    } catch {
      notifications.show({
        title:
          "No se pudo iniciar la conexión",
        message:
          "Inténtalo nuevamente.",
        color: "red",
      });
    }
  };


  const handleDisconnect = async () => {
    try {
      await disconnect();

      notifications.show({
        title:
          "Google Calendar desconectado",
        message:
          "UTP Assistant ya no utilizará tu calendario personal.",
        color: "teal",
      });
    } catch {
      notifications.show({
        title:
          "No se pudo desconectar",
        message:
          "Inténtalo nuevamente.",
        color: "red",
      });
    }
  };


  const connected =
    status?.connected === true;


  return (
    <Paper
      withBorder
      radius="xl"
      p="xl"
      h="100%"
      style={{
        background:
          "linear-gradient(145deg, rgba(32, 28, 51, 0.95), rgba(16, 22, 42, 0.94))",

        border:
          "1px solid rgba(124, 58, 237, 0.20)",

        boxShadow:
          "0 18px 48px rgba(0, 0, 0, 0.20)",
      }}
    >
      <Group
        justify="space-between"
        align="flex-start"
      >
        <Group
          gap="md"
          align="flex-start"
        >
          <ThemeIcon
            size={44}
            radius="md"
            variant="light"
            color={
              connected
                ? "teal"
                : "violet"
            }
          >
            <CalendarDays
              size={22}
            />
          </ThemeIcon>

          <Box>
            <Group gap="sm">
              <Text
                fw={700}
                size="lg"
              >
                Google Calendar
              </Text>

              <Badge
                variant="light"
                color={
                  connected
                    ? "teal"
                    : "gray"
                }
                leftSection={
                  connected
                    ? (
                      <CheckCircle2
                        size={11}
                      />
                    )
                    : undefined
                }
              >
                {connected
                  ? "Conectado"
                  : "No conectado"}
              </Badge>
            </Group>

            <Text
              size="sm"
              c="dimmed"
              mt={5}
              maw={650}
            >
              Conecta tu cuenta personal
              de Google para que UTP
              Assistant pueda programar
              reuniones directamente en
              tu calendario.
            </Text>
          </Box>
        </Group>
      </Group>

      <Stack
        gap="md"
        mt="xl"
      >
        {connected &&
          status?.connected_at && (
          <Text
            size="xs"
            c="dimmed"
          >
            Integración autorizada
            correctamente.
          </Text>
        )}

        <Group>
          {connected ? (
            <Button
              variant="light"
              color="red"
              leftSection={
                <Unplug
                  size={17}
                />
              }
              loading={
                disconnecting
              }
              onClick={() =>
                void handleDisconnect()
              }
            >
              Desconectar
            </Button>
          ) : (
            <Button
              color="violet"
              leftSection={
                <Link2
                  size={17}
                />
              }
              loading={
                connecting ||
                isLoading
              }
              onClick={() =>
                void handleConnect()
              }
            >
              Conectar Google Calendar
            </Button>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}