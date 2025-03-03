// pages/StockDetails/components/BalanceSheet/BalanceSheet.tsx
import { useEffect, useState } from 'react';
import { Alert, Grid, Card, Loader, Text, Title, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import AlphaVantageApiService from '../../../../services/alpha-vantage-service';

interface IBalanceSheetProps {
  symbol: string;
}

const BalanceSheet: React.FC<IBalanceSheetProps> = ({ symbol }) => {
  const [balanceData, setBalanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await AlphaVantageApiService.getBalanceSheet(symbol);

        if (!data || !data.annualReports || data.annualReports.length === 0) {
          setError('No balance sheet data available');
        } else {
          setBalanceData(data);
          setSelectedYear(data.annualReports[0].fiscalDateEnding.substring(0, 4));
          setError(null);
        }
      } catch (err) {
        setError('Failed to load balance sheet data');
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

  // Get the latest report
  const latestReport = balanceData.annualReports[0];

  // Format large numbers for better readability
  const formatCurrency = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 1000000000) {
      return `$${(numValue / 1000000000).toFixed(2)} B`;
    } else if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(2)} M`;
    }
    return `$${numValue.toLocaleString()}`;
  };

  // Prepare assets data for pie chart
  const assetsData = [
    { name: 'Current Assets', value: parseInt(latestReport.totalCurrentAssets) || 0 },
    {
      name: 'Non-Current Assets',
      value: (parseInt(latestReport.totalAssets) || 0) - (parseInt(latestReport.totalCurrentAssets) || 0),
    },
  ];

  // Prepare liabilities and equity data for pie chart
  const liabilitiesEquityData = [
    { name: 'Current Liabilities', value: parseInt(latestReport.totalCurrentLiabilities) || 0 },
    {
      name: 'Non-Current Liabilities',
      value: (parseInt(latestReport.totalLiabilities) || 0) - (parseInt(latestReport.totalCurrentLiabilities) || 0),
    },
    {
      name: 'Shareholder Equity',
      value: parseInt(latestReport.totalShareholderEquity) || 0,
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div>
      <Title order={3} mb="md">
        {symbol} Balance Sheet
      </Title>
      <Text mb="lg">Fiscal Year Ending: {latestReport.fiscalDateEnding}</Text>

      <Grid>
        {/* Assets Section */}
        <Grid.Col span={12}>
          <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
            <Title order={4} mb="md">
              Assets
            </Title>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetsData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {assetsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value.toString())} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <Group mt="md">
              <Text size="sm">
                <b>Total Assets:</b> {formatCurrency(latestReport.totalAssets)}
              </Text>
              <Text size="sm">
                <b>Current Assets:</b> {formatCurrency(latestReport.totalCurrentAssets)}
              </Text>
            </Group>

            <Group mt="xs">
              <Text size="sm">
                <b>Cash:</b> {formatCurrency(latestReport.cashAndCashEquivalentsAtCarryingValue)}
              </Text>
              <Text size="sm">
                <b>Inventory:</b> {formatCurrency(latestReport.inventory)}
              </Text>
            </Group>
          </Card>
        </Grid.Col>

        {/* Liabilities and Equity Section */}
        <Grid.Col span={12}>
          <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
            <Title order={4} mb="md">
              Liabilities & Equity
            </Title>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={liabilitiesEquityData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {liabilitiesEquityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value.toString())} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <Group mt="md">
              <Text size="sm">
                <b>Total Liabilities:</b> {formatCurrency(latestReport.totalLiabilities)}
              </Text>
              <Text size="sm">
                <b>Current Liabilities:</b> {formatCurrency(latestReport.totalCurrentLiabilities)}
              </Text>
            </Group>

            <Group mt="xs">
              <Text size="sm">
                <b>Long Term Debt:</b> {formatCurrency(latestReport.longTermDebt)}
              </Text>
              <Text size="sm">
                <b>Shareholder Equity:</b> {formatCurrency(latestReport.totalShareholderEquity)}
              </Text>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default BalanceSheet;
