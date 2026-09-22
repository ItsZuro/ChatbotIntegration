import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";

import { useForm } from "@mantine/form";

import {
  AlertCircle,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import { useMemo, useState } from "react";

import {
  useAdminUserQuota,
  useAdminUsers,
  useResetAdminQuota,
  useUpdateAdminQuota,
} from "../features/admin/hooks/useAdmin";

import type {
  AdminQuotaLimits,
  AdminQuotaResponse,
  AdminUser,
} from "../types/api.types";

interface QuotaEditorFormProps {
  user: AdminUser;
  quota: AdminQuotaResponse;
  onClose: () => void;
}

function QuotaEditorForm({ user, quota, onClose }: QuotaEditorFormProps) {
  const updateQuota = useUpdateAdminQuota(user.sub);

  const resetQuota = useResetAdminQuota(user.sub);

  const form = useForm<AdminQuotaLimits>({
    initialValues: {
      assistant: quota.limits.assistant,

      audio: quota.limits.audio,

      realtime: quota.limits.realtime,
    },

    validate: {
      assistant: (value) => (value >= 1 ? null : "Debe ser mayor a 0"),

      audio: (value) => (value >= 1 ? null : "Debe ser mayor a 0"),

      realtime: (value) => (value >= 1 ? null : "Debe ser mayor a 0"),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await updateQuota.mutateAsync(values);

      notifications.show({
        title: "Límites actualizados",
        message: "La cuota personalizada fue guardada correctamente.",
        color: "teal",
      });

      onClose();
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "No se pudieron guardar los límites",
        message: "Inténtalo nuevamente.",
        color: "red",
      });
    }
  });

  const handleReset = async () => {
    try {
      await resetQuota.mutateAsync();

      notifications.show({
        title: "Límites restaurados",
        message: "El usuario volverá a utilizar los límites predeterminados.",
        color: "teal",
      });

      onClose();
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "No se pudieron restaurar los límites",
        message: "Inténtalo nuevamente.",
        color: "red",
      });
    }
  };

  const busy = updateQuota.isPending || resetQuota.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        <Paper withBorder radius="md" p="md">
          <Text size="xs" c="dimmed" mb={4}>
            Usuario
          </Text>

          <Text fw={600}>{user.email ?? "Sin correo disponible"}</Text>

          <Text size="xs" c="dimmed" mt={4}>
            {user.sub}
          </Text>
        </Paper>

        <Group>
          <Badge color={quota.customized ? "violet" : "gray"} variant="light">
            {quota.customized ? "Cuota personalizada" : "Cuota predeterminada"}
          </Badge>
        </Group>

        <NumberInput
          label="Asistente IA"
          description={`Predeterminado: ${quota.defaults.assistant} solicitudes por día`}
          min={1}
          max={1000}
          allowDecimal={false}
          required
          {...form.getInputProps("assistant")}
        />

        <NumberInput
          label="Audio"
          description={`Predeterminado: ${quota.defaults.audio} transcripciones por día`}
          min={1}
          max={1000}
          allowDecimal={false}
          required
          {...form.getInputProps("audio")}
        />

        <NumberInput
          label="Realtime"
          description={`Predeterminado: ${quota.defaults.realtime} sesiones por día`}
          min={1}
          max={1000}
          allowDecimal={false}
          required
          {...form.getInputProps("realtime")}
        />

        <Group justify="space-between" mt="sm">
          <Button
            variant="light"
            color="gray"
            leftSection={<RotateCcw size={16} />}
            disabled={!quota.customized || busy}
            loading={resetQuota.isPending}
            onClick={() => void handleReset()}
          >
            Restaurar valores
          </Button>

          <Group gap="sm">
            <Button variant="default" disabled={busy} onClick={onClose}>
              Cancelar
            </Button>

            <Button
              type="submit"
              color="violet"
              leftSection={<Save size={16} />}
              loading={updateQuota.isPending}
            >
              Guardar límites
            </Button>
          </Group>
        </Group>
      </Stack>
    </form>
  );
}

interface QuotaEditorModalProps {
  user: AdminUser | null;
  opened: boolean;
  onClose: () => void;
}

