import { useEffect, useState } from 'react';
import {
  Card,
  Text,
  Group,
  Skeleton,
  Alert,
  Stack,
  Progress,
  Badge,
  Grid,
  Title,
  rem,
  RingProgress,
} from '@mantine/core';
import { useStockData } from '../../../../context/stock-data';
import './EconomicMoat.css';

interface MoatMetric {
  name: string;
  score: number;
  description: string;
  details: string;
}

export type MoatRating = 'Wide' | 'Moderate' | 'Narrow' | 'None';

export const EconomicMoat = () => {
  const {
    companyOverview,
    incomeStatement,
    balanceSheet,
    eps,
    loadingOverview,
    loadingIncomeStatement,
    loadingBalanceSheet,
    loadingEPS,
    errorOverview,
    errorIncomeStatement,
    errorBalanceSheet,
    errorEPS,
  } = useStockData();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moatScore, setMoatScore] = useState<number>(0);
  const [moatRating, setMoatRating] = useState<MoatRating>('None');
  const [metrics, setMetrics] = useState<MoatMetric[]>([]);

  useEffect(() => {
    if (!loadingOverview && !loadingIncomeStatement && !loadingBalanceSheet && !loadingEPS) {
      if (errorOverview || errorIncomeStatement || errorBalanceSheet || errorEPS) {
        setError('Error loading required data for economic moat analysis');
        setLoading(false);
        return;
      }

      if (!companyOverview || !incomeStatement || !balanceSheet || !eps) {
        setError('Required data for economic moat analysis is missing');
        setLoading(false);
        return;
      }

      try {
        analyzeEconomicMoat();
        setLoading(false);
      } catch (e) {
        setError('Failed to analyze economic moat: ' + (e instanceof Error ? e.message : String(e)));
        setLoading(false);
      }
    }
  }, [
    companyOverview,
    incomeStatement,
    balanceSheet,
    eps,
    loadingOverview,
    loadingIncomeStatement,
    loadingBalanceSheet,
    loadingEPS,
  ]);

  const analyzeEconomicMoat = () => {
    if (
      !companyOverview ||
      !incomeStatement ||
      !incomeStatement.annualReports ||
      incomeStatement.annualReports.length < 3 ||
      !balanceSheet ||
      !balanceSheet.annualReports ||
      !eps ||
      !eps.annualEarnings ||
      eps.annualEarnings.length < 3
    ) {
      throw new Error('Insufficient historical data for economic moat analysis');
    }

    // Calculate moat metrics

    // 1. Consistency in Profitability
    const recentROEs: number[] = [];
    const recentROAs: number[] = [];

    for (let i = 0; i < 3 && i < incomeStatement.annualReports.length; i++) {
      if (i < balanceSheet.annualReports.length) {
        const incomeReport = incomeStatement.annualReports[i];
        const balanceReport = balanceSheet.annualReports[i];

        const netIncome = parseFloat(incomeReport.netIncome);
        const totalAssets = parseFloat(balanceReport.totalAssets);
        const totalEquity = parseFloat(balanceReport.totalShareholderEquity);

        recentROEs.push((netIncome / totalEquity) * 100);
        recentROAs.push((netIncome / totalAssets) * 100);
      }
    }

    const avgROE = recentROEs.reduce((sum, val) => sum + val, 0) / recentROEs.length;
    const roe15PlusYears = avgROE > 15 ? 3 : avgROE > 12 ? 2 : avgROE > 10 ? 1 : 0;

    const avgROA = recentROAs.reduce((sum, val) => sum + val, 0) / recentROAs.length;
    const roaConsistency = avgROA > 8 ? 3 : avgROA > 5 ? 2 : avgROA > 3 ? 1 : 0;

    // 2. Earnings Growth Consistency
    const earningsGrowth: number[] = [];
    for (let i = 1; i < eps.annualEarnings.length; i++) {
      const currentEPS = parseFloat(eps.annualEarnings[i - 1].reportedEPS);
      const previousEPS = parseFloat(eps.annualEarnings[i].reportedEPS);

      if (previousEPS !== 0) {
        earningsGrowth.push(((currentEPS - previousEPS) / Math.abs(previousEPS)) * 100);
      }
    }

    const avgEarningsGrowth = earningsGrowth.reduce((sum, val) => sum + val, 0) / earningsGrowth.length;
    const earningsConsistency = avgEarningsGrowth > 15 ? 3 : avgEarningsGrowth > 10 ? 2 : avgEarningsGrowth > 5 ? 1 : 0;

    // 3. Gross Margin
    const latestIncome = incomeStatement.annualReports[0];
    const grossMargin = (parseFloat(latestIncome.grossProfit) / parseFloat(latestIncome.totalRevenue)) * 100;
    const grossMarginStrength = grossMargin > 40 ? 3 : grossMargin > 30 ? 2 : grossMargin > 20 ? 1 : 0;

    // 4. Capital Efficiency
    const latestBalance = balanceSheet.annualReports[0];
    const totalAssets = parseFloat(latestBalance.totalAssets);
    const totalRevenue = parseFloat(latestIncome.totalRevenue);
    const assetTurnover = totalRevenue / totalAssets;
    const capitalEfficiency = assetTurnover > 1.2 ? 3 : assetTurnover > 0.8 ? 2 : assetTurnover > 0.5 ? 1 : 0;

    // 5. Market Position (using market cap as a proxy)
    const marketCap = parseFloat(companyOverview.MarketCapitalization || '0');
    const marketPosition = marketCap > 100000000000 ? 3 : marketCap > 10000000000 ? 2 : marketCap > 1000000000 ? 1 : 0;

    // Define metrics
    const moatMetrics: MoatMetric[] = [
      {
        name: 'Return on Equity',
        score: roe15PlusYears,
        description: 'Consistent high returns on equity',
        details: `Avg ROE: ${avgROE.toFixed(2)}% over last 3 years`,
      },
      {
        name: 'Return on Assets',
        score: roaConsistency,
        description: 'Efficient use of assets',
        details: `Avg ROA: ${avgROA.toFixed(2)}% over last 3 years`,
      },
      {
        name: 'Earnings Growth',
        score: earningsConsistency,
        description: 'Consistent growth in earnings',
        details: `Avg growth: ${avgEarningsGrowth.toFixed(2)}% over available periods`,
      },
      {
        name: 'Gross Margin',
        score: grossMarginStrength,
        description: 'Pricing power and cost advantages',
        details: `Current gross margin: ${grossMargin.toFixed(2)}%`,
      },
      {
        name: 'Capital Efficiency',
        score: capitalEfficiency,
        description: 'Efficient use of capital',
        details: `Asset turnover: ${assetTurnover.toFixed(2)}x`,
      },
      {
        name: 'Market Position',
        score: marketPosition,
        description: 'Size and scale advantages',
        details: `Market cap: $${(marketCap / 1000000000).toFixed(2)} billion`,
      },
    ];

    // Calculate overall moat score (out of 100)
    const totalScore = moatMetrics.reduce((sum, metric) => sum + metric.score, 0);
    const maxPossibleScore = moatMetrics.length * 3; // Each metric has max score of 3
    const overallScore = (totalScore / maxPossibleScore) * 100;

    // Determine moat rating
    const moatRating: MoatRating =
      overallScore >= 75 ? 'Wide' : overallScore >= 50 ? 'Moderate' : overallScore >= 25 ? 'Narrow' : 'None';

    setMetrics(moatMetrics);
    setMoatScore(overallScore);
    setMoatRating(moatRating);
  };

  // Updated color function for moat ratings
  const getMoatColor = (rating: MoatRating): string => {
    switch (rating) {
      case 'Wide':
        return '#22c55e'; // Green
      case 'Moderate':
        return '#f97316'; // Orange
      case 'Narrow':
        return '#eab308'; // Yellow
      case 'None':
        return '#94a3b8'; // Grey
      default:
        return '#94a3b8'; // Grey as fallback
    }
  };

  // And update the getMetricColor function for consistency
  const getMetricColor = (score: number, maxScore: number = 3): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return '#22c55e'; // Green
    if (percentage >= 50) return '#f97316'; // Orange
    if (percentage >= 30) return '#eab308'; // Yellow
    return '#94a3b8'; // Grey
  };

  if (loading) {
    return <Skeleton height={350} radius="md" animate />;
  }

  if (error) {
    return (
      <Alert color="red" title="Economic Moat Analysis Error" className="error-alert">
        {error}
      </Alert>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="moat-card">
      <Title order={3} className="card-title">
        Economic Moat Analysis
      </Title>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Stack align="center" className="moat-rating-container">
            <div className="progress-wrapper">
              <svg width="200" height="110" viewBox="0 0 200 110">
                {/* Background gradient definition */}
                <defs>
                  <linearGradient id="moatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={`${getMoatColor(moatRating)}88`} />
                    <stop offset="100%" stopColor={getMoatColor(moatRating)} />
                  </linearGradient>

                  {/* Optional glow effect */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Background semi-circle with slight transparency */}
                <path
                  d="M20,100 A80,80 0 0,1 180,100"
                  fill="none"
                  stroke="#e2e8f080"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Progress semi-circle with gradient and glow */}
                <path
                  d="M20,100 A80,80 0 0,1 180,100"
                  fill="none"
                  stroke="url(#moatGradient)"
                  strokeWidth="16"
                  strokeDasharray={`${(Math.PI * 80 * moatScore) / 100} ${(Math.PI * 80 * (100 - moatScore)) / 100}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />

                {/* Add tickmarks for visual reference */}
                {[0, 25, 50, 75, 100].map((tick) => {
                  const angle = (Math.PI * tick) / 100;
                  const x = 100 - 90 * Math.cos(angle);
                  const y = 100 - 90 * Math.sin(angle);
                  return (
                    <circle
                      key={tick}
                      cx={x}
                      cy={y}
                      r={tick % 50 === 0 ? 3 : 2}
                      fill={tick <= moatScore ? getMoatColor(moatRating) : '#cbd5e1'}
                    />
                  );
                })}
              </svg>

              {/* Score display with improved styling */}
              <div className="score-display">
                <Text className="progress-score">{Math.round(moatScore)}</Text>
              </div>
            </div>
            <Badge size="xl" color={getMoatColor(moatRating)} variant="filled" className="moat-badge">
              <Text size="lg">{moatRating} Moat</Text>
            </Badge>
            <Text className="score-text">Score: {moatScore.toFixed(1)}/100</Text>
            <Text className="moat-description">
              An economic moat is a company's ability to maintain competitive advantages to protect its long-term
              profits and market share.
            </Text>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 8 }}>
          <Stack className="metrics-container">
            {metrics.map((metric, index) => (
              <div key={index} className="metric-item">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={500} className="metric-name">
                    {metric.name}
                  </Text>
                  <Text className="metric-score">{metric.score}/3</Text>
                </Group>

                <Group grow className="score-bar-container">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Progress
                      key={i}
                      value={i < metric.score ? 100 : 0}
                      color={i < metric.score ? getMetricColor(metric.score) : 'gray'}
                      size="lg"
                      radius="sm"
                      className="score-bar"
                    />
                  ))}
                </Group>

                <Group className="metric-details-container">
                  <Text className="metric-description">{metric.description}</Text>
                  <Text className="metric-details">{metric.details}</Text>
                </Group>
              </div>
            ))}
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default EconomicMoat;
