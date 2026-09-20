import {
  Box,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import {
  RequestComposer,
} from '../features/requests/components/RequestComposer';


export function NewRequestPage() {
  return (
    <Box
      maw={1100}
      mx="auto"
    >
      <Stack
        gap={4}
        mb="xl"
      >
        <Title order={2}>
          Nueva solicitud
        </Title>

        <Text c="dimmed">
          Procesa mensajes y documentos con
          UTP Assistant.
        </Text>
      </Stack>

      <RequestComposer />
    </Box>
  );
}