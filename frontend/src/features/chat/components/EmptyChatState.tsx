import {
  Button,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';

import {
  Sparkles,
} from 'lucide-react';

import {
  ChatComposer,
} from './ChatComposer';

import type {
  SelectedDocument,
} from '../../requests/types/request.types';


interface EmptyChatStateProps {
  message: string;
  document: SelectedDocument | null;
  loading: boolean;

  onMessageChange: (
    value: string
  ) => void;

  onDocumentChange: (
    document: SelectedDocument | null
  ) => void;

  onSubmit: () => void;
}


const suggestions = [
  'Analiza este documento',
  'Registra un prospecto',
  'Crea una tarea en Jira',
  'Agenda una reunión',
];


export function EmptyChatState({
  message,
  document,
  loading,
  onMessageChange,
  onDocumentChange,
  onSubmit,
}: EmptyChatStateProps) {
  return (
    <Stack
      maw={780}
      w="100%"
      mx="auto"
      gap="xl"
    >
      <Stack
        align="center"
        gap="sm"
      >
        <ThemeIcon
          size={48}
          radius="xl"
          variant="light"
          color="violet"
        >
          <Sparkles size={23} />
        </ThemeIcon>

        <Title
          order={2}
          ta="center"
        >
          ¿En qué puedo ayudarte?
        </Title>

        <Text
          c="dimmed"
          ta="center"
          maw={500}
          size="sm"
        >
          Gestiona tareas, prospectos, reuniones
          y documentos desde una sola conversación.
        </Text>

        <Group
          justify="center"
          gap="xs"
          mt="xs"
        >
          {suggestions.map(
            (suggestion) => (
              <Button
                key={suggestion}
                variant="default"
                radius="xl"
                size="xs"
                onClick={() =>
                  onMessageChange(
                    suggestion
                  )
                }
              >
                {suggestion}
              </Button>
            )
          )}
        </Group>
      </Stack>

      <ChatComposer
        message={message}
        document={document}
        loading={loading}
        onMessageChange={
          onMessageChange
        }
        onDocumentChange={
          onDocumentChange
        }
        onSubmit={
          onSubmit
        }
      />
    </Stack>
  );
}