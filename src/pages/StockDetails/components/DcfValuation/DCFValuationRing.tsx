import { useEffect, useState } from 'react';
import { Card, Text, Group, RingProgress, Skeleton, Alert, Stack, Paper, Title } from '@mantine/core';
import { IconArrowUp, IconArrowDown, IconMinus } from '@tabler/icons-react';
import './DcfValuation.css';

interface DCFValuationProps {
  valuationGap: number;
  loading?: boolean;
  error?: string | null;
}

export const DCFValuationRing = ({ valuationGap, loading = false, error = null }: DCFValuationProps) => {
  const [isUndervalued, setIsUndervalued] = useState(false);
  const [isFairValued, setIsFairValued] = useState(false);
  const [absoluteGap, setAbsoluteGap] = useState(0);

  useEffect(() => {
    // Determine if the stock is undervalued, overvalued, or fair valued
    setIsUndervalued(valuationGap > 0);
    setIsFairValued(Math.abs(valuationGap) < 5); // Consider within ±5% as fair valued
    setAbsoluteGap(Math.abs(valuationGap));
  }, [valuationGap]);

  const getGapColor = (): string => {
    if (isFairValued) return 'blue';
    return isUndervalued ? 'green' : 'red';
  };

  const getStatusIcon = () => {
    if (isFairValued) return <IconMinus size={24} />;
    return isUndervalued ? <IconArrowUp size={24} /> : <IconArrowDown size={24} />;
  };

  const getStatusText = (): string => {
    if (isFairValued) return 'Fair Valued';
    return isUndervalued ? 'Undervalued' : 'Overvalued';
  };

  if (loading) {
    return <Skeleton height={220} radius="md" animate />;
  }

  if (error) {
    return (
      <Alert color="red" title="DCF Valuation Error" radius="md">
        {error}
      </Alert>
    );
  }

  // Cap the progress at 100% for visualization purposes
  const cappedGapValue = Math.min(absoluteGap, 100);

  return (
    <Stack align="center" gap="xs">
      <RingProgress
        size={180}
        thickness={18}
        roundCaps
        sections={[{ value: cappedGapValue, color: getGapColor() }]}
        label={
          <Stack gap={0} align="center">
            <Group gap={4} align="center">
              {getStatusIcon()}
              <Text size="xl" fw={700} className="gap-value" c={getGapColor()}>
                {valuationGap > 0 ? '+' : ''}
                {valuationGap.toFixed(1)}%
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              From fair value
            </Text>
          </Stack>
        }
        className="dcf-ring"
      />
    </Stack>
  );
};

export default DCFValuationRing;
