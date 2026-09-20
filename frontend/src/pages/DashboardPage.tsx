import {
  Box,
  Grid,
} from '@mantine/core';

import {
  DashboardHeader,
} from '../features/dashboard/components/DashboardHeader';

import {
  MetricsGrid,
} from '../features/dashboard/components/MetricsGrid';

import {
  OperationsFlowCard,
} from '../features/dashboard/components/OperationsFlowCard';

import {
  RecentActivityCard,
} from '../features/dashboard/components/RecentActivityCard';


export function DashboardPage() {
  return (
    <Box maw={1500} mx="auto">
      <DashboardHeader />

      <MetricsGrid />

      <Grid
        gap="lg"
        mt="lg"
      >
        <Grid.Col
          span={{
            base: 12,
            lg: 8,
          }}
        >
          <OperationsFlowCard />
        </Grid.Col>

        <Grid.Col
          span={{
            base: 12,
            lg: 4,
          }}
        >
          <RecentActivityCard />
        </Grid.Col>
      </Grid>
    </Box>
  );
}