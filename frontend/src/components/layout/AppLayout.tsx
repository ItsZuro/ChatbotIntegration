import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";

import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  Bot,
  FileText,
  History,
  LayoutDashboard,
  MessageSquarePlus,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Trash2,
} from "lucide-react";

import { useDisclosure } from "@mantine/hooks";

import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";

import { useState } from "react";

import {
  useConversations,
  useDeleteConversation,
} from "../../features/chat/hooks/useConversations";

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
];

export function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure(false);

  const [collapsed, setCollapsed] = useState(false);

  const { mutateAsync: deleteConversation, isPending: deletingConversation } =
    useDeleteConversation();

  const [conversationSearch, setConversationSearch] = useState("");

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

  return (
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
      <AppShell.Header>
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

            <ThemeIcon
              size={34}
              radius="md"
              variant="gradient"
              gradient={{
                from: "violet",
                to: "indigo",
              }}
            >
              <Bot size={19} />
            </ThemeIcon>

            <Box>
              <Text fw={700} size="sm">
                UTP Assistant
              </Text>

              <Text size="xs" c="dimmed" visibleFrom="sm">
                UTPConsult
              </Text>
            </Box>
          </Group>

          <Avatar size={32} radius="xl" color="violet">
            U
          </Avatar>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="sm"
        style={{
          transition: "width 180ms ease",
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
                            handleOpenConversation(conversation.conversation_id)
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
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb="xs">
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

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
