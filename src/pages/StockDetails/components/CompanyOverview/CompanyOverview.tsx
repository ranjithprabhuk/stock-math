// pages/StockDetails/components/CompanyOverview/CompanyOverview.tsx
import { useEffect, useState } from 'react';
import { Card, Group, Text, Badge, Grid, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { ICompanyOverview } from '../../../../interfaces/ICompanyOverview';
import AlphaVantageApiService from '../../../../services/alpha-vantage-service';

interface ICompanyOverviewProps {
  symbol: string;
}

const CompanyOverview: React.FC<ICompanyOverviewProps> = ({ symbol }) => {
  const [overviewData, setOverviewData] = useState<ICompanyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await AlphaVantageApiService.getCompanyOverview(symbol);

        if (!data || Object.keys(data).length === 0) {
          setError('No company data available');
        } else {
          setOverviewData(data);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load company overview');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return <Loader size="xl" />;
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
        <Group mb="md">
          <Text size="xl">{overviewData?.Name}</Text>
          <Badge color="blue" variant="light" size="lg">
            {overviewData?.Exchange}: {overviewData?.Symbol}
          </Badge>
        </Group>

        <Text size="sm" color="dimmed" mb="md">
          {overviewData?.Description}
        </Text>

        <Grid>
          <Grid.Col span={6}>
            <Card p="xs">
              <Text>General Information</Text>
              <Text size="sm">
                <b>Sector:</b> {overviewData?.Sector}
              </Text>
              <Text size="sm">
                <b>Industry:</b> {overviewData?.Industry}
              </Text>
              <Text size="sm">
                <b>Country:</b> {overviewData?.Country}
              </Text>
              <Text size="sm">
                <b>Address:</b> {overviewData?.Address}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card p="xs">
              <Text>Financial Metrics</Text>
              <Text size="sm">
                <b>Market Cap:</b> ${Number(overviewData?.MarketCapitalization).toLocaleString()}
              </Text>
              <Text size="sm">
                <b>P/E Ratio:</b> {overviewData?.PERatio}
              </Text>
              <Text size="sm">
                <b>Dividend Yield:</b> {overviewData?.DividendYield}%
              </Text>
              <Text size="sm">
                <b>52 Week High:</b> ${overviewData?.['52WeekHigh']}
              </Text>
              <Text size="sm">
                <b>52 Week Low:</b> ${overviewData?.['52WeekLow']}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Card>
    </div>
  );
};

export default CompanyOverview;
