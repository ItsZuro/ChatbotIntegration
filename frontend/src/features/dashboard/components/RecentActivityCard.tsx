import {
  Badge,
  Box,
  Center,
  Divider,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';

import {
  Activity,
  CalendarDays,
  CircleAlert,
  TicketCheck,
  Users,
} from 'lucide-react';

import type {
  DashboardActivityItem,
} from '../../../types/api.types';


interface RecentActivityCardProps {
  activities?: DashboardActivityItem[];
  loading?: boolean;
}


function getIntegrationPresentation(
  integration: string,
  status: 'SUCCESS' | 'ERROR',
) {
  if (
    status === 'ERROR'
  ) {
    return {
      icon:
        CircleAlert,

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
      timestamp
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }


  return new Intl.DateTimeFormat(
    'es-PE',
    {
      day:
        '2-digit',

      month:
        'short',

      hour:
        '2-digit',

      minute:
        '2-digit',
    }
  ).format(
    date
  );
}


export function RecentActivityCard({
  activities = [],
  loading = false,
}: RecentActivityCardProps) {
  return (
    <Paper
      withBorder
      radius="xl"
      p="xl"
      h="100%"
      style={{
        background:
          "linear-gradient(145deg, rgba(31, 27, 49, 0.95), rgba(14, 21, 39, 0.94))",
        border:
          "1px solid rgba(59, 130, 246, 0.16)",
        boxShadow:
          "0 18px 48px rgba(0, 0, 0, 0.18)",
      }}
    >
      <Group
        justify="space-between"
        align="flex-start"
        mb="lg"
      >
        <Box>
          <Group gap="sm">
            <Text
              fw={700}
              size="lg"
            >
              Actividad reciente
            </Text>

            <Badge
              color="teal"
              variant="light"
            >
              {
                activities.length
              }{' '}
              acciones
            </Badge>
          </Group>

          <Text
            size="sm"
            c="dimmed"
            mt={3}
          >
            Acciones ejecutadas
            por el asistente.
          </Text>
        </Box>


        <ThemeIcon
          size={40}
          radius="md"
          variant="light"
          color="teal"
        >
          <Activity
            size={20}
          />
        </ThemeIcon>
      </Group>


      {loading ? (
        <Center py="xl">
          <Loader
            size="sm"
            color="violet"
          />
        </Center>
      ) : activities.length === 0 ? (
        <Center
          py="xl"
        >
          <Stack
            align="center"
            gap={5}
          >
            <ThemeIcon
              variant="light"
              color="gray"
              radius="xl"
            >
              <Activity
                size={17}
              />
            </ThemeIcon>

            <Text
              size="sm"
              c="dimmed"
              ta="center"
            >
              Todavía no hay
              acciones ejecutadas.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap={0}>
          {activities.map(
            (
              activity,
              index
            ) => {
              const {
                icon: Icon,
                color,
              } =
                getIntegrationPresentation(
                  activity.integration,
                  activity.status,
                );


              return (
                <Box
                  key={
                    activity.id
                  }
                >
                  <Group
                    align="flex-start"
                    wrap="nowrap"
                    py="md"
                  >
                    <ThemeIcon
                      color={
                        color
                      }
                      variant="light"
                      radius="md"
                      size={40}
                    >
                      <Icon
                        size={19}
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
                        gap="sm"
                        wrap="nowrap"
                      >
                        <Box
                          style={{
                            minWidth:
                              0,
                          }}
                        >
                          <Text
                            size="sm"
                            fw={600}
                          >
                            {
                              activity.title
                            }
                          </Text>


                          <Text
                            size="xs"
                            c="dimmed"
                            mt={4}
                            lh={1.5}
                          >
                            {
                              activity.description
                            }
                          </Text>
                        </Box>


                        <Badge
                          size="xs"
                          variant="light"
                          color={
                            color
                          }
                          style={{
                            flexShrink:
                              0,
                          }}
                        >
                          {
                            activity.integration
                          }
                        </Badge>
                      </Group>


                      <Text
                        size="xs"
                        c="dimmed"
                        mt={7}
                      >
                        {formatTimestamp(
                          activity.timestamp
                        )}
                      </Text>
                    </Box>
                  </Group>


                  {index <
                    activities.length -
                      1 && (
                    <Divider />
                  )}
                </Box>
              );
            }
          )}
        </Stack>
      )}
    </Paper>
  );
}