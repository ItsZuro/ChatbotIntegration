import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";

import {
  Bot,
  FileText,
  History,
  LayoutDashboard,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

import { useDisclosure } from "@mantine/hooks";

import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";

import { useState } from "react";

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
  const [conversationSearch, setConversationSearch] = useState("");

  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const navbarWidth = collapsed ? 76 : 238;

  const handleNavigate = (path: string) => {
    navigate({
      to: path,
    });

    closeMobile();
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
        <AppShell.Section>
          {collapsed ? (
            <Tooltip label="Nuevo chat" position="right">
              <ActionIcon
                w="100%"
                h={40}
                radius="md"
                variant="light"
                color="violet"
                onClick={() => handleNavigate("/")}
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
              onClick={() => handleNavigate("/")}
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

        <AppShell.Section grow component={ScrollArea} mt="lg">
          {!collapsed && (
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb="xs">
              Recientes
            </Text>
          )}

          {!collapsed && (
            <Box px="sm" py="md">
              <Text size="sm" c="dimmed" ta="center">
                Aún no hay conversaciones guardadas.
              </Text>
            </Box>
          )}
        </AppShell.Section>

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
