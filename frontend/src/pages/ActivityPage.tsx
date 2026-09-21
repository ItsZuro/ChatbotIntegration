import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';

import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleX,
  RefreshCw,
  Search,
  TicketCheck,
  Users,
} from 'lucide-react';

import {
  useMemo,
  useState,
} from 'react';

import {
  useActivity,
} from '../features/activity/hooks/useActivity';

import type {
  DashboardActivityItem,
} from '../types/api.types';


function getIntegrationPresentation(
  integration: string,
  status: 'SUCCESS' | 'ERROR',
) {
  if (
    status === 'ERROR'
  ) {
    return {
      icon:
        CircleX,

      color:
        'red',
    };
  }


  if (
    integration ===
    'HubSpot'
  ) {
    return {
      icon:
        Users,

      color:
        'orange',
    };
  }


  if (
    integration ===
    'Jira'
  ) {
    return {
      icon:
        TicketCheck,

      color:
        'blue',
    };
  }


  if (
    integration ===
    'Google Calendar'
  ) {
    return {
      icon:
        CalendarDays,

      color:
        'teal',
    };
  }


  return {
    icon:
      Activity,

    color:
      'violet',
  };
}


function formatTimestamp(
  timestamp: string,
) {
  const date =
    new Date(
      timestamp,
    );


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return timestamp;
  }


  return new Intl.DateTimeFormat(
    'es-PE',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  ).format(
    date,
  );
}


function ActivityItem({
  activity,
}: {
  activity: DashboardActivityItem;
}) {
  const {
    icon: Icon,
    color,
  } =
    getIntegrationPresentation(
      activity.integration,
      activity.status,
    );


  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
    >
      <Group
        align="flex-start"
        wrap="nowrap"
      >
        <ThemeIcon
          size={42}
          radius="md"
          variant="light"
          color={color}
        >
          <Icon
            size={20}
          />
        </ThemeIcon>


        <Box
          style={{
            flex:
              1,

            minWidth:
              0,
          }}
        >
          <Group
            justify="space-between"
            align="flex-start"
            gap="md"
          >
            <Box
              style={{
                minWidth:
                  0,
              }}
            >
              <Text
                fw={600}
                size="sm"
              >
                {
                  activity.title
                }
              </Text>


              <Text
                size="sm"
                c="dimmed"
                mt={4}
              >
                {
                  activity.description
                }
              </Text>
            </Box>


            <Group
              gap="xs"
              wrap="nowrap"
            >
              <Badge
                variant="light"
                color={color}
              >
                {
                  activity.integration
                }
              </Badge>


              <Badge
                variant="dot"
                color={
                  activity.status ===
                  'SUCCESS'
                    ? 'teal'
                    : 'red'
                }
              >
                {
                  activity.status ===
                  'SUCCESS'
                    ? 'Completado'
                    : 'Error'
                }
              </Badge>
            </Group>
          </Group>


          <Text
            size="xs"
            c="dimmed"
            mt="md"
          >
            {formatTimestamp(
              activity.timestamp,
            )}
          </Text>
        </Box>
      </Group>
    </Paper>
  );
}


