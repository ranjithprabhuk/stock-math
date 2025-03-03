// pages/StockDetails/StockDetails.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Title, Paper, LoadingOverlay, Accordion, Text } from '@mantine/core';
import CompanyOverview from './components/CompanyOverview/CompanyOverview';
import IncomeStatement from './components/IncomeStatement/IncomeStatement';
import BalanceSheet from './components/BalanceSheet/BalanceSheet';
import CashFlow from './components/CashFlow/CashFlow';
import EPS from './components/EPS/EPS';

const StockDetails = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [loading, setLoading] = useState(false);

  if (!symbol) {
    return <div>No stock symbol provided</div>;
  }

  return (
    <Paper p="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <Title order={2} mb="md">
        {symbol} Stock Analysis
      </Title>

      <Accordion multiple>
        <Accordion.Item value="overview">
          <Accordion.Control>
            <Text>Company Overview</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <CompanyOverview symbol={symbol} />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="income">
          <Accordion.Control>
            <Text>Income Statement</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <IncomeStatement symbol={symbol} />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="balance">
          <Accordion.Control>
            <Text>Balance Sheet</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <BalanceSheet symbol={symbol} />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="cashflow">
          <Accordion.Control>
            <Text>Cash Flow</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <CashFlow symbol={symbol} />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="eps">
          <Accordion.Control>
            <Text>EPS</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <EPS symbol={symbol} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
};

export default StockDetails;
