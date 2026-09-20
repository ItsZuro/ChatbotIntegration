import { Box, Group, Stack, Text, ThemeIcon } from "@mantine/core";

import { Dropzone } from "@mantine/dropzone";

import { FileText, UploadCloud, X } from "lucide-react";

import type { SelectedDocument } from "../types/request.types";

interface DocumentDropzoneProps {
  document: SelectedDocument | null;
  onChange: (document: SelectedDocument | null) => void;
}

const acceptedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export function DocumentDropzone({
  document,
  onChange,
}: DocumentDropzoneProps) {
  return (
    <Dropzone
      onDrop={(files) => {
        const file = files[0];

        if (!file) {
          return;
        }

        onChange({
          file,
          name: file.name,
          size: file.size,
          contentType: file.type,
        });
      }}
      onReject={() => {
        onChange(null);
      }}
      maxFiles={1}
      maxSize={10 * 1024 * 1024}
      accept={acceptedTypes}
      radius="lg"
      p="xl"
    >
      <Group
        justify="center"
        gap="xl"
        mih={150}
        style={{
          pointerEvents: "none",
        }}
      >
        <Dropzone.Accept>
          <ThemeIcon size={54} radius="xl" color="teal" variant="light">
            <UploadCloud size={26} />
          </ThemeIcon>
        </Dropzone.Accept>

        <Dropzone.Reject>
          <ThemeIcon size={54} radius="xl" color="red" variant="light">
            <X size={26} />
          </ThemeIcon>
        </Dropzone.Reject>

        <Dropzone.Idle>
          <ThemeIcon size={54} radius="xl" color="violet" variant="light">
            <FileText size={26} />
          </ThemeIcon>
        </Dropzone.Idle>

        <Box>
          {document ? (
            <Stack gap={3}>
              <Text fw={600}>{document.name}</Text>

              <Text size="sm" c="dimmed">
                {(document.size / 1024).toFixed(1)} KB
              </Text>
            </Stack>
          ) : (
            <Stack gap={3}>
              <Text fw={600} size="lg">
                Arrastra un documento aquí
              </Text>

              <Text size="sm" c="dimmed">
                PDF, DOCX o TXT · máximo 10 MB
              </Text>
            </Stack>
          )}
        </Box>
      </Group>
    </Dropzone>
  );
}
