// pages/StockDetails/components/BalanceSheet/BalanceSheet.tsx
import { useEffect, useState } from 'react';
import { Alert, Grid, Card, Loader, Text, Title, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import AlphaVantageApiService from '../../../../services/alpha-vantage-service';
import { useStockData } from '../../../../context/stock-data';
import './BalanceSheet.css'; // Import the CSS file

interface IBalanceSheetProps {
  symbol: string;
}

const BalanceSheet: React.FC<IBalanceSheetProps> = ({ symbol }) => {
  const { balanceSheet: balanceData, errorBalanceSheet: error, loadingBalanceSheet: loading } = useStockData();
  const [selectedYear, setSelectedYear] = useState<string>('');

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" className="error-alert">
        {error}
      </Alert>
    );
  }

  if (!balanceData) {
    return <Text>No data available</Text>;
  }

  // Get the latest report
  const latestReport = balanceData?.annualReports?.[0] || ({} as any);

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

  const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'];

  return (
    <div className="balance-sheet-container">
      <Title order={3} className="balance-sheet-title">
        {symbol} Balance Sheet
      </Title>
      <Text className="fiscal-date">Fiscal Year Ending: {latestReport.fiscalDateEnding}</Text>

      <Grid>
        {/* Assets Section */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" p="lg" radius="md" withBorder className="balance-card">
            <div className="card-header assets-header">
              <Title order={4}>Assets</Title>
            </div>

            <div className="chart-container">
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
            </div>

            <div className="stats-group">
              <div className="stat-item asset-stat">
                <strong>Total Assets:</strong> {formatCurrency(latestReport.totalAssets)}
              </div>
              <div className="stat-item asset-stat">
                <strong>Current Assets:</strong> {formatCurrency(latestReport.totalCurrentAssets)}
              </div>
            </div>

            <div className="stats-group">
              <div className="stat-item asset-stat">
                <strong>Cash:</strong> {formatCurrency(latestReport.cashAndCashEquivalentsAtCarryingValue)}
              </div>
              <div className="stat-item asset-stat">
                <strong>Inventory:</strong> {formatCurrency(latestReport.inventory)}
              </div>
            </div>
          </Card>
        </Grid.Col>

        {/* Liabilities and Equity Section */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" p="lg" radius="md" withBorder className="balance-card">
            <div className="card-header liabilities-header">
              <Title order={4}>Liabilities & Equity</Title>
            </div>

            <div className="chart-container">
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
            </div>

            <div className="stats-group">
              <div className="stat-item liability-stat">
                <strong>Total Liabilities:</strong> {formatCurrency(latestReport.totalLiabilities)}
              </div>
              <div className="stat-item liability-stat">
                <strong>Current Liabilities:</strong> {formatCurrency(latestReport.totalCurrentLiabilities)}
              </div>
            </div>

            <div className="stats-group">
              <div className="stat-item liability-stat">
                <strong>Long Term Debt:</strong> {formatCurrency(latestReport.longTermDebt)}
              </div>
              <div className="stat-item equity-stat">
                <strong>Shareholder Equity:</strong> {formatCurrency(latestReport.totalShareholderEquity)}
              </div>
            </div>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default BalanceSheet;
