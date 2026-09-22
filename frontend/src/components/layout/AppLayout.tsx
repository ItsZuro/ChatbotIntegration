import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Group,
  Menu,
  Modal,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,

  Tooltip,
} from "@mantine/core";

import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquarePlus,
  MoreVertical,
  Plug,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

import { useDisclosure } from "@mantine/hooks";

import { useQueryClient } from "@tanstack/react-query";

import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";

import { useState } from "react";

import {
  useConversations,
  useDeleteConversation,
  useRenameConversation,
} from "../../features/chat/hooks/useConversations";

import { logoutUser } from "../../services/auth.service";

import { AssistantMark } from "../brand/AssistantMark";

const operationsNavigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Documentos",
    icon: FileText,
    path: "/documents",
  },
  {
    label: "Actividad",
    icon: History,
    path: "/activity",
  },
  {
  label: "Integraciones",
  icon: Plug,
  path: "/integrations",
},
];

export function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure(false);

  const [collapsed, setCollapsed] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  const queryClient = useQueryClient();

  const { mutateAsync: deleteConversation, isPending: deletingConversation } =
    useDeleteConversation();

  const [conversationSearch, setConversationSearch] = useState("");

  const [renameTarget, setRenameTarget] = useState<{
    conversationId: string;
    currentTitle: string;
  } | null>(null);

  const [renameTitle, setRenameTitle] = useState("");

  const {
    mutateAsync: renameConversation,

    isPending: renamingConversation,
  } = useRenameConversation();

  const { data: conversations = [], isLoading: conversationsLoading } =
    useConversations();

  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title
      .toLowerCase()
      .includes(conversationSearch.trim().toLowerCase()),
  );

  const navbarWidth = collapsed ? 76 : 238;

  const handleNavigate = (path: string) => {
    navigate({
      to: path,
    });

    closeMobile();
  };

  const handleNewConversation = async () => {
    await navigate({
      to: "/",
    });

    closeMobile();
  };

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logoutUser();

      queryClient.clear();

      notifications.show({
        title: "Sesión cerrada",
        message: "Has cerrado sesión correctamente.",
        color: "teal",
      });

      await navigate({
        to: "/auth/login",
        replace: true,
      });
    } catch {
      notifications.show({
        title: "No se pudo cerrar sesión",
        message: "Inténtalo nuevamente.",
        color: "red",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleOpenConversation = async (conversationId: string) => {
    await navigate({
      to: "/chat/$conversationId",
      params: {
        conversationId,
      },
    });

    closeMobile();
  };

  const handleDeleteConversation = (conversationId: string, title: string) => {
    modals.openConfirmModal({
      title: "Eliminar conversación",
      centered: true,
      children: (
        <Text size="sm">
          ¿Seguro que deseas eliminar <strong>{title}</strong>? Esta acción no
          se puede deshacer.
        </Text>
      ),
      labels: {
        confirm: "Eliminar",
        cancel: "Cancelar",
      },
      confirmProps: {
        color: "red",
      },
      onConfirm: async () => {
        try {
          await deleteConversation(conversationId);

          if (pathname === `/chat/${conversationId}`) {
            await navigate({
              to: "/",
            });
          }

          notifications.show({
            title: "Conversación eliminada",
            message: "El chat fue eliminado correctamente.",
            color: "teal",
          });
        } catch {
          notifications.show({
            title: "No se pudo eliminar",
            message: "Inténtalo nuevamente.",
            color: "red",
          });
        }
      },
    });
  };

  const handleOpenRename = (conversationId: string, title: string) => {
    setRenameTarget({
      conversationId,
      currentTitle: title,
    });

    setRenameTitle(title);
  };

  const handleCloseRename = () => {
    if (renamingConversation) {
      return;
    }

    setRenameTarget(null);

    setRenameTitle("");
  };

  const handleRenameConversation = async () => {
    const cleanTitle = renameTitle.trim();

    if (!renameTarget || !cleanTitle) {
      return;
    }

    try {
      await renameConversation({
        conversationId: renameTarget.conversationId,

        title: cleanTitle,
      });

      notifications.show({
        title: "Conversación renombrada",

        message: "El nuevo nombre se guardó correctamente.",

        color: "teal",
      });

      setRenameTarget(null);

      setRenameTitle("");
    } catch {
      notifications.show({
        title: "No se pudo renombrar",

        message: "Inténtalo nuevamente.",

        color: "red",
      });
    }
  };

  return (
    <>
      <Modal
        opened={renameTarget !== null}
        onClose={handleCloseRename}
        title="Renombrar conversación"
        centered
      >
        <TextInput
          label="Nombre del chat"
          placeholder="Escribe un nombre"
          value={renameTitle}
          maxLength={80}
          autoFocus
          onChange={(event) => setRenameTitle(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              void handleRenameConversation();
            }
          }}
        />

        <Group justify="flex-end" mt="lg">
          <Button
            variant="default"
            disabled={renamingConversation}
            onClick={handleCloseRename}
          >
            Cancelar
          </Button>

          <Button
            color="violet"
            loading={renamingConversation}
            disabled={!renameTitle.trim()}
            onClick={() => void handleRenameConversation()}
          >
            Guardar
          </Button>
        </Group>
      </Modal>

      <AppShell
        header={{
          height: 58,
        }}
        navbar={{
          width: navbarWidth,
          breakpoint: "md",
          collapsed: {
            mobile: !mobileOpened,
          },
        }}
        padding="md"
        transitionDuration={180}
        transitionTimingFunction="ease"
      >
        <AppShell.Header
          style={{
            background:
              "linear-gradient(90deg, rgba(18, 14, 31, 0.96), rgba(11, 16, 32, 0.96))",
            borderBottom: "1px solid rgba(139, 92, 246, 0.20)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.20)",
          }}
        >
          <Group h="100%" px="md" justify="space-between">
            <Group gap="sm">
              <Tooltip label={collapsed ? "Expandir menú" : "Contraer menú"}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  visibleFrom="md"
                  onClick={() => setCollapsed((value) => !value)}
                >
                  {collapsed ? (
                    <PanelLeftOpen size={19} />
                  ) : (
                    <PanelLeftClose size={19} />
                  )}
                </ActionIcon>
              </Tooltip>

              <Burger
                opened={mobileOpened}
                onClick={toggleMobile}
                hiddenFrom="md"
                size="sm"
              />

              <AssistantMark size={38} />

              <Box>
                <Text fw={700} size="sm">
                  UTP Assistant
                </Text>

                <Text size="xs" c="dimmed" visibleFrom="sm">
                  UTPConsult
                </Text>
              </Box>
            </Group>

            <Menu position="bottom-end" width={190} withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size={40}
                  radius="xl"
                  aria-label="Abrir menú de usuario"
                >
                  <Avatar size={32} radius="xl" color="violet">
                    U
                  </Avatar>
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Cuenta</Menu.Label>

                <Menu.Item
                  color="red"
                  leftSection={<LogOut size={16} />}
                  disabled={loggingOut}
                  onClick={() => void handleLogout()}
                >
                  Cerrar sesión
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar
          p="sm"
          style={{
            transition: "width 180ms ease",
            background:
              "linear-gradient(180deg, rgba(20, 15, 35, 0.98) 0%, rgba(10, 15, 30, 0.98) 100%)",
            borderRight: "1px solid rgba(139, 92, 246, 0.18)",
            boxShadow: "10px 0 35px rgba(0, 0, 0, 0.16)",
          }}
        >
          {/* Nuevo chat + buscador */}
          <AppShell.Section>
            {collapsed ? (
              <Tooltip label="Nuevo chat" position="right">
                <ActionIcon
                  w="100%"
                  h={40}
                  radius="md"
                  variant="light"
                  color="violet"
                  onClick={handleNewConversation}
                >
                  <MessageSquarePlus size={19} />
                </ActionIcon>
              </Tooltip>
            ) : (
              <Button
                fullWidth
                justify="flex-start"
                variant="light"
                color="violet"
                radius="md"
                leftSection={<MessageSquarePlus size={18} />}
                onClick={handleNewConversation}
              >
                Nuevo chat
              </Button>
            )}

            {!collapsed && (
              <TextInput
                mt="sm"
                size="sm"
                radius="md"
                placeholder="Buscar chats..."
                value={conversationSearch}
                onChange={(event) =>
                  setConversationSearch(event.currentTarget.value)
                }
                leftSection={<Search size={15} />}
              />
            )}
          </AppShell.Section>

          {/* Conversaciones recientes */}
          <AppShell.Section grow component={ScrollArea} mt="lg">
            {!collapsed && (
              <>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  px="sm"
                  mb="xs"
                >
                  Recientes
                </Text>

                {conversationsLoading ? (
                  <Box px="sm" py="md">
                    <Text size="sm" c="dimmed" ta="center">
                      Cargando conversaciones...
                    </Text>
                  </Box>
                ) : filteredConversations.length > 0 ? (
                  <Stack gap={3}>
                    {filteredConversations.map((conversation) => {
                      const active =
                        pathname === `/chat/${conversation.conversation_id}`;

                      return (
                        <Box
                          key={conversation.conversation_id}
                          style={{
                            position: "relative",
                          }}
                        >
                          <NavLink
                            active={active}
                            label={conversation.title}
                            leftSection={<MessageSquarePlus size={17} />}
                            color="violet"
                            variant="light"
                            onClick={() =>
                              handleOpenConversation(
                                conversation.conversation_id,
                              )
                            }
                            style={{
                              borderRadius: 9,
                              paddingRight: 38,
                            }}
                          />

                          <Menu position="right-start" withinPortal>
                            <Menu.Target>
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="sm"
                                disabled={deletingConversation}
                                onClick={(event) => {
                                  event.stopPropagation();
                                }}
                                style={{
                                  position: "absolute",
                                  right: 6,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              >
                                <MoreVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<Pencil size={15} />}
                                onClick={() =>
                                  handleOpenRename(
                                    conversation.conversation_id,
                                    conversation.title,
                                  )
                                }
                              >
                                Renombrar
                              </Menu.Item>

                              <Menu.Divider />

                              <Menu.Item
                                color="red"
                                leftSection={<Trash2 size={15} />}
                                onClick={() =>
                                  handleDeleteConversation(
                                    conversation.conversation_id,
                                    conversation.title,
                                  )
                                }
                              >
                                Eliminar
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Box px="sm" py="md">
                    <Text size="sm" c="dimmed" ta="center">
                      {conversationSearch
                        ? "No se encontraron conversaciones."
                        : "Aún no hay conversaciones guardadas."}
                    </Text>
                  </Box>
                )}
              </>
            )}
          </AppShell.Section>

          {/* Herramientas */}
          <AppShell.Section>
            {!collapsed && (
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                px="sm"
                mb="xs"
              >
                Herramientas
              </Text>
            )}

            <Stack gap={4}>
              {operationsNavigation.map((item) => {
                const Icon = item.icon;

                const active = pathname === item.path;

                const nav = (
                  <NavLink
                    key={item.path}
                    active={active}
                    label={collapsed ? undefined : item.label}
                    leftSection={<Icon size={18} />}
                    color="violet"
                    variant="light"
                    onClick={() => handleNavigate(item.path)}
                    style={{
                      borderRadius: 9,
                    }}
                  />
                );

                return collapsed ? (
                  <Tooltip key={item.path} label={item.label} position="right">
                    {nav}
                  </Tooltip>
                ) : (
                  nav
                );
              })}
            </Stack>
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main
          style={{
            minHeight: "100vh",
            background:
              "radial-gradient(circle at 12% 12%, rgba(124, 58, 237, 0.15), transparent 30%), " +
              "radial-gradient(circle at 88% 70%, rgba(37, 99, 235, 0.12), transparent 32%), " +
              "linear-gradient(135deg, #0d0b16 0%, #11101d 46%, #0b1020 100%)",
          }}
        >
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </>
  );
}
