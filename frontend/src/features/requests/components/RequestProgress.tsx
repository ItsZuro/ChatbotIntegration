import {
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';

import {
  Check,
  CloudUpload,
  FileSearch,
  Link,
} from 'lucide-react';

import type {
  RequestStage,
} from '../hooks/useSubmitRequest';


interface RequestProgressProps {
  stage: RequestStage;
}


const steps = [
  {
    stage: 'preparing-upload',
    label: 'Preparando documento',
    description: 'Generando acceso seguro a S3',
    icon: Link,
  },
  {
    stage: 'uploading',
    label: 'Subiendo documento',
    description: 'Almacenando archivo en Amazon S3',
    icon: CloudUpload,
  },
  {
    stage: 'processing',
    label: 'Analizando solicitud',
    description: 'OpenAI está procesando la información',
    icon: FileSearch,
  },
] as const;


export function RequestProgress({
  stage,
}: RequestProgressProps) {
  if (
    stage === 'idle' ||
    stage === 'success'
  ) {
    return null;
  }

  const activeIndex = steps.findIndex(
    (step) => step.stage === stage
  );

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
    >
      <Stack gap="md">
        <Text fw={700}>
          Procesando solicitud
        </Text>

        {steps.map((step, index) => {
          const Icon = step.icon;

          const completed =
            activeIndex > index;

          const active =
            activeIndex === index;

          return (
            <Group
              key={step.stage}
              wrap="nowrap"
              align="flex-start"
            >
              <ThemeIcon
                size={36}
                radius="xl"
                color={
                  completed
                    ? 'teal'
                    : active
                      ? 'violet'
                      : 'gray'
                }
                variant={
                  completed
                    ? 'filled'
                    : 'light'
                }
              >
                {completed ? (
                  <Check size={18} />
                ) : active ? (
                  <Loader
                    size={17}
                    color="violet"
                  />
                ) : (
                  <Icon size={17} />
                )}
              </ThemeIcon>

              <div>
                <Text
                  size="sm"
                  fw={600}
                  c={
                    active || completed
                      ? undefined
                      : 'dimmed'
                  }
                >
                  {step.label}
                </Text>

                <Text
                  size="xs"
                  c="dimmed"
                >
                  {step.description}
                </Text>
              </div>
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
}