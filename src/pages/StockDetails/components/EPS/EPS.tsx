// pages/StockDetails/components/EPS/EPS.tsx
import { useEffect, useState } from 'react';
import { Alert, Card, Loader, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { IEarnings } from '../../../../interfaces/IEarnings';
import AlphaVantageApiService from '../../../../services/alpha-vantage-service';

interface IEPSProps {
  symbol: string;
}

const EPS: React.FC<IEPSProps> = ({ symbol }) => {
  const [earningsData, setEarningsData] = useState<IEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await AlphaVantageApiService.getEarnings(symbol);

        if (!data || !data.annualEarnings || data.annualEarnings.length === 0) {
          setError('No earnings data available');
        } else {
          setEarningsData(data);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load earnings data');
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

  // Prepare annual EPS data
  const annualEpsData = earningsData?.annualEarnings
    .map((item) => ({
      year: item.fiscalDateEnding.substring(0, 4),
      eps: parseFloat(item.reportedEPS),
    }))
    .reverse() // Show oldest to newest
    .slice(-10); // Last 10 years only

  // Prepare quarterly EPS data
  const quarterlyEpsData = earningsData?.quarterlyEarnings
    .map((item) => ({
      quarter: `${item.fiscalDateEnding.substring(0, 4)} Q${Math.ceil(new Date(item.fiscalDateEnding).getMonth() / 3)}`,
      reported: parseFloat(item.reportedEPS),
      estimated: parseFloat(item.estimatedEPS) || null,
      surprise: parseFloat(item.surprise) || 0,
    }))
    .reverse() // Show oldest to newest
    .slice(-12); // Last 12 quarters only

  return (
    <div>
      <Title order={3} mb="md">
        {symbol} Earnings Per Share
      </Title>

      <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
        <Title order={4} mb="md">
          Annual EPS Trend
        </Title>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={annualEpsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
            <Bar dataKey="eps" name="Annual EPS" fill="#8884d8" />
            <Line dataKey="eps" name="EPS Trend" stroke="#ff7300" type="monotone" strokeWidth={3} dot={{ r: 5 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          Quarterly EPS vs Estimates
        </Title>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={quarterlyEpsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" tick={{ textAnchor: 'end' }} height={60} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
            <Bar yAxisId="left" dataKey="reported" name="Reported EPS" fill="#82ca9d" />
            <Bar yAxisId="left" dataKey="estimated" name="Estimated EPS" fill="#8884d8" />
            <Line
              yAxisId="right"
              dataKey="surprise"
              name="EPS Surprise"
              stroke="#ff7300"
              type="monotone"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default EPS;
