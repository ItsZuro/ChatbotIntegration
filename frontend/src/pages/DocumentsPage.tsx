import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";

import { modals } from "@mantine/modals";

import {
  AlertCircle,
  Download,
  FileText,
  Files,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { useMemo, useState } from "react";

import { notifications } from "@mantine/notifications";

import {
  useDeleteDocument,
  useDocuments,
  useDownloadDocument,
} from "../features/documents/hooks/useDocuments";

import type { DocumentItem } from "../types/api.types";

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(date);
}

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toUpperCase();

  return extension || "ARCHIVO";
}

interface DocumentCardProps {
  document: DocumentItem;

  downloading: boolean;

  deleting: boolean;

  onDownload: (document: DocumentItem) => void;

  onDelete: (document: DocumentItem) => void;
}

function DocumentCard({
  document,
  downloading,
  deleting,
  onDownload,
  onDelete,
}: DocumentCardProps) {
  return (
    <Paper
      withBorder
      radius="xl"
      p="lg"
      style={{
        background:
          "linear-gradient(145deg, rgba(32, 28, 51, 0.95), rgba(15, 22, 41, 0.94))",
        border:
          "1px solid rgba(124, 58, 237, 0.18)",
        boxShadow:
          "0 14px 38px rgba(0, 0, 0, 0.18)",
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group
          wrap="nowrap"
          style={{
            minWidth: 0,
          }}
        >
          <ThemeIcon size={44} radius="md" variant="light" color="violet">
            <FileText size={21} />
          </ThemeIcon>

          <Box
            style={{
              minWidth: 0,
            }}
          >
            <Text fw={600} size="sm" truncate>
              {document.file_name}
            </Text>

            <Group gap="xs" mt={6}>
              <Badge size="xs" variant="light" color="violet">
                {getFileExtension(document.file_name)}
              </Badge>

              <Text size="xs" c="dimmed">
                {formatFileSize(document.size)}
              </Text>

              <Text size="xs" c="dimmed">
                ·
              </Text>

              <Text size="xs" c="dimmed">
                {formatDate(document.last_modified)}
              </Text>
            </Group>
          </Box>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Descargar">
            <ActionIcon
              size="lg"
              radius="xl"
              variant="light"
              color="violet"
              loading={downloading}
              disabled={deleting}
              onClick={() => onDownload(document)}
            >
              <Download size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Eliminar">
            <ActionIcon
              size="lg"
              radius="xl"
              variant="light"
              color="red"
              loading={deleting}
              disabled={downloading}
              onClick={() => onDelete(document)}
            >
              <Trash2 size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}

export function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [downloadingObjectKey, setDownloadingObjectKey] = useState<
    string | null
  >(null);

  const [deletingObjectKey, setDeletingObjectKey] = useState<string | null>(
    null,
  );

  const { mutateAsync: removeDocument } = useDeleteDocument();

  const { data, isLoading, isError, isFetching, refetch } = useDocuments();

  const { mutateAsync: getDownloadUrl } = useDownloadDocument();

  const documents = data?.documents ?? [];

  const filteredDocuments = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return documents;
    }

    return documents.filter((document) =>
      document.file_name.toLowerCase().includes(normalized),
    );
  }, [documents, search]);

  const handleDownload = async (document: DocumentItem) => {
    try {
      setDownloadingObjectKey(document.object_key);

      const result = await getDownloadUrl(document.object_key);

      window.open(result.download_url, "_blank", "noopener,noreferrer");
    } catch {
      notifications.show({
        title: "No se pudo descargar",

        message: "No fue posible generar el enlace temporal.",

        color: "red",
      });
    } finally {
      setDownloadingObjectKey(null);
    }
  };

  const handleDelete = (document: DocumentItem) => {
    modals.openConfirmModal({
      title: "Eliminar documento",

      centered: true,

      children: (
        <Stack gap="xs">
          <Text size="sm">
            ¿Seguro que deseas eliminar <strong>{document.file_name}</strong>?
          </Text>

          <Text size="xs" c="dimmed">
            El archivo se eliminará permanentemente de S3. Las respuestas de
            chats que ya utilizaron este documento no serán eliminadas.
          </Text>
        </Stack>
      ),

      labels: {
        confirm: "Eliminar",

        cancel: "Cancelar",
      },

      confirmProps: {
        color: "red",
      },

      onConfirm: async () => {
        try {
          setDeletingObjectKey(document.object_key);

          await removeDocument(document.object_key);

          notifications.show({
            title: "Documento eliminado",

            message: `${document.file_name} fue eliminado correctamente.`,

            color: "teal",
          });
        } catch {
          notifications.show({
            title: "No se pudo eliminar",

            message: "Inténtalo nuevamente.",

            color: "red",
          });
        } finally {
          setDeletingObjectKey(null);
        }
      },
    });
  };

  return (
    <Box maw={1200} mx="auto" py="xs">
      <Group justify="space-between" align="flex-start" mb="xl">
        <Box>
          <Group gap="sm">
            <Title
              order={2}
              fw={800}
              c="violet.1"
            >
              Documentos
            </Title>

            <Badge color="violet" variant="light">
              {documents.length} archivos
            </Badge>
          </Group>

          <Text c="dimmed" mt={4}>
            Documentos almacenados y procesados por UTP Assistant.
          </Text>
        </Box>

        <Tooltip label="Actualizar">
          <ActionIcon
            variant="light"
            color="violet"
            size="lg"
            loading={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCw size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Paper
        withBorder
        radius="xl"
        p="md"
        mb="lg"
        style={{
          background:
            "rgba(30, 26, 48, 0.86)",
          border:
            "1px solid rgba(139, 92, 246, 0.18)",
          boxShadow:
            "0 14px 38px rgba(0, 0, 0, 0.14)",
          backdropFilter:
            "blur(14px)",
        }}
      >
        <TextInput
          placeholder="Buscar documento..."
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          leftSection={<Search size={16} />}
        />
      </Paper>

      {isError ? (
        <Alert
          color="red"
          variant="light"
          icon={<AlertCircle size={18} />}
          title="No se pudieron cargar los documentos"
        >
          <Group justify="space-between">
            <Text size="sm">
              No fue posible consultar los archivos almacenados.
            </Text>

            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => void refetch()}
            >
              Reintentar
            </Button>
          </Group>
        </Alert>
      ) : isLoading ? (
        <Center py={80}>
          <Loader color="violet" />
        </Center>
      ) : filteredDocuments.length === 0 ? (
        <Center py={80}>
          <Stack align="center" gap="xs">
            <ThemeIcon size={50} radius="xl" variant="light" color="gray">
              <Files size={23} />
            </ThemeIcon>

            <Text fw={600}>No hay documentos</Text>

            <Text size="sm" c="dimmed" ta="center">
              {search
                ? "No hay archivos " + "que coincidan con " + "la búsqueda."
                : "Los documentos " +
                  "enviados desde el " +
                  "chat aparecerán aquí."}
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.object_key}
              document={document}
              downloading={downloadingObjectKey === document.object_key}
              deleting={deletingObjectKey === document.object_key}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
