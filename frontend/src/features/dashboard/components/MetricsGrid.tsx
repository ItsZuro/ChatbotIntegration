import {
  SimpleGrid,
} from '@mantine/core';

import {
  metrics,
} from '../data/dashboardData';

import {
  MetricCard,
} from './MetricCard';


export function MetricsGrid() {
  return (
    <SimpleGrid
      cols={{
        base: 1,
        sm: 2,
        xl: 4,
      }}
      spacing="lg"
    >
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.title}
          {...metric}
          index={index}
        />
      ))}
    </SimpleGrid>
  );
}