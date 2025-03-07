import React from 'react';
import { Container, Title, Grid, Text, Stack, Group, Card, Loader } from '@mantine/core';
import { useStockData } from '../../../../context/stock-data';
import DCFValuation from '../DcfValuation/DcfValuation';
import ProfitabilityScore from '../ProfitabilityScore/ProfitabilityScore';
import SolvencyScore from '../SolvencyScore/SolvencyScore';
import EconomicMoat from '../EconomicMoat/EconomicMoat';

export const StockAnalysisDashboard: React.FC = () => {
  const { companyOverview, loadingOverview, errorOverview } = useStockData();

  if (loadingOverview) {
    return (
      <Card p="xl" shadow="md" withBorder style={{ height: '300px' }}>
        <Stack align="center" justify="center" style={{ height: '100%' }}>
          <Loader size="lg" />
          <Text>Loading stock data...</Text>
        </Stack>
      </Card>
    );
  }

  if (errorOverview || !companyOverview) {
    return (
      <Card p="xl" shadow="md" withBorder style={{ height: '300px' }}>
        <Stack align="center" justify="center" style={{ height: '100%' }}>
          <Text color="red" size="lg">
            Error loading stock data
          </Text>
          <Text color="dimmed">Please try searching for a different ticker symbol.</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack>
        <Group>
          <Stack>
            <Title order={1}>
              {companyOverview.Name} ({companyOverview.Symbol})
            </Title>
            <Text size="sm" color="dimmed">
              {companyOverview.Exchange} · {companyOverview.Industry}
            </Text>
          </Stack>
          <Stack align="flex-end">
            <Title order={2}>${parseFloat(companyOverview.price || '0').toFixed(2)}</Title>
            <Text size="sm" color="dimmed">
              Market Cap: ${(parseFloat(companyOverview.MarketCapitalization || '0') / 1000000000).toFixed(2)}B
            </Text>
          </Stack>
        </Group>

        <Grid>
          <Grid.Col span={12}>
            <DCFValuation />
          </Grid.Col>

          <Grid.Col span={12}>
            <ProfitabilityScore />
          </Grid.Col>

          <Grid.Col span={12}>
            <SolvencyScore />
          </Grid.Col>

          <Grid.Col span={12}>
            <EconomicMoat />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default StockAnalysisDashboard;