function QuotaEditorModal({ user, opened, onClose }: QuotaEditorModalProps) {
  const userId = opened && user ? user.sub : null;

  const { data, isLoading, isError, refetch } = useAdminUserQuota(userId);

  const formKey = data
    ? [
        data.user_id,
        data.customized,
        data.limits.assistant,
        data.limits.audio,
        data.limits.realtime,
      ].join("-")
    : "loading";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Administrar límites"
      centered
      size="lg"
    >
      {isLoading ? (
        <Center py={50}>
          <Loader color="violet" />
        </Center>
      ) : isError ? (
        <Alert
          color="red"
          icon={<AlertCircle size={18} />}
          title="No se pudo cargar la cuota"
        >
          <Stack gap="sm">
            <Text size="sm">
              No fue posible obtener los límites del usuario.
            </Text>

            <Button
              size="xs"
              color="red"
              variant="light"
              onClick={() => void refetch()}
            >
              Reintentar
            </Button>
          </Stack>
        </Alert>
      ) : (
        user &&
        data && (
          <QuotaEditorForm
            key={formKey}
            user={user}
            quota={data}
            onClose={onClose}
          />
        )
      )}
    </Modal>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(date);
}

export function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const {
    data: users = [],

    isLoading,

    isError,

    isFetching,

    refetch,
  } = useAdminUsers();

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter(
      (user) =>
        (user.email ?? "").toLowerCase().includes(term) ||
        user.sub.toLowerCase().includes(term),
    );
  }, [users, search]);

  return (
    <Box maw={1300} mx="auto">
      <QuotaEditorModal
        user={selectedUser}
        opened={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
      />

      <Group justify="space-between" align="flex-start" mb="xl">
        <Box>
          <Group gap="sm">
            <ThemeIcon size={42} radius="md" variant="light" color="violet">
              <ShieldCheck size={21} />
            </ThemeIcon>

            <Box>
              <Title order={2}>Administración</Title>

              <Text c="dimmed" mt={2}>
                Gestiona usuarios y límites de uso.
              </Text>
            </Box>
          </Group>
        </Box>

        <Badge color="violet" variant="light" size="lg">
          {users.length} usuarios
        </Badge>
      </Group>

      <Paper withBorder radius="lg" p="md" mb="lg">
        <TextInput
          placeholder="Buscar por correo o identificador..."
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          leftSection={<Search size={16} />}
        />
      </Paper>

      {isError ? (
        <Alert
          color="red"
          variant="light"
          icon={<AlertCircle size={18} />}
          title="No se pudieron cargar los usuarios"
        >
          <Group justify="space-between">
            <Text size="sm">
              Verifica que tu cuenta tenga permisos de administrador.
            </Text>

            <Button
              size="xs"
              color="red"
              variant="light"
              loading={isFetching}
              onClick={() => void refetch()}
            >
              Reintentar
            </Button>
          </Group>
        </Alert>
      ) : isLoading ? (
        <Center py={80}>
          <Loader color="violet" />
        </Center>
      ) : (
        <Paper
          withBorder
          radius="lg"
          style={{
            overflow: "hidden",
          }}
        >
          <Table.ScrollContainer minWidth={850}>
            <Table striped highlightOnHover verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Usuario</Table.Th>

                  <Table.Th>Estado</Table.Th>

                  <Table.Th>Registro</Table.Th>

                  <Table.Th ta="right">Límites</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {filteredUsers.map((user) => (
                  <Table.Tr key={user.sub}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <ThemeIcon radius="xl" color="violet" variant="light">
                          <Users size={17} />
                        </ThemeIcon>

                        <Box>
                          <Text fw={600} size="sm">
                            {user.email ?? "Sin correo"}
                          </Text>

                          <Text size="xs" c="dimmed">
                            {user.sub}
                          </Text>
                        </Box>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Group gap="xs">
                        <Badge
                          color={
                            user.status === "CONFIRMED" ? "teal" : "yellow"
                          }
                          variant="light"
                        >
                          {user.status}
                        </Badge>

                        {!user.enabled && (
                          <Badge color="red" variant="light">
                            Deshabilitado
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatDate(user.created_at)}
                      </Text>
                    </Table.Td>

                    <Table.Td ta="right">
                      <Button
                        size="xs"
                        variant="light"
                        color="violet"
                        leftSection={<SlidersHorizontal size={15} />}
                        onClick={() => setSelectedUser(user)}
                      >
                        Administrar
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {filteredUsers.length === 0 && (
            <Center py={60}>
              <Stack align="center" gap="xs">
                <ThemeIcon size={48} radius="xl" color="gray" variant="light">
                  <Users size={22} />
                </ThemeIcon>

                <Text fw={600}>No se encontraron usuarios</Text>

                <Text size="sm" c="dimmed">
                  Prueba con otro correo o identificador.
                </Text>
              </Stack>
            </Center>
          )}
        </Paper>
      )}
    </Box>
  );
}
