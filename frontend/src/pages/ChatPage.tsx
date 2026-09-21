import {
  ActionIcon,
  Box,
  Drawer,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";

import { useDisclosure } from "@mantine/hooks";

import { useNavigate, useRouterState } from "@tanstack/react-router";

import { Bot, Info, MessageSquarePlus } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { ChatComposer } from "../features/chat/components/ChatComposer";

import { EmptyChatState } from "../features/chat/components/EmptyChatState";

import { RequestProgress } from "../features/requests/components/RequestProgress";

import { RequestResult } from "../features/requests/components/RequestResult";

import type { RequestStage } from "../features/requests/hooks/useSubmitRequest";

import type { SelectedDocument } from "../features/requests/types/request.types";

import {
  useCancelConversationAction,
  useConfirmConversationAction,
  useConversationMessages,
  useCreateConversation,
  usePendingConversationAction,
  useSendConversationMessage,
} from "../features/chat/hooks/useConversations";

import { useVoiceRecorder } from "../features/chat/hooks/useVoiceRecorder";

import { usePreferencesStore } from "../stores/preferences.store";

import { createUploadUrl, uploadDocument } from "../services/documents.service";

import { deleteConversation } from "../services/conversations.service";

import type { SendConversationMessageResponse } from "../types/api.types";

import { isRateLimitError } from "../services/api";
import { PendingActionCard } from "../features/chat/components/PendingActionCard";

function buildConversationTitle(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();

  if (normalized.length <= 48) {
    return normalized;
  }

  return `${normalized.slice(0, 45)}...`;
}

export function ChatPage() {
  const [contextOpened, contextHandlers] = useDisclosure(false);

  const { autoSendVoice, setAutoSendVoice } = usePreferencesStore();

  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const conversationId = pathname.startsWith("/chat/")
    ? decodeURIComponent(pathname.slice("/chat/".length))
    : null;

  const [message, setMessage] = useState("");

  const [document, setDocument] = useState<SelectedDocument | null>(null);

  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(
    null,
  );

  const [stage, setStage] = useState<RequestStage>("idle");

  const [lastExecution, setLastExecution] =
    useState<SendConversationMessageResponse | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);

  const {
    data: persistedMessages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useConversationMessages(conversationId);

  const {
  data: pendingAction = null,
} = usePendingConversationAction(
  conversationId
);

  const { mutateAsync: createConversation, isPending: creatingConversation } =
    useCreateConversation();

  const { mutateAsync: sendConversationMessage, isPending: sendingMessage } =
    useSendConversationMessage();

    const {
  mutateAsync: confirmConversationAction,
  isPending: confirmingAction,
} = useConfirmConversationAction();

const {
  mutateAsync: cancelConversationAction,
  isPending: cancellingAction,
} = useCancelConversationAction();

  const loading =
    creatingConversation ||
    sendingMessage ||
    (stage !== "idle" && stage !== "success");

    const interactionLocked =
  loading ||
  confirmingAction ||
  cancellingAction ||
  Boolean(pendingAction);

const hasConversation = Boolean(
  conversationId ||
  persistedMessages.length > 0 ||
  pendingUserMessage ||
  pendingAction ||
  loading,
);

  const handleSubmit = async (messageOverride?: string) => {
    const cleanMessage = (messageOverride ?? message).trim();

    if (
  !cleanMessage ||
  interactionLocked
) {
  return;
}

    let targetConversationId = conversationId;

    let createdConversationId: string | null = null;

    setPendingUserMessage(cleanMessage);

    setLastExecution(null);

    setStage(document ? "preparing-upload" : "processing");

    try {
      if (!targetConversationId) {
        const conversation = await createConversation({
          title: buildConversationTitle(cleanMessage),
        });

        targetConversationId = conversation.conversation_id;

        createdConversationId = conversation.conversation_id;
      }

      let objectKey: string | undefined;

      if (document) {
        setStage("preparing-upload");

        const uploadData = await createUploadUrl({
          fileName: document.name,
          contentType: document.contentType,
        });

        setStage("uploading");

        await uploadDocument(uploadData.upload_url, document.file);

        objectKey = uploadData.object_key;
      }

      setStage("processing");

      const result = await sendConversationMessage({
        conversationId: targetConversationId,
        message: cleanMessage,
        objectKey,
      });

      setLastExecution(result);

      setMessage("");

      setDocument(null);

      setStage("success");

      setPendingUserMessage(null);

      if (!conversationId) {
        await navigate({
          to: "/chat/$conversationId",
          params: {
            conversationId: targetConversationId,
          },
        });
      }

      setStage("idle");
    } catch (error) {
      setPendingUserMessage(null);

      setStage("idle");

      if (createdConversationId && !conversationId) {
        try {
          await deleteConversation(createdConversationId);
        } catch {
          // El fallo de limpieza
          // no oculta el error real.
        }
      }

      if (!isRateLimitError(error)) {
        notifications.show({
          title: "No se pudo enviar el mensaje",
          message: "Inténtalo nuevamente.",
          color: "red",
        });
      }
    }
  };

  const handleConfirmAction = async () => {
  if (
    !conversationId ||
    !pendingAction ||
    confirmingAction ||
    cancellingAction
  ) {
    return;
  }

  try {
    const result =
      await confirmConversationAction({
        conversationId,
        actionId:
          pendingAction.action_id,
      });

    setLastExecution(
      result
    );

    notifications.show({
      title: (
        result.type ===
        "confirmation_required"
          ? "Acción ejecutada"
          : "Operación completada"
      ),
      message: (
        result.type ===
        "confirmation_required"
          ? (
              "La acción fue ejecutada. "
              + "Hay otra acción que "
              + "requiere tu autorización."
            )
          : (
              "La acción autorizada "
              + "se ejecutó correctamente."
            )
      ),
      color: "teal",
    });
  } catch {
    notifications.show({
      title: (
        "No se pudo ejecutar "
        + "la acción"
      ),
      message: (
        "La operación no fue "
        + "completada."
      ),
      color: "red",
    });
  }
};


const handleCancelAction = async () => {
  if (
    !conversationId ||
    !pendingAction ||
    confirmingAction ||
    cancellingAction
  ) {
    return;
  }

  try {
    await cancelConversationAction({
      conversationId,
      actionId:
        pendingAction.action_id,
    });

    setLastExecution(
      null
    );

    notifications.show({
      title: "Acción cancelada",
      message: (
        "No se realizó ningún "
        + "cambio externo."
      ),
      color: "gray",
    });
  } catch {
    notifications.show({
      title: (
        "No se pudo cancelar "
        + "la acción"
      ),
      message: (
        "Inténtalo nuevamente."
      ),
      color: "red",
    });
  }
};

  const {
    error: voiceError,

    isRecording,
    isTranscribing,

    elapsedSeconds,
    waveform,
    liveTranscript,

    cancelRecording,
    toggleRecording,
  } = useVoiceRecorder({
    onTranscription: (transcription) => {
      const current = message.trim();

      const finalText = current ? `${current} ${transcription}` : transcription;

      setMessage(finalText);

      if (autoSendVoice) {
        void handleSubmit(finalText);
      }
    },
  });

  useEffect(() => {
    if (!voiceError) {
      return;
    }

    notifications.show({
      title: "Problema con el audio",
      message: voiceError,
      color: "red",
    });
  }, [voiceError]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [persistedMessages.length, pendingUserMessage, loading]);

  const handleNewConversation = async () => {
    if (isRecording) {
      cancelRecording();
    }

    setMessage("");

    setDocument(null);

    setPendingUserMessage(null);

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
        <Group justify="flex-end" h={36} px="xs">
          <Tooltip label="Opciones del chat">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={contextHandlers.open}
            >
              <Info size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Nueva conversación">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={handleNewConversation}
            >
              <MessageSquarePlus size={18} />
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
              loading={interactionLocked}
              onMessageChange={setMessage}
              onDocumentChange={setDocument}
              onSubmit={handleSubmit}
              onVoiceClick={toggleRecording}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onCancelVoice={cancelRecording}
              recordingDuration={elapsedSeconds}
              waveform={waveform}
              liveTranscript={liveTranscript}
            />
          </Box>
        ) : (
          <>
            <ScrollArea
              viewportRef={viewportRef}
              style={{
                flex: 1,
              }}
            >
              <Stack maw={820} mx="auto" gap="lg" py="xl" px="md">
                {messagesLoading && conversationId && (
                  <Group justify="center" py="xl">
                    <Loader size="sm" color="violet" />

                    <Text size="sm" c="dimmed">
                      Cargando conversación...
                    </Text>
                  </Group>
                )}

                {persistedMessages.map((persistedMessage) => {
                  if (persistedMessage.role === "user") {
                    return (
                      <Group
                        key={persistedMessage.message_id}
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
                          <Text size="sm" lh={1.6}>
                            {persistedMessage.content}
                          </Text>
                        </Box>
                      </Group>
                    );
                  }

                  return (
                    <Group
                      key={persistedMessage.message_id}
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
                          result={{
                            response: persistedMessage.content,
                            executed_tools: persistedMessage.executed_tools,
                          }}
                        />
                      </Box>
                    </Group>
                  );
                })}

                {pendingUserMessage && (
                  <Group justify="flex-end">
                    <Box
                      bg="violet.9"
                      px="md"
                      py="sm"
                      maw="75%"
                      style={{
                        borderRadius: 18,
                      }}
                    >
                      <Text size="sm" lh={1.6}>
                        {pendingUserMessage}
                      </Text>
                    </Box>
                  </Group>
                )}

                {pendingAction && (
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
      <PendingActionCard
        action={pendingAction}
        confirming={
          confirmingAction
        }
        cancelling={
          cancellingAction
        }
        onConfirm={
          handleConfirmAction
        }
        onCancel={
          handleCancelAction
        }
      />
    </Box>
  </Group>
)}

                {loading && (
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon
                      size={30}
                      radius="xl"
                      color="violet"
                      variant="light"
                      mt={4}
                    >
                      <Bot size={16} />
                    </ThemeIcon>

                    <RequestProgress
                      stage={stage}
                      hasDocument={Boolean(document)}
                    />
                  </Group>
                )}

                {messagesError && (
                  <Text c="red" size="sm">
                    No se pudo cargar el historial de esta conversación.
                  </Text>
                )}
              </Stack>
            </ScrollArea>

            <Box pt="sm" px="md" pb={4}>
              <ChatComposer
                message={message}
                document={document}
                loading={interactionLocked}
                onMessageChange={setMessage}
                onDocumentChange={setDocument}
                onSubmit={handleSubmit}
                onVoiceClick={toggleRecording}
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                onCancelVoice={cancelRecording}
                recordingDuration={elapsedSeconds}
                waveform={waveform}
                liveTranscript={liveTranscript}
              />

              <Text size="xs" c="dimmed" ta="center" mt={6}>
                UTP Assistant puede ejecutar acciones en servicios externos.
              </Text>
            </Box>
          </>
        )}
      </Box>

      <Drawer
        opened={contextOpened}
        onClose={contextHandlers.close}
        position="right"
        title="Opciones del chat"
        size={340}
      >
        <Stack gap="xl">
          <Box>
            <Text fw={600} size="sm" mb={6}>
              Voz
            </Text>

            <Switch
              checked={autoSendVoice}
              disabled={isRecording || isTranscribing}
              onChange={(event) =>
                setAutoSendVoice(event.currentTarget.checked)
              }
              label="Enviar automáticamente"
              description={
                autoSendVoice
                  ? "La transcripción se enviará automáticamente."
                  : "Podrás revisar la transcripción antes de enviarla."
              }
              color="violet"
            />
          </Box>

          <Box>
            <Text fw={600} size="sm" mb={6}>
              Última ejecución
            </Text>

            {lastExecution ? (
              <Stack gap="md">
                <Box>
                  <Text size="xs" c="dimmed">
                    Request ID
                  </Text>

                  <Text
                    size="sm"
                    fw={500}
                    style={{
                      wordBreak: "break-all",
                    }}
                  >
                    {lastExecution.request_id}
                  </Text>
                </Box>

                <Box>
                  <Text size="xs" c="dimmed">
                    Acciones ejecutadas
                  </Text>

                  <Text fw={600}>{lastExecution.executed_tools.length}</Text>
                </Box>
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">
                Todavía no hay una ejecución disponible en esta sesión.
              </Text>
            )}
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}
