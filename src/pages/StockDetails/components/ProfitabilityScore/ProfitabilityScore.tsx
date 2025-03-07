import { useEffect, useState } from 'react';
import { Card, Text, Group, RingProgress, Skeleton, Alert, Stack, Grid, Title } from '@mantine/core';
import { useStockData } from '../../../../context/stock-data';

interface ProfitabilityMetric {
  name: string;
  value: number;
  benchmark: number;
  score: number;
  description: string;
}

export const ProfitabilityScore = () => {
  const {
    companyOverview,
    incomeStatement,
    loadingOverview,
    loadingIncomeStatement,
    errorOverview,
    errorIncomeStatement,
  } = useStockData();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profitabilityScore, setProfitabilityScore] = useState<number>(0);
  const [metrics, setMetrics] = useState<ProfitabilityMetric[]>([]);

  useEffect(() => {
    if (!loadingOverview && !loadingIncomeStatement) {
      if (errorOverview || errorIncomeStatement) {
        setError('Error loading required data for profitability analysis');
        setLoading(false);
        return;
      }

      if (!companyOverview || !incomeStatement) {
        setError('Required data for profitability analysis is missing');
        setLoading(false);
        return;
      }

      try {
        calculateProfitabilityScore();
        setLoading(false);
      } catch (e) {
        setError('Failed to calculate profitability score: ' + (e instanceof Error ? e.message : String(e)));
        setLoading(false);
      }
    }
  }, [companyOverview, incomeStatement, loadingOverview, loadingIncomeStatement]);

  const calculateProfitabilityScore = () => {
    if (
      !companyOverview ||
      !incomeStatement ||
      !incomeStatement.annualReports ||
      incomeStatement.annualReports.length === 0
    ) {
      throw new Error('Missing data required for profitability analysis');
    }

    const latestReport = incomeStatement.annualReports[0];
    const previousReport = incomeStatement.annualReports.length > 1 ? incomeStatement.annualReports[1] : null;

    // Calculate profitability metrics
    const grossMargin = (parseFloat(latestReport.grossProfit) / parseFloat(latestReport.totalRevenue)) * 100;
    const operatingMargin = (parseFloat(latestReport.operatingIncome) / parseFloat(latestReport.totalRevenue)) * 100;
    const netMargin = (parseFloat(latestReport.netIncome) / parseFloat(latestReport.totalRevenue)) * 100;

    // ROE calculation (using data from companyOverview)
    const returnOnEquity = parseFloat(companyOverview.ReturnOnEquityTTM || '0') * 100;

    // Calculate profit growth if previous data is available
    let revenueGrowth = 0;
    if (previousReport) {
      revenueGrowth =
        ((parseFloat(latestReport.totalRevenue) - parseFloat(previousReport.totalRevenue)) /
          parseFloat(previousReport.totalRevenue)) *
        100;
    }

    // Define metrics with industry benchmarks (these can be adjusted based on sector)
    const profitabilityMetrics: ProfitabilityMetric[] = [
      {
        name: 'Gross Margin',
        value: grossMargin,
        benchmark: 40,
        score: Math.min((grossMargin / 40) * 5, 5),
        description: 'Revenue left after COGS',
      },
      {
        name: 'Operating Margin',
        value: operatingMargin,
        benchmark: 15,
        score: Math.min((operatingMargin / 15) * 5, 5),
        description: 'Profit from operations',
      },
      {
        name: 'Net Margin',
        value: netMargin,
        benchmark: 10,
        score: Math.min((netMargin / 10) * 5, 5),
        description: 'Bottom-line profitability',
      },
      {
        name: 'Return on Equity',
        value: returnOnEquity,
        benchmark: 15,
        score: Math.min((returnOnEquity / 15) * 5, 5),
        description: 'Profit generated from shareholders equity',
      },
      {
        name: 'Revenue Growth',
        value: revenueGrowth,
        benchmark: 10,
        score: Math.min((revenueGrowth / 10) * 5, 5),
        description: 'Year-over-year revenue growth',
      },
    ];

    // Calculate overall profitability score (out of 100)
    const totalScore = profitabilityMetrics.reduce((sum, metric) => sum + metric.score, 0);
    const maxPossibleScore = profitabilityMetrics.length * 5;
    const overallScore = (totalScore / maxPossibleScore) * 100;

    setMetrics(profitabilityMetrics);
    setProfitabilityScore(overallScore);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'teal';
    if (score >= 40) return 'yellow';
    if (score >= 20) return 'orange';
    return 'red';
  };

  if (loading) {
    return <Skeleton height={350} />;
  }

  if (error) {
    return (
      <Alert color="red" title="Profitability Analysis Error">
        {error}
      </Alert>
    );
  }

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Title order={3} mb="md">
        Profitability Analysis
      </Title>

      <Grid>
        <Grid.Col span={4}>
          <Stack>
            <RingProgress
              size={160}
              thickness={16}
              roundCaps
              sections={[{ value: profitabilityScore, color: getScoreColor(profitabilityScore) }]}
              label={<Text size="xl">{profitabilityScore.toFixed(1)}</Text>}
            />
            <Text>Overall Profitability Score</Text>
            <Text color="dimmed" size="sm">
              Based on 5 key profitability metrics
            </Text>
          </Stack>
        </Grid.Col>

        <Grid.Col span={8}>
          <Stack>
            {metrics.map((metric, index) => (
              <Stack key={index}>
                <Group>
                  <Text>{metric.name}</Text>
                  <Group>
                    <Text>{metric.value.toFixed(2)}%</Text>
                    <Text color="dimmed" size="xs">
                      (Benchmark: {metric.benchmark}%)
                    </Text>
                  </Group>
                </Group>

                <RingProgress
                  size={24}
                  thickness={4}
                  roundCaps
                  sections={[{ value: (metric.score / 5) * 100, color: getScoreColor((metric.score / 5) * 100) }]}
                  label={<></>}
                />

                <Text color="dimmed" size="xs">
                  {metric.description}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default ProfitabilityScore;
