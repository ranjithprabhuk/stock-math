// pages/StockDetails/components/IncomeStatement/IncomeStatement.tsx
import { useEffect, useState } from 'react';
import { Accordion, Alert, Loader, Text, Title, Card } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IIncomeStatement, IIncomeStatementReport } from '../../../../interfaces/IIncomeStatement';
import AlphaVantageApiService from '../../../../services/alpha-vantage-service';

interface IIncomeStatementProps {
  symbol: string;
}

const IncomeStatement: React.FC<IIncomeStatementProps> = ({ symbol }) => {
  const [incomeData, setIncomeData] = useState<IIncomeStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await AlphaVantageApiService.getIncomeStatement(symbol);

        if (!data || !data.annualReports || data.annualReports.length === 0) {
          setError('No income statement data available');
        } else {
          setIncomeData(data);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load income statement data');
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

  // Prepare data for charts
  const prepareChartData = (dataKey: keyof IIncomeStatementReport) => {
    return incomeData?.annualReports
      .map((report) => ({
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

  return (
    <div>
      <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
        <Accordion multiple defaultValue={['revenue']}>
          <Accordion.Item value="revenue">
            <Accordion.Control>Total Revenue</Accordion.Control>
            <Accordion.Panel>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData('totalRevenue')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="value" name="Revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="grossProfit">
            <Accordion.Control>Gross Profit</Accordion.Control>
            <Accordion.Panel>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData('grossProfit')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="value" name="Gross Profit" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="operatingIncome">
            <Accordion.Control>Operating Income</Accordion.Control>
            <Accordion.Panel>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData('operatingIncome')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="value" name="Operating Income" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="netIncome">
            <Accordion.Control>Net Income</Accordion.Control>
            <Accordion.Panel>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData('netIncome')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="value" name="Net Income" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="ebitda">
            <Accordion.Control>EBITDA</Accordion.Control>
            <Accordion.Panel>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData('ebitda')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="value" name="EBITDA" fill="#8dd1e1" />
                </BarChart>
              </ResponsiveContainer>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </div>
  );
};

export default IncomeStatement;