export function ActivityPage() {
  const [
    search,
    setSearch,
  ] =
    useState('');


  const [
    integration,
    setIntegration,
  ] =
    useState<string | null>(
      null,
    );


  const [
    status,
    setStatus,
  ] =
    useState<string | null>(
      null,
    );


  const {
    data:
      activities = [],

    isLoading,

    isError,

    isFetching,

    refetch,
  } =
    useActivity(
      100,
    );


  const filteredActivities =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        return activities.filter(
          (
            activity,
          ) => {
            const matchesSearch =
              !normalizedSearch ||
              activity.title
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              activity.description
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              activity.integration
                .toLowerCase()
                .includes(
                  normalizedSearch,
                );


            const matchesIntegration =
              !integration ||
              activity.integration ===
                integration;


            const matchesStatus =
              !status ||
              activity.status ===
                status;


            return (
              matchesSearch &&
              matchesIntegration &&
              matchesStatus
            );
          },
        );
      },
      [
        activities,
        search,
        integration,
        status,
      ],
    );


  const successfulCount =
    activities.filter(
      (
        activity,
      ) =>
        activity.status ===
        'SUCCESS',
    ).length;


  const failedCount =
    activities.length -
    successfulCount;


  return (
    <Box
      maw={1200}
      mx="auto"
    >
      <Group
        justify="space-between"
        align="flex-start"
        mb="xl"
      >
        <Box>
          <Group
            gap="sm"
          >
            <Title
              order={2}
            >
              Actividad
            </Title>


            <Badge
              color="violet"
              variant="light"
            >
              {
                activities.length
              } registros
            </Badge>
          </Group>


          <Text
            c="dimmed"
            mt={4}
          >
            Historial real de
            acciones ejecutadas
            por UTP Assistant.
          </Text>
        </Box>


        <Tooltip
          label="Actualizar"
        >
          <ActionIcon
            variant="light"
            color="violet"
            size="lg"
            loading={
              isFetching
            }
            onClick={() =>
              void refetch()
            }
          >
            <RefreshCw
              size={18}
            />
          </ActionIcon>
        </Tooltip>
      </Group>


      <Group
        mb="lg"
        align="stretch"
      >
        <Paper
          withBorder
          radius="lg"
          p="md"
          style={{
            flex:
              1,
          }}
        >
          <Group>
            <ThemeIcon
              color="teal"
              variant="light"
              radius="md"
            >
              <CheckCircle2
                size={18}
              />
            </ThemeIcon>

            <Box>
              <Text
                size="xs"
                c="dimmed"
              >
                Completadas
              </Text>

              <Text
                fw={700}
                size="lg"
              >
                {
                  successfulCount
                }
              </Text>
            </Box>
          </Group>
        </Paper>


        <Paper
          withBorder
          radius="lg"
          p="md"
          style={{
            flex:
              1,
          }}
        >
          <Group>
            <ThemeIcon
              color="red"
              variant="light"
              radius="md"
            >
              <CircleX
                size={18}
              />
            </ThemeIcon>

            <Box>
              <Text
                size="xs"
                c="dimmed"
              >
                Con error
              </Text>

              <Text
                fw={700}
                size="lg"
              >
                {
                  failedCount
                }
              </Text>
            </Box>
          </Group>
        </Paper>


        <Paper
          withBorder
          radius="lg"
          p="md"
          style={{
            flex:
              1,
          }}
        >
          <Group>
            <ThemeIcon
              color="violet"
              variant="light"
              radius="md"
            >
              <Activity
                size={18}
              />
            </ThemeIcon>

            <Box>
              <Text
                size="xs"
                c="dimmed"
              >
                Total
              </Text>

              <Text
                fw={700}
                size="lg"
              >
                {
                  activities.length
                }
              </Text>
            </Box>
          </Group>
        </Paper>
      </Group>


      <Paper
        withBorder
        radius="lg"
        p="md"
        mb="lg"
      >
        <Group
          grow
          align="flex-end"
        >
          <TextInput
            label="Buscar"
            placeholder="Jira, contacto, reunión..."
            value={
              search
            }
            onChange={(
              event,
            ) =>
              setSearch(
                event.currentTarget.value,
              )
            }
            leftSection={
              <Search
                size={16}
              />
            }
          />


          <Select
            label="Integración"
            placeholder="Todas"
            clearable
            value={
              integration
            }
            onChange={
              setIntegration
            }
            data={[
              'HubSpot',
              'Jira',
              'Google Calendar',
            ]}
          />


          <Select
            label="Estado"
            placeholder="Todos"
            clearable
            value={
              status
            }
            onChange={
              setStatus
            }
            data={[
              {
                value:
                  'SUCCESS',

                label:
                  'Completado',
              },

              {
                value:
                  'ERROR',

                label:
                  'Error',
              },
            ]}
          />
        </Group>
      </Paper>


      {isError ? (
        <Alert
          color="red"
          variant="light"
          icon={
            <AlertCircle
              size={18}
            />
          }
          title="No se pudo cargar la actividad"
        >
          <Group
            justify="space-between"
          >
            <Text
              size="sm"
            >
              No fue posible
              obtener el historial
              desde el backend.
            </Text>

            <Button
              size="xs"
              color="red"
              variant="light"
              onClick={() =>
                void refetch()
              }
            >
              Reintentar
            </Button>
          </Group>
        </Alert>
      ) : isLoading ? (
        <Center
          py={80}
        >
          <Loader
            color="violet"
          />
        </Center>
      ) : filteredActivities.length ===
        0 ? (
        <Center
          py={80}
        >
          <Stack
            align="center"
            gap="xs"
          >
            <ThemeIcon
              size={48}
              radius="xl"
              variant="light"
              color="gray"
            >
              <Activity
                size={22}
              />
            </ThemeIcon>

            <Text
              fw={600}
            >
              No hay actividad
            </Text>

            <Text
              size="sm"
              c="dimmed"
              ta="center"
            >
              No hay registros que
              coincidan con los
              filtros actuales.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack
          gap="sm"
        >
          {filteredActivities.map(
            (
              activity,
            ) => (
              <ActivityItem
                key={
                  activity.id
                }
                activity={
                  activity
                }
              />
            ),
          )}
        </Stack>
      )}
    </Box>
  );
}