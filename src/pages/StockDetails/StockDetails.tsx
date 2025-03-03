import React from 'react';
import { useParams } from 'react-router-dom';
import { Title, Paper, Text } from '@mantine/core';
import './StockDetails.css';

const StockDetails: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();

  return (
    <div className="stock-details-container">
      <Title order={1}>{symbol} Stock Analysis</Title>
      <Paper shadow="xs" className="details-paper">
        <div className="details-section">
          <Title order={3}>Overview</Title>
          <Text>Detailed analysis for {symbol} will be displayed here.</Text>
        </div>

        <div className="details-section">
          <Title order={3}>Performance</Title>
          <Text>This page will include charts, key metrics, and performance indicators.</Text>
        </div>
      </Paper>
    </div>
  );
};

export default StockDetails;
