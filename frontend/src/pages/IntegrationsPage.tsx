import {
  Box,
  Grid,
  Group,
  Text,
  ThemeIcon,
} from "@mantine/core";

import {
  Plug,
} from "lucide-react";

import {
  GoogleCalendarIntegrationCard,
} from "../features/integrations/components/GoogleCalendarIntegrationCard";


export function IntegrationsPage() {
  return (
    <Box
      maw={1500}
      mx="auto"
      py="xs"
    >
      <Group
        justify="space-between"
        align="flex-start"
        mb="xl"
      >
        <Box>
          <Group gap="sm">
            <ThemeIcon
              size={42}
              radius="md"
              variant="light"
              color="violet"
            >
              <Plug size={21} />
            </ThemeIcon>

            <Box>
              <Text
                fw={700}
                size="xl"
              >
                Integraciones
              </Text>

              <Text
                size="sm"
                c="dimmed"
                mt={2}
              >
                Conecta servicios externos
                para ampliar las capacidades
                de UTP Assistant.
              </Text>
            </Box>
          </Group>
        </Box>
      </Group>

      <Grid>
        <Grid.Col
          span={{
            base: 12,
            md: 6,
          }}
        >
          <GoogleCalendarIntegrationCard />
        </Grid.Col>
      </Grid>
    </Box>
  );
}