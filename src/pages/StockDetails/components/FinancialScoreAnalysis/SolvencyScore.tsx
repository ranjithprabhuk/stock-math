import { useEffect, useState } from 'react';
import {
  Card,
  Text,
  Group,
  RingProgress,
  Skeleton,
  Alert,
  Stack,
  Grid,
  Progress,
  Title,
  Paper,
  Tooltip,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useStockData } from '../../../../context/stock-data';
import './FinancialScoreAnalysis.css';

interface SolvencyMetric {
  name: string;
  value: number;
  benchmark: number;
  score: number;
  description: string;
  goodDirection: 'high' | 'low'; // Indicates whether higher or lower values are better
}

interface ZScoreResult {
  score: number;
  interpretation: string;
  color: string;
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
  const [zScore, setZScore] = useState<ZScoreResult | null>(null);

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
      incomeStatement.annualReports.length === 0 ||
      !companyOverview
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

    // Calculate Altman Z-Score
    // Z-Score = 1.2×X₁ + 1.4×X₂ + 3.3×X₃ + 0.6×X₄ + 1.0×X₅
    const workingCapital =
      parseFloat(latestBalance.totalCurrentAssets) - parseFloat(latestBalance.totalCurrentLiabilities);
    const retainedEarnings = parseFloat(latestBalance.retainedEarnings);
    const totalRevenue = parseFloat(latestIncome.totalRevenue);
    const marketCap = parseFloat(companyOverview.MarketCapitalization);

    // Calculate the Z-Score components
    const x1 = workingCapital / totalAssets; // Working Capital / Total Assets
    const x2 = retainedEarnings / totalAssets; // Retained Earnings / Total Assets
    const x3 = ebit / totalAssets; // EBIT / Total Assets
    const x4 = marketCap / totalLiabilities; // Market Value of Equity / Total Liabilities
    const x5 = totalRevenue / totalAssets; // Sales / Total Assets

    // Calculate the Z-Score
    const zScoreValue = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5;

    // Interpret the Z-Score
    let zScoreInterpretation = '';
    let zScoreColor = '';

    if (zScoreValue > 2.99) {
      zScoreInterpretation = 'Safe Zone - Low probability of financial distress';
      zScoreColor = 'green';
    } else if (zScoreValue >= 1.81 && zScoreValue <= 2.99) {
      zScoreInterpretation = 'Grey Zone - Moderate risk of financial distress';
      zScoreColor = 'yellow';
    } else {
      zScoreInterpretation = 'Distress Zone - High risk of financial distress';
      zScoreColor = 'red';
    }

    setZScore({
      score: zScoreValue,
      interpretation: zScoreInterpretation,
      color: zScoreColor,
    });

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

  const getDirectionArrow = (metric: SolvencyMetric): string => {
    return metric.goodDirection === 'high' ? '↑' : '↓';
  };

  if (loading) {
    return <Skeleton height={350} radius="md" animate />;
  }

  if (error) {
    return (
      <Alert color="red" title="Solvency Analysis Error" radius="md">
        {error}
      </Alert>
    );
  }

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder className="scoreCard">
      <Title order={3} mb="lg" className="cardTitle">
        Solvency Analysis
      </Title>

      <Grid>
        <Grid.Col span={4}>
          <Stack>
            <Paper p="md" radius="md" className="ringContainer">
              <Stack align="center" gap="xs">
                <RingProgress
                  size={180}
                  thickness={18}
                  roundCaps
                  sections={[{ value: solvencyScore, color: getScoreColor(solvencyScore) }]}
                  label={
                    <Stack gap={0} align="center">
                      <Text size="xl" fw={700} className="scoreValue">
                        {solvencyScore.toFixed(1)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        out of 100
                      </Text>
                    </Stack>
                  }
                  className="scoreRing"
                />
                <Text fw={600} mt="md">
                  Overall Solvency Score
                </Text>
                <Text color="dimmed" size="sm" ta="center">
                  Based on 5 key financial stability metrics
                </Text>
              </Stack>
            </Paper>

            {zScore && (
              <Paper p="md" radius="md" className="zScoreContainer">
                <Stack gap="sm">
                  <Group>
                    <Group gap="xs">
                      <Text fw={600}>Altman Z-Score</Text>
                      <Tooltip
                        label="The Altman Z-Score predicts bankruptcy probability. >2.99: Safe, 1.81-2.99: Grey Zone, <1.81: Distress Zone"
                        position="top"
                        withArrow
                      >
                        <IconInfoCircle size={16} style={{ cursor: 'pointer' }} />
                      </Tooltip>
                    </Group>
                    <Text fw={700} className={`zScoreValue ${zScore.color}`}>
                      {zScore.score.toFixed(2)}
                    </Text>
                  </Group>

                  <Paper
                    p="xs"
                    radius="sm"
                    bg={
                      zScore.color === 'green'
                        ? 'rgba(0,128,0,0.1)'
                        : zScore.color === 'yellow'
                        ? 'rgba(255,255,0,0.1)'
                        : 'rgba(255,0,0,0.1)'
                    }
                  >
                    <Text size="sm" ta="center" color={zScore.color === 'yellow' ? 'dark' : zScore.color}>
                      {zScore.interpretation}
                    </Text>
                  </Paper>

                  <Text color="dimmed" size="xs">
                    Based on Altman's model: combines working capital, retained earnings, EBIT, market value, and sales
                    relative to assets and liabilities.
                  </Text>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={8}>
          <Stack gap="lg" className="metricsContainer">
            {metrics.map((metric, index) => (
              <Paper key={index} p="md" radius="md" className="metricItem">
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <Text fw={600}>{metric.name}</Text>
                    <Text size="xs" span className="directionIndicator">
                      {getDirectionArrow(metric)}{' '}
                      {metric.goodDirection === 'high' ? 'Higher is better' : 'Lower is better'}
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Text fw={700} className={`metricValue ${getMetricColor(metric)}`}>
                      {metric.value.toFixed(2)}
                    </Text>
                    <Text color="dimmed" size="xs">
                      vs {metric.benchmark} {metric.goodDirection === 'high' ? 'target' : 'max'}
                    </Text>
                  </Group>
                </Group>

                <Progress
                  value={(metric.score / 5) * 100}
                  color={getMetricColor(metric)}
                  size="lg"
                  radius="xl"
                  striped={metric.score / 5 < 0.4}
                  animated={metric.score / 5 < 0.4}
                />

                <Text color="dimmed" size="xs" mt="xs">
                  {metric.description}
                </Text>
              </Paper>
            ))}
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default SolvencyScore;
