import {
  Group,
  Loader,
  Text,
} from "@mantine/core";

import type {
  RequestStage,
} from "../hooks/useSubmitRequest";


interface RequestProgressProps {
  stage: RequestStage;
  hasDocument?: boolean;
}


export function RequestProgress({
  stage,
  hasDocument = false,
}: RequestProgressProps) {
  if (
    stage === "idle" ||
    stage === "success"
  ) {
    return null;
  }

  let label = "Pensando...";

  if (stage === "preparing-upload") {
    label = "Preparando documento...";
  }

  if (stage === "uploading") {
    label = "Subiendo documento...";
  }

  if (
    stage === "processing" &&
    hasDocument
  ) {
    label = "Analizando documento...";
  }

  return (
    <Group
      gap="xs"
      py="xs"
      wrap="nowrap"
    >
      <Loader
        size={16}
        color="violet"
      />

      <Text
        size="sm"
        c="dimmed"
      >
        {label}
      </Text>
    </Group>
  );
}