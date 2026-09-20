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
        radius="lg"
        p="lg"
        h="100%"
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