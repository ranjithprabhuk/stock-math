import { Grid } from '@mantine/core';
import ProfitabilityScore from './ProfitabilityScore';
import SolvencyScore from './SolvencyScore';

const FinancialScoreAnalysis = () => {
  return (
    <>
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <ProfitabilityScore />
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <SolvencyScore />
      </Grid.Col>
    </>
  );
};

export default FinancialScoreAnalysis;
