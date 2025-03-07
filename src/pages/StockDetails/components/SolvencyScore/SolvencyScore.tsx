import { useEffect, useState } from 'react';
import { Card, Text, Group, RingProgress, Skeleton, Alert, Stack, Grid, Progress, Title } from '@mantine/core';
import { useStockData } from '../../../../context/stock-data';

interface SolvencyMetric {
  name: string;
  value: number;
  benchmark: number;
  score: number;
  description: string;
  goodDirection: 'high' | 'low'; // Indicates whether higher or lower values are better
}

export const SolvencyScore = () => {
  const {
    companyOverview,
    balanceSheet,
    incomeStatement,
    loadingOverview,
    loadingBalanceSheet,
    loadingIncomeStatement,
    errorOverview,
    errorBalanceSheet,
    errorIncomeStatement,
  } = useStockData();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solvencyScore, setSolvencyScore] = useState<number>(0);
  const [metrics, setMetrics] = useState<SolvencyMetric[]>([]);

  useEffect(() => {
    if (!loadingOverview && !loadingBalanceSheet && !loadingIncomeStatement) {
      if (errorOverview || errorBalanceSheet || errorIncomeStatement) {
        setError('Error loading required data for solvency analysis');
        setLoading(false);
        return;
      }

      if (!companyOverview || !balanceSheet || !incomeStatement) {
        setError('Required data for solvency analysis is missing');
        setLoading(false);
        return;
      }

      try {
        calculateSolvencyScore();
        setLoading(false);
      } catch (e) {
        setError('Failed to calculate solvency score: ' + (e instanceof Error ? e.message : String(e)));
        setLoading(false);
      }
    }
  }, [companyOverview, balanceSheet, incomeStatement, loadingOverview, loadingBalanceSheet, loadingIncomeStatement]);

  const calculateSolvencyScore = () => {
    if (
      !balanceSheet ||
      !balanceSheet.annualReports ||
      balanceSheet.annualReports.length === 0 ||
      !incomeStatement ||
      !incomeStatement.annualReports ||
      incomeStatement.annualReports.length === 0
    ) {
      throw new Error('Missing data required for solvency analysis');
    }

    const latestBalance = balanceSheet.annualReports[0];
    const latestIncome = incomeStatement.annualReports[0];

    // Calculate solvency metrics
    const currentRatio =
      parseFloat(latestBalance.totalCurrentAssets) / parseFloat(latestBalance.totalCurrentLiabilities);
    const quickRatio =
      (parseFloat(latestBalance.totalCurrentAssets) - parseFloat(latestBalance.inventory || '0')) /
      parseFloat(latestBalance.totalCurrentLiabilities);

    const totalAssets = parseFloat(latestBalance.totalAssets);
    const totalLiabilities = parseFloat(latestBalance.totalLiabilities);
    const debtToAssets = totalLiabilities / totalAssets;

    const longTermDebt = parseFloat(latestBalance.longTermDebt || '0');
    const shortTermDebt = parseFloat(latestBalance.shortTermDebt || '0');
    const totalEquity = parseFloat(latestBalance.totalShareholderEquity);
    const debtToEquity = (longTermDebt + shortTermDebt) / totalEquity;

    const ebit = parseFloat(latestIncome.ebit || latestIncome.operatingIncome);
    const interestExpense = parseFloat(latestIncome.interestExpense || '0');
    // Handle potential division by zero
    const interestCoverageRatio = interestExpense !== 0 ? Math.abs(ebit / interestExpense) : 10;

    // Define metrics with industry benchmarks
    const solvencyMetrics: SolvencyMetric[] = [
      {
        name: 'Current Ratio',
        value: currentRatio,
        benchmark: 2,
        score: Math.min((currentRatio / 2) * 5, 5),
        description: 'Current Assets / Current Liabilities',
        goodDirection: 'high',
      },
      {
        name: 'Quick Ratio',
        value: quickRatio,
        benchmark: 1,
        score: Math.min((quickRatio / 1) * 5, 5),
        description: '(Current Assets - Inventory) / Current Liabilities',
        goodDirection: 'high',
      },
      {
        name: 'Debt to Assets',
        value: debtToAssets,
        benchmark: 0.5,
        score: debtToAssets <= 0.5 ? 5 - (debtToAssets / 0.5) * 5 : 0,
        description: 'Total Liabilities / Total Assets',
        goodDirection: 'low',
      },
      {
        name: 'Debt to Equity',
        value: debtToEquity,
        benchmark: 1,
        score: debtToEquity <= 1 ? 5 - (debtToEquity / 1) * 5 : 0,
        description: 'Total Debt / Shareholder Equity',
        goodDirection: 'low',
      },
      {
        name: 'Interest Coverage',
        value: interestCoverageRatio,
        benchmark: 3,
        score: Math.min((interestCoverageRatio / 3) * 5, 5),
        description: 'EBIT / Interest Expense',
        goodDirection: 'high',
      },
    ];

    // Calculate overall solvency score (out of 100)
    const totalScore = solvencyMetrics.reduce((sum, metric) => sum + metric.score, 0);
    const maxPossibleScore = solvencyMetrics.length * 5;
    const overallScore = (totalScore / maxPossibleScore) * 100;

    setMetrics(solvencyMetrics);
    setSolvencyScore(overallScore);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'teal';
    if (score >= 40) return 'yellow';
    if (score >= 20) return 'orange';
    return 'red';
  };

  const getMetricColor = (metric: SolvencyMetric): string => {
    const percentOfBenchmark =
      metric.goodDirection === 'high' ? metric.value / metric.benchmark : metric.benchmark / metric.value;

    const normalizedValue = Math.min(percentOfBenchmark, 2);

    if (normalizedValue >= 1.5) return 'green';
    if (normalizedValue >= 1.0) return 'teal';
    if (normalizedValue >= 0.8) return 'yellow';
    if (normalizedValue >= 0.5) return 'orange';
    return 'red';
  };

  if (loading) {
    return <Skeleton height={350} />;
  }

  if (error) {
    return (
      <Alert color="red" title="Solvency Analysis Error">
        {error}
      </Alert>
    );
  }

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Title order={3} mb="md">
        Solvency Analysis
      </Title>

      <Grid>
        <Grid.Col span={4}>
          <Stack align="center">
            <RingProgress
              size={160}
              thickness={16}
              roundCaps
              sections={[{ value: solvencyScore, color: getScoreColor(solvencyScore) }]}
              label={<Text size="xl">{solvencyScore.toFixed(1)}</Text>}
            />
            <Text>Overall Solvency Score</Text>
            <Text color="dimmed" size="sm">
              Based on 5 key solvency metrics
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
                    <Text>{metric.value.toFixed(2)}</Text>
                    <Text color="dimmed" size="xs">
                      (Benchmark: {metric.benchmark} {metric.goodDirection === 'high' ? 'or higher' : 'or lower'})
                    </Text>
                  </Group>
                </Group>

                <Progress value={(metric.score / 5) * 100} color={getMetricColor(metric)} size="md" radius="xs" />

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

export default SolvencyScore;
