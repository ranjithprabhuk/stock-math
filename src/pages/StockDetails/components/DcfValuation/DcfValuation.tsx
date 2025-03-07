import { useState, useEffect } from 'react';
import { Card, Text, Group, Badge, RingProgress, Skeleton, Alert, Stack, Title } from '@mantine/core';
import { useStockData } from '../../../../context/stock-data';

// DCF calculation constants
const DISCOUNT_RATES = {
  bestCase: 0.07, // 7%
  normalCase: 0.09, // 9%
  worstCase: 0.12, // 12%
};

const GROWTH_RATES = {
  bestCase: 0.15, // 15%
  normalCase: 0.1, // 10%
  worstCase: 0.05, // 5%
};

const TERMINAL_GROWTH_RATES = {
  bestCase: 0.03, // 3%
  normalCase: 0.025, // 2.5%
  worstCase: 0.02, // 2%
};

export interface ValuationResult {
  intrinsicValue: number;
  marketPrice: number;
  undervalued: boolean;
  valuationGap: number;
}

export const DCFValuation = () => {
  const {
    companyOverview,
    incomeStatement,
    cashFlow,
    loadingOverview,
    loadingIncomeStatement,
    loadingCashFlow,
    errorOverview,
    errorIncomeStatement,
    errorCashFlow,
  } = useStockData();

  const [bestCaseValuation, setBestCaseValuation] = useState<ValuationResult | null>(null);
  const [normalCaseValuation, setNormalCaseValuation] = useState<ValuationResult | null>(null);
  const [worstCaseValuation, setWorstCaseValuation] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if data is available
    if (!loadingOverview && !loadingIncomeStatement && !loadingCashFlow) {
      if (errorOverview || errorIncomeStatement || errorCashFlow) {
        setError('Error loading required data for DCF valuation');
        setLoading(false);
        return;
      }

      if (!companyOverview || !incomeStatement || !cashFlow) {
        setError('Required data for DCF valuation is missing');
        setLoading(false);
        return;
      }

      if (!companyOverview) {
        throw new Error('Company overview data is missing');
      }

      try {
        // Calculate DCF for all scenarios
        const marketPrice = parseFloat(companyOverview.price || '0');

        const bestCase = calculateDCF('bestCase', marketPrice);
        const normalCase = calculateDCF('normalCase', marketPrice);
        const worstCase = calculateDCF('worstCase', marketPrice);

        setBestCaseValuation(bestCase);
        setNormalCaseValuation(normalCase);
        setWorstCaseValuation(worstCase);
        setLoading(false);
      } catch (e) {
        setError('Failed to calculate DCF valuation: ' + (e instanceof Error ? e.message : String(e)));
        setLoading(false);
      }
    }
  }, [companyOverview, incomeStatement, cashFlow, loadingOverview, loadingIncomeStatement, loadingCashFlow]);

  const calculateDCF = (scenario: 'bestCase' | 'normalCase' | 'worstCase', marketPrice: number): ValuationResult => {
    // Get the last reported free cash flow
    if (!cashFlow || !cashFlow.annualReports || cashFlow.annualReports.length === 0) {
      throw new Error('Cash flow data is missing or incomplete');
    }

    const lastYearCashFlow = cashFlow.annualReports[0];
    const freeCashFlow =
      parseFloat(lastYearCashFlow.operatingCashflow) - parseFloat(lastYearCashFlow.capitalExpenditures);

    // Get company info
    if (!companyOverview) {
      throw new Error('Company overview data is missing');
    }

    const sharesOutstanding = parseFloat(companyOverview.SharesOutstanding || '0');

    // Get discount rate, growth rate and terminal growth rate based on scenario
    const discountRate = DISCOUNT_RATES[scenario];
    const growthRate = GROWTH_RATES[scenario];
    const terminalGrowthRate = TERMINAL_GROWTH_RATES[scenario];

    // Project cash flows for 5 years
    let projectedCashFlows: number[] = [];
    let currentFCF = freeCashFlow;

    for (let year = 1; year <= 5; year++) {
      currentFCF *= 1 + growthRate;
      const discountFactor = Math.pow(1 + discountRate, year);
      projectedCashFlows.push(currentFCF / discountFactor);
    }

    // Calculate terminal value
    const terminalValue = (currentFCF * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
    const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, 5);

    // Calculate enterprise value
    const enterpriseValue = projectedCashFlows.reduce((sum, val) => sum + val, 0) + discountedTerminalValue;

    // Calculate equity value (simplifying by not adjusting for debt and cash)
    const equityValue = enterpriseValue;

    // Calculate intrinsic value per share
    const intrinsicValue = equityValue / sharesOutstanding;

    // Determine if undervalued and by how much
    const undervalued = intrinsicValue > marketPrice;
    const valuationGap = ((intrinsicValue - marketPrice) / marketPrice) * 100;

    return {
      intrinsicValue,
      marketPrice,
      undervalued,
      valuationGap,
    };
  };

  if (loading) {
    return <Skeleton height={350} />;
  }

  if (error) {
    return (
      <Alert color="red" title="Valuation Error">
        {error}
      </Alert>
    );
  }

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Title order={3} mb="md">
        DCF Valuation Analysis
      </Title>

      {normalCaseValuation && (
        <Stack>
          <Group>
            <Stack>
              <Text>Current Market Price</Text>
              <Text size="xl">${normalCaseValuation.marketPrice.toFixed(2)}</Text>
            </Stack>

            <RingProgress
              size={120}
              thickness={12}
              sections={[
                {
                  value: Math.min(Math.abs(normalCaseValuation.valuationGap), 100),
                  color: normalCaseValuation.undervalued ? 'green' : 'red',
                },
              ]}
              label={
                <Text color={normalCaseValuation.undervalued ? 'green' : 'red'} size="xl">
                  {normalCaseValuation.valuationGap > 0 ? '+' : ''}
                  {normalCaseValuation.valuationGap.toFixed(1)}%
                </Text>
              }
            />
          </Group>

          <Badge size="lg" color={normalCaseValuation.undervalued ? 'green' : 'red'} fullWidth>
            {normalCaseValuation.undervalued ? 'UNDERVALUED' : 'OVERVALUED'}
          </Badge>

          <Group grow>
            <Card withBorder p="sm">
              <Text size="sm" color="dimmed">
                Worst Case
              </Text>
              <Text size="lg">${worstCaseValuation?.intrinsicValue.toFixed(2) || 'N/A'}</Text>
            </Card>

            <Card withBorder p="sm">
              <Text size="sm" color="dimmed">
                Normal Case
              </Text>
              <Text size="lg" color={normalCaseValuation.undervalued ? 'green' : 'red'}>
                ${normalCaseValuation.intrinsicValue.toFixed(2)}
              </Text>
            </Card>

            <Card withBorder p="sm">
              <Text size="sm" color="dimmed">
                Best Case
              </Text>
              <Text size="lg">${bestCaseValuation?.intrinsicValue.toFixed(2) || 'N/A'}</Text>
            </Card>
          </Group>

          <Text size="sm" color="dimmed">
            This DCF valuation accounts for projected free cash flows with {GROWTH_RATES.normalCase * 100}% growth
            (normal case), discounted at {DISCOUNT_RATES.normalCase * 100}% with a terminal growth rate of
            {TERMINAL_GROWTH_RATES.normalCase * 100}%.
          </Text>
        </Stack>
      )}
    </Card>
  );
};

export default DCFValuation;
