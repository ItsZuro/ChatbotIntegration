import {
  Badge,
  Box,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';

import {
  Activity,
} from 'lucide-react';

import {
  recentActivity,
} from '../data/dashboardData';


export function RecentActivityCard() {
  return (
    <Paper
      withBorder
      radius="lg"
      p="xl"
      h="100%"
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
              {recentActivity.length} acciones
            </Badge>
          </Group>

          <Text
            size="sm"
            c="dimmed"
            mt={3}
          >
            Último flujo integral ejecutado.
          </Text>
        </Box>

        <ThemeIcon
          size={40}
          radius="md"
          variant="light"
          color="teal"
        >
          <Activity size={20} />
        </ThemeIcon>
      </Group>

      <Stack gap={0}>
        {recentActivity.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <Box key={activity.title}>
              <Group
                align="flex-start"
                wrap="nowrap"
                py="md"
              >
                <ThemeIcon
                  color={activity.color}
                  variant="light"
                  radius="md"
                  size={40}
                >
                  <Icon size={19} />
                </ThemeIcon>

                <Box style={{ flex: 1 }}>
                  <Group
                    justify="space-between"
                    align="flex-start"
                    gap="sm"
                    wrap="nowrap"
                  >
                    <Text
                      size="sm"
                      fw={600}
                    >
                      {activity.title}
                    </Text>

                    <Badge
                      size="xs"
                      variant="light"
                      color={activity.color}
                    >
                      {activity.time}
                    </Badge>
                  </Group>

                  <Text
                    size="xs"
                    c="dimmed"
                    mt={5}
                    lh={1.5}
                  >
                    {activity.description}
                  </Text>
                </Box>
              </Group>

              {index < recentActivity.length - 1 && (
                <Divider />
              )}
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}