import React, { useState, useEffect } from 'react';
import { Title, Transition } from '@mantine/core';
import './HomeTitle.css';

const HomeTitle: React.FC = () => {
  const [showInvestments, setShowInvestments] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    setShowInsights(true);
    setShowInvestments(true);
  }, []);

  return (
    <Title order={1} className="home-title">
      Empower Your{' '}
      <Transition mounted={showInvestments} transition="fade" duration={1000} timingFunction="ease">
        {(styles) => (
          <span className="gradient-text" style={styles}>
            Investments
          </span>
        )}
      </Transition>{' '}
      with Data-Driven{' '}
      <Transition mounted={showInsights} transition="fade" duration={1000} timingFunction="ease">
        {(styles) => (
          <span className="gradient-text" style={styles}>
            Insights
          </span>
        )}
      </Transition>
    </Title>
  );
};

export default HomeTitle;
