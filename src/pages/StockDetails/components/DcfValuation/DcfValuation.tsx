import React, { useState, useEffect } from 'react';
import { useStockData } from '../../../../context/stock-data';
import './DcfValuation.css'; // Import custom CSS
import DCFValuationRing from './DCFValuationRing';

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
    return <div className="dcf-loading-skeleton"></div>;
  }

  if (error) {
    return (
      <div className="dcf-error">
        <div className="dcf-error-title">Valuation Error</div>
        <div className="dcf-error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dcf-card">
      <div className="dcf-header">
        <h2 className="dcf-title">DCF Valuation Analysis</h2>
        <div className="dcf-subtitle">Discounted Cash Flow model based on projected growth</div>
      </div>

      {normalCaseValuation && (
        <div className="dcf-content">
          {/* Main valuation display */}
          <div className="dcf-main-valuation">
            <div className="dcf-price-display">
              <div className="dcf-label">Current Market Price</div>
              <div className="dcf-price">${normalCaseValuation.marketPrice.toFixed(2)}</div>
            </div>

            {/* Custom circular progress */}
            <DCFValuationRing valuationGap={normalCaseValuation.valuationGap} />
          </div>

          {/* Valuation status badge */}
          <div className={`dcf-status-badge ${normalCaseValuation.undervalued ? 'positive' : 'negative'}`}>
            {normalCaseValuation.undervalued ? 'UNDERVALUED' : 'OVERVALUED'}
          </div>

          {/* Scenario cases */}
          <div className="dcf-scenarios">
            <div className="dcf-scenario-card worst">
              <div className="dcf-scenario-label">Worst Case</div>
              <div className="dcf-scenario-value">${worstCaseValuation?.intrinsicValue.toFixed(2) || 'N/A'}</div>
              <div className="dcf-scenario-details">
                <div>Growth: {GROWTH_RATES.worstCase * 100}%</div>
                <div>Discount: {DISCOUNT_RATES.worstCase * 100}%</div>
              </div>
            </div>

            <div className={`dcf-scenario-card normal ${normalCaseValuation.undervalued ? 'positive' : 'negative'}`}>
              <div className="dcf-scenario-label">Normal Case</div>
              <div className="dcf-scenario-value">${normalCaseValuation.intrinsicValue.toFixed(2)}</div>
              <div className="dcf-scenario-details">
                <div>Growth: {GROWTH_RATES.normalCase * 100}%</div>
                <div>Discount: {DISCOUNT_RATES.normalCase * 100}%</div>
              </div>
            </div>

            <div className="dcf-scenario-card best">
              <div className="dcf-scenario-label">Best Case</div>
              <div className="dcf-scenario-value">${bestCaseValuation?.intrinsicValue.toFixed(2) || 'N/A'}</div>
              <div className="dcf-scenario-details">
                <div>Growth: {GROWTH_RATES.bestCase * 100}%</div>
                <div>Discount: {DISCOUNT_RATES.bestCase * 100}%</div>
              </div>
            </div>
          </div>

          <div className="dcf-methodology">
            This DCF valuation accounts for projected free cash flows with {GROWTH_RATES.normalCase * 100}% growth
            (normal case), discounted at {DISCOUNT_RATES.normalCase * 100}% with a terminal growth rate of{' '}
            {TERMINAL_GROWTH_RATES.normalCase * 100}%.
          </div>
        </div>
      )}
    </div>
  );
};

export default DCFValuation;
