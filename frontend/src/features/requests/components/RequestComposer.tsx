import {
  Alert,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";

import { AlertCircle, Send, Sparkles } from "lucide-react";

import { useState } from "react";

import { DocumentDropzone } from "./DocumentDropzone";

import { RequestProgress } from "./RequestProgress";

import { RequestResult } from "./RequestResult";

import { useSubmitRequest } from "../hooks/useSubmitRequest";

import type { SelectedDocument } from "../types/request.types";

export function RequestComposer() {
  const [message, setMessage] = useState("");

  const [document, setDocument] = useState<SelectedDocument | null>(null);

  const { mutate, data, error, isPending, stage, reset } = useSubmitRequest();

  const canSubmit = message.trim().length > 0 && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    reset();

    mutate(
      {
        message: message.trim(),
        document,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Solicitud completada",
            message: "UTP Assistant terminó de procesar la solicitud.",
            color: "teal",
          });
        },

        onError: (mutationError) => {
          notifications.show({
            title: "Error de procesamiento",
            message: mutationError.message,
            color: "red",
          });
        },
      },
    );
  };

  return (
    <Stack gap="lg">
      <Paper withBorder radius="lg" p="xl">
        <Stack gap="xl">
          <Group gap="sm">
            <ThemeIcon size={40} radius="md" variant="light" color="violet">
              <Sparkles size={20} />
            </ThemeIcon>

            <div>
              <Text fw={700} size="lg">
                Nueva solicitud
              </Text>

              <Text size="sm" c="dimmed">
                Describe la tarea y adjunta un documento si es necesario.
              </Text>
            </div>
          </Group>

          <DocumentDropzone document={document} onChange={setDocument} />

          <Textarea
            label="Instrucciones"
            description={
              "UTP Assistant analizará la solicitud y decidirá qué herramientas utilizar."
            }
            placeholder="Ejemplo: Analiza el documento, registra al prospecto, crea una tarea en Jira y agenda la reunión indicada."
            minRows={7}
            autosize
            value={message}
            disabled={isPending}
            onChange={(event) => setMessage(event.currentTarget.value)}
          />

          <Group justify="flex-end">
            <Button
              disabled={!canSubmit}
              loading={isPending}
              leftSection={!isPending ? <Send size={17} /> : undefined}
              variant="gradient"
              gradient={{
                from: "violet",
                to: "indigo",
              }}
              onClick={handleSubmit}
            >
              {isPending ? "Procesando..." : "Analizar y ejecutar"}
            </Button>
          </Group>
        </Stack>
      </Paper>

      <RequestProgress stage={stage} />

      {error && (
        <Alert
          color="red"
          variant="light"
          title="No se pudo completar la solicitud"
          icon={<AlertCircle size={18} />}
        >
          {error.message}
        </Alert>
      )}

      {data && <RequestResult result={data} />}
    </Stack>
  );
}
