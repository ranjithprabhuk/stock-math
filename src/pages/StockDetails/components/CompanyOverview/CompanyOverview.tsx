import { useEffect, useState } from 'react';
import { Card, Group, Text, Badge, Grid, Loader, Alert, SimpleGrid, Divider } from '@mantine/core';
import { IconAlertCircle, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { useStockData } from '../../../../context/stock-data';
import './CompanyOverview.css';

interface ICompanyOverviewProps {
  symbol: string;
}

const CompanyOverview: React.FC<ICompanyOverviewProps> = ({ symbol }) => {
  const { companyOverview: overviewData, errorOverview: error, loadingOverview: loading } = useStockData();

  if (loading) {
    return (
      <div className="loader-container">
        <Loader size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        {error}
      </Alert>
    );
  }

  if (!overviewData) {
    return <Text>No data available</Text>;
  }

  // Format numbers with commas
  const formatNumber = (value: string) => {
    if (!value || isNaN(Number(value))) return '-';
    return Number(value).toLocaleString();
  };

  // Format percentage values
  const formatPercent = (value: string) => {
    if (!value || isNaN(Number(value))) return '-';
    const num = Number(value);
    return (
      <span className={num > 0 ? 'positive-value' : num < 0 ? 'negative-value' : ''}>
        {num > 0 ? '+' : ''}
        {num.toFixed(2)}%
        {num > 0 ? (
          <IconTrendingUp size={14} style={{ marginLeft: 5 }} />
        ) : num < 0 ? (
          <IconTrendingDown size={14} style={{ marginLeft: 5 }} />
        ) : null}
      </span>
    );
  };

  // Format dollar values
  const formatDollar = (value: string) => {
    if (!value || isNaN(Number(value))) return '-';
    return `$${Number(value).toLocaleString()}`;
  };

  return (
    <div className="company-overview-container">
      <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
        <div className="company-header">
          <Group justify="space-between" mb="md">
            <div>
              <Text className="company-name">{overviewData?.Name}</Text>
              <Group gap="xs">
                <Badge color="blue" variant="light" size="lg" className="symbol-badge">
                  {overviewData?.Exchange}: {overviewData?.Symbol}
                </Badge>
                <Badge color="green" variant="light" size="lg" className="price-badge">
                  {formatDollar(overviewData?.price)}
                </Badge>
              </Group>
            </div>
            <Group>
              <Badge color="gray" variant="outline">
                {overviewData?.AssetType}
              </Badge>
              <Badge color="indigo" variant="outline">
                {overviewData?.Currency}
              </Badge>
            </Group>
          </Group>

          <Text className="company-description">{overviewData?.Description}</Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" className="card-grid">
          {/* Company Information */}
          <Card shadow="xs" p="md" radius="md" withBorder className="info-card">
            <Text className="card-title">Company Information</Text>
            <Grid gutter="xs">
              <Grid.Col span={6}>
                <Text className="data-label">Sector:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.Sector || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Industry:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.Industry || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Country:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.Country || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Address:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.Address || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">CIK:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.CIK || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Fiscal Year End:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.FiscalYearEnd || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Latest Quarter:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.LatestQuarter || '-'}</Text>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Market Data */}
          <Card shadow="xs" p="md" radius="md" withBorder className="info-card">
            <Text className="card-title">Market Data</Text>
            <Grid gutter="xs">
              <Grid.Col span={6}>
                <Text className="data-label">Market Cap:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.MarketCapitalization)}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">52 Week High:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.['52WeekHigh'])}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">52 Week Low:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.['52WeekLow'])}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">50-Day Avg:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.['50DayMovingAverage'])}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">200-Day Avg:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.['200DayMovingAverage'])}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Shares Outstanding:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatNumber(overviewData?.SharesOutstanding)}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Beta:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.Beta || '-'}</Text>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Valuation Metrics */}
          <Card shadow="xs" p="md" radius="md" withBorder className="info-card">
            <Text className="card-title">Valuation Metrics</Text>
            <Grid gutter="xs">
              <Grid.Col span={6}>
                <Text className="data-label">P/E Ratio:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.PERatio || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Trailing P/E:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.TrailingPE || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Forward P/E:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.ForwardPE || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">PEG Ratio:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.PEGRatio || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Price to Sales:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.PriceToSalesRatioTTM || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Price to Book:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.PriceToBookRatio || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">EV/Revenue:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.EVToRevenue || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">EV/EBITDA:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.EVToEBITDA || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Book Value:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.BookValue || '-'}</Text>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Financial Performance */}
          <Card shadow="xs" p="md" radius="md" withBorder className="info-card">
            <Text className="card-title">Financial Performance</Text>
            <Grid gutter="xs">
              <Grid.Col span={6}>
                <Text className="data-label">EBITDA:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.EBITDA)}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Revenue (TTM):</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.RevenueTTM)}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Gross Profit (TTM):</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.GrossProfitTTM)}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Revenue/Share:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.RevenuePerShareTTM)}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">EPS:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.EPS)}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Diluted EPS (TTM):</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.DilutedEPSTTM)}</Text>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Profitability & Growth */}
          <Card shadow="xs" p="md" radius="md" withBorder className="info-card">
            <Text className="card-title">Profitability & Growth</Text>
            <Grid gutter="xs">
              <Grid.Col span={6}>
                <Text className="data-label">Profit Margin:</Text>
              </Grid.Col>
              <Grid.Col span={6}>{formatPercent(overviewData?.ProfitMargin)}</Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Operating Margin:</Text>
              </Grid.Col>
              <Grid.Col span={6}>{formatPercent(overviewData?.OperatingMarginTTM)}</Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">ROA (TTM):</Text>
              </Grid.Col>
              <Grid.Col span={6}>{formatPercent(overviewData?.ReturnOnAssetsTTM)}</Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">ROE (TTM):</Text>
              </Grid.Col>
              <Grid.Col span={6}>{formatPercent(overviewData?.ReturnOnEquityTTM)}</Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Quarterly Earnings Growth:</Text>
              </Grid.Col>
              <Grid.Col span={6}>{formatPercent(overviewData?.QuarterlyEarningsGrowthYOY)}</Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Quarterly Revenue Growth:</Text>
              </Grid.Col>
              <Grid.Col span={6}>{formatPercent(overviewData?.QuarterlyRevenueGrowthYOY)}</Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Analyst Target Price:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.AnalystTargetPrice)}</Text>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Dividends */}
          <Card shadow="xs" p="md" radius="md" withBorder className="info-card">
            <Text className="card-title">Dividends</Text>
            <Grid gutter="xs">
              <Grid.Col span={6}>
                <Text className="data-label">Dividend Yield:</Text>
              </Grid.Col>
              <Grid.Col span={6}>{formatPercent(overviewData?.DividendYield)}</Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Dividend Per Share:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{formatDollar(overviewData?.DividendPerShare)}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Dividend Date:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.DividendDate || '-'}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text className="data-label">Ex-Dividend Date:</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text className="data-value">{overviewData?.ExDividendDate || '-'}</Text>
              </Grid.Col>
            </Grid>
          </Card>
        </SimpleGrid>
      </Card>
    </div>
  );
};

export default CompanyOverview;
