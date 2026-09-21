import { Alert, Box, Button, Grid, Group, Text } from "@mantine/core";

import { AlertCircle, RefreshCw } from "lucide-react";

import { DashboardHeader } from "../features/dashboard/components/DashboardHeader";

import { MetricsGrid } from "../features/dashboard/components/MetricsGrid";

import { OperationsFlowCard } from "../features/dashboard/components/OperationsFlowCard";

import { RecentActivityCard } from "../features/dashboard/components/RecentActivityCard";

import { useDashboardSummary } from "../features/dashboard/hooks/useDashboard";

import { UsageCard } from "../features/usage/components/UsageCard";
import { useMyUsage } from "../features/usage/hooks/useUsage";

export function DashboardPage() {
  const { data, isLoading, isError, isFetching, refetch } =
    useDashboardSummary();

  const { data: usageData, isLoading: isUsageLoading } = useMyUsage();

  return (
    <Box maw={1500} mx="auto">
      <DashboardHeader />

      {isError && (
        <Alert
          color="red"
          variant="light"
          icon={<AlertCircle size={18} />}
          mb="lg"
          title="No se pudo cargar el dashboard"
        >
          <Group justify="space-between" align="center">
            <Text size="sm">
              No fue posible obtener las métricas desde el backend.
            </Text>

            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<RefreshCw size={14} />}
              loading={isFetching}
              onClick={() => void refetch()}
            >
              Reintentar
            </Button>
          </Group>
        </Alert>
      )}

      <MetricsGrid metrics={data?.metrics} loading={isLoading} />

      <Grid gap="lg" mt="lg">
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
          <UsageCard usage={usageData?.usage} loading={isUsageLoading} />
        </Grid.Col>

        <Grid.Col span={12}>
          <RecentActivityCard
            activities={data?.recent_activity}
            loading={isLoading}
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
