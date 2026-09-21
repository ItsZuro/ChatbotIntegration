import {
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';

import { motion } from 'framer-motion';

import type {
  LucideIcon,
} from 'lucide-react';


interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  color: string;
  index: number;
}


export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  index,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
      }}
      style={{
        height: '100%',
      }}
    >
      <Card
        withBorder
        radius="xl"
        p="lg"
        h="100%"
        style={{
          background:
            "linear-gradient(145deg, rgba(35, 29, 55, 0.95), rgba(18, 23, 43, 0.92))",
          border:
            "1px solid rgba(139, 92, 246, 0.18)",
          boxShadow:
            "0 16px 42px rgba(0, 0, 0, 0.20)",
        }}
      >
        <Group
          justify="space-between"
          align="flex-start"
        >
          <Stack gap={4}>
            <Text
              size="sm"
              c="dimmed"
              fw={500}
            >
              {title}
            </Text>

            <Text
              size="xl"
              fw={700}
            >
              {value}
            </Text>

            <Text
              size="xs"
              c="dimmed"
            >
              {description}
            </Text>
          </Stack>

          <ThemeIcon
            size={42}
            radius="md"
            variant="light"
            color={color}
          >
            <Icon size={21} />
          </ThemeIcon>
        </Group>
      </Card>
    </motion.div>
  );
}