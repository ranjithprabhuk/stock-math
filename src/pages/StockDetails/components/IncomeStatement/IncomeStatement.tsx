// pages/StockDetails/components/IncomeStatement/IncomeStatement.tsx
import { useEffect, useState } from 'react';
import { Accordion, Alert, Loader, Text, Title, Card } from '@mantine/core';
import { IconAlertCircle, IconChartBar, IconCash, IconTrendingUp } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IIncomeStatementReport } from '../../../../interfaces/IIncomeStatement';
import { useStockData } from '../../../../context/stock-data';
import './IncomeStatement.css';

interface IIncomeStatementProps {
  symbol: string;
}

const IncomeStatement: React.FC<IIncomeStatementProps> = ({ symbol }) => {
  const { incomeStatement: incomeData, errorIncomeStatement: error, loadingIncomeStatement: loading } = useStockData();
  const [activeChart, setActiveChart] = useState<string | null>(null);

  useEffect(() => {
    // Add animation class when chart becomes active
    if (activeChart) {
      const element = document.querySelector(`.${activeChart}-chart`);
      if (element) {
        element.classList.add('chart-animation');
      }
    }
  }, [activeChart]);

  if (loading) {
    return (
      <div
        className="income-statement-container"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}
      >
        <Loader size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="income-statement-container">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </div>
    );
  }

  if (!incomeData) {
    return (
      <div className="income-statement-container">
        <Text ta="center">No income statement data available for {symbol}</Text>
      </div>
    );
  }

  // Prepare data for charts
  const prepareChartData = (dataKey: keyof IIncomeStatementReport) => {
    return incomeData?.annualReports
      ?.map((report) => ({
        year: report.fiscalDateEnding.substring(0, 4),
        value: parseInt(report[dataKey] as string) || 0,
      }))
      .reverse(); // Show oldest to newest
  };

  // Format large numbers for better readability
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)} B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)} M`;
    }
    return `$${value.toLocaleString()}`;
  };

  // Calculate growth rates (year-over-year)
  const calculateGrowth = (dataKey: keyof IIncomeStatementReport) => {
    const data = prepareChartData(dataKey);
    if (data && data.length >= 2) {
      const latestYear = data[data.length - 1];
      const previousYear = data[data.length - 2];
      if (previousYear.value > 0) {
        const growthRate = ((latestYear.value - previousYear.value) / previousYear.value) * 100;
        return growthRate.toFixed(2);
      }
    }
    return null;
  };

  const handleAccordionChange = (value: string[]) => {
    if (value.length > 0) {
      const lastOpened = value[value.length - 1];
      setActiveChart(lastOpened);
    }
  };

  return (
    <div className="income-statement-container">
      <div className="income-statement-header">
        <Title order={2}>{symbol} - Income Statement Analysis</Title>
        <Text color="dimmed">Annual financial performance metrics</Text>
      </div>

      <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
        <Accordion
          multiple
          defaultValue={['revenue', 'grossProfit', 'operatingIncome', 'netIncome', 'ebitda']}
          onChange={handleAccordionChange}
          className="income-accordion"
        >
          <Accordion.Item value="revenue">
            <Accordion.Control icon={<IconChartBar color="#6246ea" />}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Total Revenue</span>
                {calculateGrowth('totalRevenue') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <IconTrendingUp
                      size={16}
                      color={Number(calculateGrowth('totalRevenue')) >= 0 ? '#2cb67d' : '#e53170'}
                    />
                    <Text size="sm" color={Number(calculateGrowth('totalRevenue')) >= 0 ? 'green' : 'red'}>
                      {Number(calculateGrowth('totalRevenue')) >= 0 ? '+' : ''}
                      {calculateGrowth('totalRevenue')}%
                    </Text>
                  </div>
                )}
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="chart-container revenue-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareChartData('totalRevenue')}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="value" name="Revenue" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="grossProfit">
            <Accordion.Control icon={<IconChartBar color="#2cb67d" />}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Gross Profit</span>
                {calculateGrowth('grossProfit') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <IconTrendingUp
                      size={16}
                      color={Number(calculateGrowth('grossProfit')) >= 0 ? '#2cb67d' : '#e53170'}
                    />
                    <Text size="sm" color={Number(calculateGrowth('grossProfit')) >= 0 ? 'green' : 'red'}>
                      {Number(calculateGrowth('grossProfit')) >= 0 ? '+' : ''}
                      {calculateGrowth('grossProfit')}%
                    </Text>
                  </div>
                )}
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="chart-container gross-profit-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareChartData('grossProfit')}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="value" name="Gross Profit" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="operatingIncome">
            <Accordion.Control icon={<IconChartBar color="#ff8906" />}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Operating Income</span>
                {calculateGrowth('operatingIncome') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <IconTrendingUp
                      size={16}
                      color={Number(calculateGrowth('operatingIncome')) >= 0 ? '#2cb67d' : '#e53170'}
                    />
                    <Text size="sm" color={Number(calculateGrowth('operatingIncome')) >= 0 ? 'green' : 'red'}>
                      {Number(calculateGrowth('operatingIncome')) >= 0 ? '+' : ''}
                      {calculateGrowth('operatingIncome')}%
                    </Text>
                  </div>
                )}
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="chart-container operating-income-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareChartData('operatingIncome')}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="value" name="Operating Income" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="netIncome">
            <Accordion.Control icon={<IconChartBar color="#e53170" />}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Net Income</span>
                {calculateGrowth('netIncome') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <IconTrendingUp
                      size={16}
                      color={Number(calculateGrowth('netIncome')) >= 0 ? '#2cb67d' : '#e53170'}
                    />
                    <Text size="sm" color={Number(calculateGrowth('netIncome')) >= 0 ? 'green' : 'red'}>
                      {Number(calculateGrowth('netIncome')) >= 0 ? '+' : ''}
                      {calculateGrowth('netIncome')}%
                    </Text>
                  </div>
                )}
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="chart-container net-income-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareChartData('netIncome')}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="value" name="Net Income" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="ebitda">
            <Accordion.Control icon={<IconChartBar color="#7f5af0" />}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>EBITDA</span>
                {calculateGrowth('ebitda') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <IconTrendingUp size={16} color={Number(calculateGrowth('ebitda')) >= 0 ? '#2cb67d' : '#e53170'} />
                    <Text size="sm" color={Number(calculateGrowth('ebitda')) >= 0 ? 'green' : 'red'}>
                      {Number(calculateGrowth('ebitda')) >= 0 ? '+' : ''}
                      {calculateGrowth('ebitda')}%
                    </Text>
                  </div>
                )}
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="chart-container ebitda-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareChartData('ebitda')}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="value" name="EBITDA" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </div>
  );
};

export default IncomeStatement;
