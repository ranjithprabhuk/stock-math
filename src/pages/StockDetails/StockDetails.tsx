// pages/StockDetails/StockDetails.tsx
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Title, Paper, LoadingOverlay, Accordion, Text, Notification } from '@mantine/core';
import { Icon12Hours } from '@tabler/icons-react';
import CompanyOverview from './components/CompanyOverview/CompanyOverview';
import IncomeStatement from './components/IncomeStatement/IncomeStatement';
import BalanceSheet from './components/BalanceSheet/BalanceSheet';
import CashFlow from './components/CashFlow/CashFlow';
import EPS from './components/EPS/EPS';
import { useStockData } from '../../context/stock-data';
import StockAnalysisDashboard from './components/StockAnalysisDashboard/StockAnalysisDashboard';

const StockDetails = () => {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol');
  const { fetchAllData, resetAllData } = useStockData();

  useEffect(() => {
    if (symbol) {
      fetchAllData(symbol);
    }

    return () => {
      resetAllData();
    };
  }, [symbol]);

  if (!symbol) {
    return (
      <Notification icon={'i'} color={'blue'} title={'No Symbol found'} withCloseButton={false}>
        please go to the <Link to="/"> Home page </Link> and search for the stock again
      </Notification>
    );
  }

  return (
    <Paper p="md" style={{ position: 'relative' }}>
      {/* <LoadingOverlay visible={loading} /> */}
      <Title order={2} mb="md">
        {symbol} Stock Analysis
      </Title>

      <StockAnalysisDashboard />

      <Accordion multiple defaultValue={['overview', 'income', 'balance', 'cashflow', 'eps']}>
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
