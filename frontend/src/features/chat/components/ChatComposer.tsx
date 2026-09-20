import {
  ActionIcon,
  Box,
  CloseButton,
  FileButton,
  Group,
  Paper,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";

import { FileText, Mic, Paperclip, Send } from "lucide-react";

import type { KeyboardEvent } from "react";

import type { SelectedDocument } from "../../requests/types/request.types";

interface ChatComposerProps {
  message: string;
  document: SelectedDocument | null;
  loading: boolean;

  onMessageChange: (value: string) => void;

  onDocumentChange: (document: SelectedDocument | null) => void;

  onSubmit: () => void;

  onVoiceClick?: () => void;
}

export function ChatComposer({
  message,
  document,
  loading,
  onMessageChange,
  onDocumentChange,
  onSubmit,
  onVoiceClick,
}: ChatComposerProps) {
  const canSubmit = message.trim().length > 0 && !loading;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (canSubmit) {
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
      {document && (
        <Paper
          withBorder
          radius="md"
          px="sm"
          py={8}
          mb="xs"
          bg="var(--mantine-color-dark-6)"
        >
          <Group justify="space-between" wrap="nowrap">
            <Group
              gap="xs"
              wrap="nowrap"
              style={{
                minWidth: 0,
              }}
            >
              <FileText size={17} color="var(--mantine-color-violet-4)" />

              <Box
                style={{
                  minWidth: 0,
                }}
              >
                <Text size="sm" fw={500} truncate>
                  {document.name}
                </Text>

                <Text size="xs" c="dimmed">
                  {(document.size / 1024).toFixed(1)} KB
                </Text>
              </Box>
            </Group>

            <CloseButton
              size="sm"
              disabled={loading}
              onClick={() => onDocumentChange(null)}
            />
          </Group>
        </Paper>
      )}

      <Textarea
        variant="unstyled"
        placeholder="Escribe un mensaje para UTP Assistant..."
        autosize
        minRows={2}
        maxRows={8}
        value={message}
        disabled={loading}
        onKeyDown={handleKeyDown}
        onChange={(event) => onMessageChange(event.currentTarget.value)}
        styles={{
          root: {
            width: "100%",
          },
          input: {
            width: "100%",
            padding: "10px 12px",
            fontSize: 15,
            lineHeight: 1.5,
          },
        }}
      />

      <Group justify="space-between" mt={6}>
        <Group gap={4}>
          <FileButton
            accept={[
              "application/pdf",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "text/plain",
            ].join(",")}
            onChange={(file) => {
              if (!file) {
                return;
              }

              onDocumentChange({
                file,
                name: file.name,
                size: file.size,
                contentType: file.type,
              });
            }}
          >
            {(props) => (
              <Tooltip label="Adjuntar archivo">
                <ActionIcon
                  {...props}
                  variant="subtle"
                  color="gray"
                  radius="xl"
                  size="lg"
                  disabled={loading}
                >
                  <Paperclip size={19} />
                </ActionIcon>
              </Tooltip>
            )}
          </FileButton>

          <Tooltip label="Hablar">
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="xl"
              size="lg"
              disabled={loading}
              onClick={onVoiceClick}
            >
              <Mic size={19} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Tooltip label="Enviar">
          <ActionIcon
            size={40}
            radius="xl"
            color="violet"
            variant="filled"
            loading={loading}
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            <Send size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  );
}
