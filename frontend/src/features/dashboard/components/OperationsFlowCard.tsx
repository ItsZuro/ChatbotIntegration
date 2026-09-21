import {
  Badge,
  Box,
  Divider,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Network,
  Workflow,
} from 'lucide-react';


const capabilities = [
  {
    label: 'Orquestación de herramientas',
    value: 'Operativa',
    progress: 100,
    color: 'teal',
  },
  {
    label: 'Procesamiento de documentos',
    value: 'TXT / PDF / DOCX',
    progress: 100,
    color: 'blue',
  },
  {
    label: 'Persistencia y auditoría',
    value: 'DynamoDB',
    progress: 100,
    color: 'violet',
  },
];


const flow = [
  {
    title: 'Entrada',
    description: 'Mensaje + documento',
    icon: FileText,
    color: 'blue',
  },
  {
    title: 'Análisis',
    description: 'OpenAI + Function Calling',
    icon: Bot,
    color: 'violet',
  },
  {
    title: 'Ejecución',
    description: 'HubSpot · Jira · Calendar',
    icon: Network,
    color: 'indigo',
  },
  {
    title: 'Auditoría',
    description: 'DynamoDB',
    icon: Database,
    color: 'teal',
  },
];


export function OperationsFlowCard() {
  return (
    <Paper
      withBorder
      radius="xl"
      p="xl"
      h="100%"
      style={{
        background:
          "linear-gradient(145deg, rgba(32, 28, 51, 0.95), rgba(16, 22, 42, 0.94))",
        border:
          "1px solid rgba(124, 58, 237, 0.20)",
        boxShadow:
          "0 18px 48px rgba(0, 0, 0, 0.20)",
      }}
    >
      <Group
        justify="space-between"
        align="flex-start"
        mb="xl"
      >
        <Box>
          <Group gap="sm">
            <Text fw={700} size="lg">
              Flujo inteligente
            </Text>

            <Badge
              color="teal"
              variant="light"
              leftSection={
                <CheckCircle2 size={11} />
              }
            >
              Operativo
            </Badge>
          </Group>

          <Text
            size="sm"
            c="dimmed"
            mt={3}
          >
            Procesamiento y ejecución automatizada
            de solicitudes.
          </Text>
        </Box>

        <ThemeIcon
          size={40}
          radius="md"
          variant="light"
          color="violet"
        >
          <Workflow size={20} />
        </ThemeIcon>
      </Group>

      <Stack gap="lg">
        {capabilities.map((capability) => (
          <Box key={capability.label}>
            <Group
              justify="space-between"
              mb={7}
            >
              <Text
                size="sm"
                fw={500}
              >
                {capability.label}
              </Text>

              <Text
                size="xs"
                fw={600}
                c={capability.color}
              >
                {capability.value}
              </Text>
            </Group>

            <Progress
              value={capability.progress}
              color={capability.color}
              radius="xl"
              size="sm"
            />
          </Box>
        ))}
      </Stack>

      <Divider my="xl" />

      <Text
        size="xs"
        fw={700}
        c="dimmed"
        tt="uppercase"
        mb="md"
      >
        Pipeline de ejecución
      </Text>

      <SimpleGrid
        cols={{
          base: 1,
          sm: 2,
          xl: 4,
        }}
        spacing="sm"
      >
        {flow.map((step, index) => {
          const Icon = step.icon;

          return (
            <Paper
              key={step.title}
              withBorder
              radius="md"
              p="md"
              pos="relative"
              style={{
                background:
                  "rgba(255, 255, 255, 0.028)",
                border:
                  "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <Group
                justify="space-between"
                align="flex-start"
                wrap="nowrap"
              >
                <ThemeIcon
                  color={step.color}
                  variant="light"
                  radius="md"
                  size={36}
                >
                  <Icon size={18} />
                </ThemeIcon>

                {index < flow.length - 1 && (
                  <ArrowRight
                    size={15}
                    opacity={0.35}
                  />
                )}
              </Group>

              <Text
                fw={600}
                size="sm"
                mt="md"
              >
                {step.title}
              </Text>

              <Text
                size="xs"
                c="dimmed"
                mt={3}
              >
                {step.description}
              </Text>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Paper>
  );
}