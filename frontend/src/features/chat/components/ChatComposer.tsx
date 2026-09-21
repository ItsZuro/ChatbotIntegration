import {
  ActionIcon,
  Box,
  CloseButton,
  FileButton,
  Group,
  Loader,
  Paper,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";

import {
  FileText,
  Mic,
  Paperclip,
  Send,
  Square,
  X,
} from "lucide-react";

import type {
  KeyboardEvent,
} from "react";

import type {
  SelectedDocument,
} from "../../requests/types/request.types";


interface ChatComposerProps {
  message: string;

  document:
    | SelectedDocument
    | null;

  loading: boolean;

  onMessageChange: (
    value: string
  ) => void;

  onDocumentChange: (
    document:
      | SelectedDocument
      | null
  ) => void;

  onSubmit: () => void;

  onVoiceClick?: () => void;

  onCancelVoice?: () => void;

  isRecording?: boolean;

  isTranscribing?: boolean;

  recordingDuration?: number;

  waveform?: number[];

  liveTranscript?: string;
}


function formatDuration(
  seconds: number
) {
  const minutes =
    Math.floor(
      seconds / 60
    );

  const remaining =
    seconds % 60;

  return `${minutes}:${remaining
    .toString()
    .padStart(
      2,
      "0"
    )}`;
}


export function ChatComposer({
  message,
  document,
  loading,

  onMessageChange,
  onDocumentChange,
  onSubmit,

  onVoiceClick,
  onCancelVoice,

  isRecording = false,
  isTranscribing = false,

  recordingDuration = 0,

  waveform = [],

  liveTranscript = "",
}: ChatComposerProps) {
  const voiceBusy =
    isRecording ||
    isTranscribing;


  const canSubmit =
    message
      .trim()
      .length > 0 &&
    !loading &&
    !voiceBusy;


  const handleKeyDown = (
    event:
      KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();


      if (
        canSubmit
      ) {
        onSubmit();
      }
    }
  };


  return (
    <Paper
      withBorder
      radius="xl"
      p="sm"
      shadow="sm"
      w="100%"
      maw={820}
      mx="auto"
      bg="var(--mantine-color-dark-7)"
    >
      {document &&
        !voiceBusy && (
          <Paper
            withBorder
            radius="md"
            px="sm"
            py={8}
            mb="xs"
            bg="var(--mantine-color-dark-6)"
          >
            <Group
              justify="space-between"
              wrap="nowrap"
            >
              <Group
                gap="xs"
                wrap="nowrap"
                style={{
                  minWidth:
                    0,
                }}
              >
                <FileText
                  size={17}
                  color="var(--mantine-color-violet-4)"
                />


                <Box
                  style={{
                    minWidth:
                      0,
                  }}
                >
                  <Text
                    size="sm"
                    fw={500}
                    truncate
                  >
                    {
                      document.name
                    }
                  </Text>


                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    {(
                      document.size /
                      1024
                    ).toFixed(
                      1
                    )}{" "}
                    KB
                  </Text>
                </Box>
              </Group>


              <CloseButton
                size="sm"
                disabled={
                  loading
                }
                onClick={() =>
                  onDocumentChange(
                    null
                  )
                }
              />
            </Group>
          </Paper>
        )}


      {isRecording ? (
        <Box
          px="sm"
          py="md"
        >
          <Group
            wrap="nowrap"
            gap="md"
          >
            <Group
              gap="xs"
              wrap="nowrap"
              style={{
                flexShrink:
                  0,
              }}
            >
              <Box
                w={8}
                h={8}
                bg="red.6"
                style={{
                  borderRadius:
                    "50%",
                }}
              />


              <Text
                size="sm"
                fw={600}
                ff="monospace"
              >
                {formatDuration(
                  recordingDuration
                )}
              </Text>
            </Group>


            <Box
              style={{
                flex: 1,

                height:
                  42,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                gap:
                  3,

                overflow:
                  "hidden",
              }}
            >
              {waveform.map(
                (
                  level,
                  index
                ) => (
                  <Box
                    key={
                      index
                    }
                    style={{
                      width:
                        3,

                      minWidth:
                        3,

                      height:
                        Math.max(
                          4,
                          Math.round(
                            level *
                              38
                          )
                        ),

                      borderRadius:
                        999,

                      background:
                        "var(--mantine-color-violet-5)",

                      transition:
                        "height 70ms linear",
                    }}
                  />
                )
              )}
            </Box>


            <Tooltip
              label="Cancelar grabación"
            >
              <ActionIcon
                variant="subtle"
                color="red"
                radius="xl"
                onClick={
                  onCancelVoice
                }
              >
                <X
                  size={18}
                />
              </ActionIcon>
            </Tooltip>
          </Group>


          {liveTranscript ? (
            <Text
              size="sm"
              ta="center"
              mt="sm"
              lineClamp={
                2
              }
            >
              {
                liveTranscript
              }
            </Text>
          ) : (
            <Text
              size="sm"
              c="dimmed"
              ta="center"
              mt="sm"
            >
              Escuchando...
            </Text>
          )}


          <Text
            size="xs"
            c="dimmed"
            ta="center"
            mt={4}
          >
            Habla con normalidad.
            Detén la grabación
            para finalizar.
          </Text>
        </Box>
      ) : isTranscribing ? (
        <Group
          justify="center"
          gap="xs"
          px="sm"
          py="lg"
        >
          <Loader
            size={16}
            color="violet"
          />


          <Text
            size="sm"
            c="dimmed"
          >
            Finalizando
            transcripción...
          </Text>
        </Group>
      ) : (
        <Textarea
          variant="unstyled"
          placeholder="Escribe un mensaje para UTP Assistant..."
          autosize
          minRows={2}
          maxRows={8}
          value={
            message
          }
          disabled={
            loading
          }
          onKeyDown={
            handleKeyDown
          }
          onChange={(
            event
          ) =>
            onMessageChange(
              event
                .currentTarget
                .value
            )
          }
          styles={{
            root: {
              width:
                "100%",
            },

            input: {
              width:
                "100%",

              padding:
                "10px 12px",

              fontSize:
                15,

              lineHeight:
                1.5,
            },
          }}
        />
      )}


      <Group
        justify="space-between"
        mt={6}
      >
        <Group
          gap={4}
        >
          <FileButton
            accept={[
              "application/pdf",

              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

              "text/plain",
            ].join(
              ","
            )}
            disabled={
              loading ||
              voiceBusy
            }
            onChange={(
              file
            ) => {
              if (
                !file
              ) {
                return;
              }


              onDocumentChange({
                file,

                name:
                  file.name,

                size:
                  file.size,

                contentType:
                  file.type,
              });
            }}
          >
            {(
              props
            ) => (
              <Tooltip
                label="Adjuntar archivo"
              >
                <ActionIcon
                  {...props}
                  variant="subtle"
                  color="gray"
                  radius="xl"
                  size="lg"
                  disabled={
                    loading ||
                    voiceBusy
                  }
                >
                  <Paperclip
                    size={19}
                  />
                </ActionIcon>
              </Tooltip>
            )}
          </FileButton>


          <Tooltip
            label={
              isRecording
                ? "Detener y transcribir"
                : isTranscribing
                  ? "Finalizando..."
                  : "Hablar"
            }
          >
            <ActionIcon
              variant={
                isRecording
                  ? "light"
                  : "subtle"
              }
              color={
                isRecording
                  ? "red"
                  : "gray"
              }
              radius="xl"
              size="lg"
              disabled={
                loading ||
                isTranscribing
              }
              loading={
                isTranscribing
              }
              onClick={
                onVoiceClick
              }
              aria-label={
                isRecording
                  ? "Detener grabación"
                  : "Iniciar grabación"
              }
            >
              {isRecording ? (
                <Square
                  size={15}
                  fill="currentColor"
                />
              ) : (
                <Mic
                  size={19}
                />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>


        <Tooltip
          label="Enviar"
        >
          <ActionIcon
            size={40}
            radius="xl"
            color="violet"
            variant="filled"
            loading={
              loading
            }
            disabled={
              !canSubmit
            }
            onClick={
              onSubmit
            }
          >
            <Send
              size={18}
            />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  );
}