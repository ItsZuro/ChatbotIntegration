import {
  ActionIcon,
  Box,
  Drawer,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";

import {
  notifications,
} from "@mantine/notifications";

import {
  useDisclosure,
} from "@mantine/hooks";

import {
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import {
  Bot,
  Info,
  MessageSquarePlus,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChatComposer,
} from "../features/chat/components/ChatComposer";

import {
  EmptyChatState,
} from "../features/chat/components/EmptyChatState";

import {
  RequestProgress,
} from "../features/requests/components/RequestProgress";

import {
  RequestResult,
} from "../features/requests/components/RequestResult";

import type {
  RequestStage,
} from "../features/requests/hooks/useSubmitRequest";

import type {
  SelectedDocument,
} from "../features/requests/types/request.types";

import {
  useConversationMessages,
  useCreateConversation,
  useSendConversationMessage,
} from "../features/chat/hooks/useConversations";

import {
  createUploadUrl,
  uploadDocument,
} from "../services/documents.service";

import {
  deleteConversation,
} from "../services/conversations.service";

import type {
  SendConversationMessageResponse,
} from "../types/api.types";


function buildConversationTitle(
  message: string
) {
  const normalized = message
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= 48) {
    return normalized;
  }

  return `${normalized.slice(0, 45)}...`;
}


export function ChatPage() {
  const [
    contextOpened,
    contextHandlers,
  ] = useDisclosure(false);

  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) =>
      state.location.pathname,
  });

  const conversationId =
    pathname.startsWith("/chat/")
      ? decodeURIComponent(
          pathname.slice("/chat/".length)
        )
      : null;

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    document,
    setDocument,
  ] =
    useState<SelectedDocument | null>(
      null
    );

  const [
    pendingUserMessage,
    setPendingUserMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    stage,
    setStage,
  ] =
    useState<RequestStage>(
      "idle"
    );

  const [
    lastExecution,
    setLastExecution,
  ] =
    useState<SendConversationMessageResponse | null>(
      null
    );

  const viewportRef =
    useRef<HTMLDivElement>(null);


  const {
    data: persistedMessages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useConversationMessages(
    conversationId
  );

  const {
    mutateAsync: createConversation,
    isPending: creatingConversation,
  } = useCreateConversation();

  const {
    mutateAsync: sendConversationMessage,
    isPending: sendingMessage,
  } = useSendConversationMessage();


  const loading =
    creatingConversation ||
    sendingMessage ||
    (
      stage !== "idle" &&
      stage !== "success"
    );


  const hasConversation =
    Boolean(
      conversationId ||
      persistedMessages.length > 0 ||
      pendingUserMessage ||
      loading
    );


  useEffect(() => {
    requestAnimationFrame(() => {
      const viewport =
        viewportRef.current;

      if (!viewport) {
        return;
      }

      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [
    persistedMessages.length,
    pendingUserMessage,
    loading,
  ]);


  const handleSubmit = async () => {
    const cleanMessage =
      message.trim();

    if (
      !cleanMessage ||
      loading
    ) {
      return;
    }

    let targetConversationId =
      conversationId;

    let createdConversationId:
      | string
      | null = null;

    setPendingUserMessage(
      cleanMessage
    );

    setLastExecution(null);

    setStage(
      document
        ? "preparing-upload"
        : "processing"
    );

    try {
      if (!targetConversationId) {
        const conversation =
          await createConversation({
            title:
              buildConversationTitle(
                cleanMessage
              ),
          });

        targetConversationId =
          conversation.conversation_id;

        createdConversationId =
          conversation.conversation_id;
      }

      let objectKey:
        | string
        | undefined;

      if (document) {
        setStage(
          "preparing-upload"
        );

        const uploadData =
          await createUploadUrl({
            fileName:
              document.name,
            contentType:
              document.contentType,
          });

        setStage(
          "uploading"
        );

        await uploadDocument(
          uploadData.upload_url,
          document.file
        );

        objectKey =
          uploadData.object_key;
      }

      setStage(
        "processing"
      );

      const result =
        await sendConversationMessage({
          conversationId:
            targetConversationId,
          message:
            cleanMessage,
          objectKey,
        });

      setLastExecution(
        result
      );

      setMessage("");
      setDocument(null);

      setStage(
        "success"
      );

      setPendingUserMessage(
        null
      );

      if (!conversationId) {
        await navigate({
          to: "/chat/$conversationId",
          params: {
            conversationId:
              targetConversationId,
          },
        });
      }

      setStage(
        "idle"
      );
    } catch {
      setPendingUserMessage(
        null
      );

      setStage(
        "idle"
      );

      /*
       * Si la conversación se creó
       * únicamente para este primer
       * mensaje y el envío falló,
       * la eliminamos para no dejar
       * chats vacíos en el sidebar.
       */
      if (
        createdConversationId &&
        !conversationId
      ) {
        try {
          await deleteConversation(
            createdConversationId
          );
        } catch {
          // El fallo de limpieza no
          // debe ocultar el error real.
        }
      }

      notifications.show({
        title:
          "No se pudo enviar el mensaje",
        message:
          "Inténtalo nuevamente.",
        color: "red",
      });
    }
  };


  const handleNewConversation =
    async () => {
      setMessage("");
      setDocument(null);
      setPendingUserMessage(
        null
      );
      setLastExecution(null);
      setStage("idle");

      await navigate({
        to: "/",
      });
    };


  return (
    <>
      <Box
        maw={1050}
        mx="auto"
        h="calc(100vh - 82px)"
        style={{
          display: "flex",
          flexDirection: "column",
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
                handleNewConversation
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
              display: "flex",
              alignItems: "center",
            }}
            px="lg"
            pb={80}
          >
            <EmptyChatState
              message={message}
              document={document}
              loading={loading}
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
              viewportRef={
                viewportRef
              }
              style={{
                flex: 1,
              }}
            >
              <Stack
                maw={820}
                mx="auto"
                gap="lg"
                py="xl"
                px="md"
              >
                {messagesLoading &&
                  conversationId && (
                    <Group
                      justify="center"
                      py="xl"
                    >
                      <Loader
                        size="sm"
                        color="violet"
                      />

                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        Cargando conversación...
                      </Text>
                    </Group>
                  )}


                {persistedMessages.map(
                  (
                    persistedMessage
                  ) => {
                    if (
                      persistedMessage.role ===
                      "user"
                    ) {
                      return (
                        <Group
                          key={
                            persistedMessage.message_id
                          }
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
                                persistedMessage.content
                              }
                            </Text>
                          </Box>
                        </Group>
                      );
                    }

                    return (
                      <Group
                        key={
                          persistedMessage.message_id
                        }
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
                          <Bot
                            size={16}
                          />
                        </ThemeIcon>

                        <Box
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <RequestResult
                            result={{
                              response:
                                persistedMessage.content,
                              executed_tools:
                                persistedMessage.executed_tools,
                            }}
                          />
                        </Box>
                      </Group>
                    );
                  }
                )}


                {pendingUserMessage && (
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
                          pendingUserMessage
                        }
                      </Text>
                    </Box>
                  </Group>
                )}


                {loading && (
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
                      <Bot
                        size={16}
                      />
                    </ThemeIcon>

                    <RequestProgress
                      stage={stage}
                      hasDocument={
                        Boolean(
                          document
                        )
                      }
                    />
                  </Group>
                )}


                {messagesError && (
                  <Text
                    c="red"
                    size="sm"
                  >
                    No se pudo cargar
                    el historial de esta
                    conversación.
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
                loading={loading}
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
                UTP Assistant puede
                ejecutar acciones en
                servicios externos.
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
        {lastExecution ? (
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
                    "break-all",
                }}
              >
                {
                  lastExecution.request_id
                }
              </Text>
            </Box>

            <Box>
              <Text
                size="xs"
                c="dimmed"
              >
                Acciones ejecutadas
              </Text>

              <Text fw={600}>
                {
                  lastExecution
                    .executed_tools
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
            Los detalles técnicos de
            la última ejecución de esta
            sesión aparecerán aquí.
          </Text>
        )}
      </Drawer>
    </>
  );
}