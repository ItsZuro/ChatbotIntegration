import {
  SimpleGrid,
  Skeleton,
} from '@mantine/core';

import {
  Activity,
  CheckCircle2,
  MessageSquare,
  Workflow,
} from 'lucide-react';

import type {
  DashboardMetrics,
} from '../../../types/api.types';

import {
  MetricCard,
} from './MetricCard';


interface MetricsGridProps {
  metrics?: DashboardMetrics;
  loading?: boolean;
}


export function MetricsGrid({
  metrics,
  loading = false,
}: MetricsGridProps) {
  if (
    loading ||
    !metrics
  ) {
    return (
      <SimpleGrid
        cols={{
          base: 1,
          sm: 2,
          xl: 4,
        }}
        spacing="lg"
      >
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <Skeleton
            key={index}
            height={135}
            radius="lg"
          />
        ))}
      </SimpleGrid>
    );
  }


  const successRate =
    metrics.total_requests > 0
      ? Math.round(
          (
            metrics.successful_requests /
            metrics.total_requests
          ) * 100
        )
      : 0;


  const dashboardMetrics = [
    {
      title:
        'Solicitudes',

      value:
        String(
          metrics.total_requests
        ),

      description:
        `${metrics.successful_requests} exitosas · ` +
        `${metrics.failed_requests} con error`,

      icon:
        Activity,

      color:
        'violet',
    },

    {
      title:
        'Acciones ejecutadas',

      value:
        String(
          metrics.executed_actions
        ),

      description:
        'HubSpot, Jira y Calendar',

      icon:
        Workflow,

      color:
        'blue',
    },

    {
      title:
        'Conversaciones',

      value:
        String(
          metrics.conversations
        ),

      description:
        'Chats persistentes',

      icon:
        MessageSquare,

      color:
        'cyan',
    },

    {
      title:
        'Tasa de éxito',

      value:
        `${successRate}%`,

      description:
        'Sobre solicitudes auditadas',

      icon:
        CheckCircle2,

      color:
        'teal',
    },
  ];


  return (
    <SimpleGrid
      cols={{
        base: 1,
        sm: 2,
        xl: 4,
      }}
      spacing="lg"
    >
      {dashboardMetrics.map(
        (
          metric,
          index
        ) => (
          <MetricCard
            key={
              metric.title
            }
            {...metric}
            index={
              index
            }
          />
        )
      )}
    </SimpleGrid>
  );
}