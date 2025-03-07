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
import { useStockData } from '../../../../context/stock-data';
import './EPS.css'; // Import the CSS file

interface IEPSProps {
  symbol: string;
}

const EPS: React.FC<IEPSProps> = ({ symbol }) => {
  const { eps: earningsData, errorEPS: error, loadingEPS: loading } = useStockData();

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

  if (!earningsData) {
    return <Text>No data available</Text>;
  }

  // Prepare annual EPS data
  const annualEpsData = earningsData?.annualEarnings
    ?.map((item) => ({
      year: item.fiscalDateEnding.substring(0, 4),
      eps: parseFloat(item.reportedEPS),
    }))
    .reverse() // Show oldest to newest
    .slice(-10); // Last 10 years only

  // Prepare quarterly EPS data
  const quarterlyEpsData = earningsData?.quarterlyEarnings
    ?.map((item) => ({
      quarter: `${item.fiscalDateEnding.substring(0, 4)} Q${Math.ceil(new Date(item.fiscalDateEnding).getMonth() / 3)}`,
      reported: parseFloat(item.reportedEPS),
      estimated: parseFloat(item.estimatedEPS) || null,
      surprise: parseFloat(item.surprise) || 0,
    }))
    .reverse() // Show oldest to newest
    .slice(-12); // Last 12 quarters only

  return (
    <div className="eps-container">
      <Title order={3} className="eps-title">
        {symbol} Earnings Per Share
      </Title>

      <Card shadow="sm" p="lg" radius="md" withBorder className="eps-card">
        <div className="card-header annual-header">
          <Title order={4}>Annual EPS Trend</Title>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={annualEpsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="eps" name="Annual EPS" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Line
                dataKey="eps"
                name="EPS Trend"
                stroke="#ff7300"
                type="monotone"
                strokeWidth={3}
                dot={{ r: 5, fill: '#ff7300', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 8, stroke: '#ff7300', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card shadow="sm" p="lg" radius="md" withBorder className="eps-card">
        <div className="card-header quarterly-header">
          <Title order={4}>Quarterly EPS vs Estimates</Title>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={quarterlyEpsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" tick={{ textAnchor: 'end' }} height={70} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar yAxisId="left" dataKey="reported" name="Reported EPS" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="estimated" name="Estimated EPS" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                dataKey="surprise"
                name="EPS Surprise"
                stroke="#ff7300"
                type="monotone"
                strokeWidth={2}
                dot={{ r: 4, fill: '#ff7300', stroke: '#fff', strokeWidth: 1 }}
                activeDot={{ r: 7, stroke: '#ff7300', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default EPS;
