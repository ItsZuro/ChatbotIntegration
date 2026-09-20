import {
  ActionIcon,
  Box,
  Drawer,
  Group,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';

import {
  notifications,
} from '@mantine/notifications';

import {
  Bot,
  Info,
  MessageSquarePlus,
} from 'lucide-react';

import {
  useDisclosure,
} from '@mantine/hooks';

import {
  useState,
} from 'react';

import {
  ChatComposer,
} from '../features/chat/components/ChatComposer';

import {
  EmptyChatState,
} from '../features/chat/components/EmptyChatState';

import {
  RequestProgress,
} from '../features/requests/components/RequestProgress';

import {
  RequestResult,
} from '../features/requests/components/RequestResult';

import {
  useSubmitRequest,
} from '../features/requests/hooks/useSubmitRequest';

import type {
  SelectedDocument,
} from '../features/requests/types/request.types';


export function ChatPage() {
  const [
    contextOpened,
    contextHandlers,
  ] = useDisclosure(false);

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    document,
    setDocument,
  ] =
    useState<SelectedDocument | null>(
      null
    );

  const [
    submittedMessage,
    setSubmittedMessage,
  ] =
    useState<string | null>(
      null
    );

  const {
    mutateAsync,
    data,
    error,
    isPending,
    stage,
    reset,
  } = useSubmitRequest();


  const hasConversation =
    Boolean(
      submittedMessage ||
      data ||
      isPending
    );


  const handleSubmit = async () => {
    const cleanMessage =
      message.trim();

    if (!cleanMessage) {
      return;
    }

    setSubmittedMessage(
      cleanMessage
    );

    reset();

    try {
      await mutateAsync({
        message: cleanMessage,
        document,
      });

      setMessage('');
      setDocument(null);

      notifications.show({
        title:
          'Solicitud completada',
        message:
          'UTP Assistant terminó de procesarla.',
        color: 'teal',
      });
    } catch {
      notifications.show({
        title:
          'No se pudo procesar',
        message:
          'Revisa la solicitud e inténtalo nuevamente.',
        color: 'red',
      });
    }
  };


  const handleClear = () => {
    reset();
    setMessage('');
    setDocument(null);
    setSubmittedMessage(null);
  };


  return (
    <>
      <Box
        maw={1050}
        mx="auto"
        h="calc(100vh - 82px)"
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Group
          justify="flex-end"
          h={36}
          px="xs"
        >
          <Tooltip label="Contexto">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={
                contextHandlers.open
              }
            >
              <Info size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Nueva conversación">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={
                handleClear
              }
            >
              <MessageSquarePlus
                size={18}
              />
            </ActionIcon>
          </Tooltip>
        </Group>

        {!hasConversation ? (
          <Box
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
            px="lg"
            pb={80}
          >
            <EmptyChatState
              message={message}
              document={document}
              loading={isPending}
              onMessageChange={
                setMessage
              }
              onDocumentChange={
                setDocument
              }
              onSubmit={
                handleSubmit
              }
            />
          </Box>
        ) : (
          <>
            <ScrollArea
              style={{
                flex: 1,
              }}
            >
              <Stack
                maw={820}
                mx="auto"
                gap="xl"
                py="xl"
                px="md"
              >
                {submittedMessage && (
                  <Group
                    justify="flex-end"
                  >
                    <Box
                      bg="violet.9"
                      px="md"
                      py="sm"
                      maw="75%"
                      style={{
                        borderRadius: 18,
                      }}
                    >
                      <Text
                        size="sm"
                        lh={1.6}
                      >
                        {
                          submittedMessage
                        }
                      </Text>
                    </Box>
                  </Group>
                )}

                {isPending && (
                  <RequestProgress
                    stage={stage}
                  />
                )}

                {data && (
                  <Group
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <ThemeIcon
                      size={30}
                      radius="xl"
                      color="violet"
                      variant="light"
                      mt={4}
                    >
                      <Bot size={16} />
                    </ThemeIcon>

                    <Box
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <RequestResult
                        result={data}
                      />
                    </Box>
                  </Group>
                )}

                {error && (
                  <Text
                    c="red"
                    size="sm"
                  >
                    {error.message}
                  </Text>
                )}
              </Stack>
            </ScrollArea>

            <Box
              pt="sm"
              px="md"
              pb={4}
            >
              <ChatComposer
                message={message}
                document={document}
                loading={isPending}
                onMessageChange={
                  setMessage
                }
                onDocumentChange={
                  setDocument
                }
                onSubmit={
                  handleSubmit
                }
              />

              <Text
                size="xs"
                c="dimmed"
                ta="center"
                mt={6}
              >
                UTP Assistant puede ejecutar acciones en servicios externos.
              </Text>
            </Box>
          </>
        )}
      </Box>

      <Drawer
        opened={contextOpened}
        onClose={
          contextHandlers.close
        }
        position="right"
        title="Contexto de ejecución"
        size={340}
      >
        {data ? (
          <Stack gap="lg">
            <Box>
              <Text
                size="xs"
                c="dimmed"
              >
                Request ID
              </Text>

              <Text
                size="sm"
                fw={500}
                style={{
                  wordBreak:
                    'break-all',
                }}
              >
                {data.request_id}
              </Text>
            </Box>

            <Box>
              <Text
                size="xs"
                c="dimmed"
              >
                Acciones ejecutadas
              </Text>

              <Text
                fw={600}
              >
                {
                  data.executed_tools
                    .length
                }
              </Text>
            </Box>
          </Stack>
        ) : (
          <Text
            size="sm"
            c="dimmed"
          >
            Aquí aparecerá información de la
            ejecución cuando UTP Assistant
            procese una solicitud.
          </Text>
        )}
      </Drawer>
    </>
  );
}