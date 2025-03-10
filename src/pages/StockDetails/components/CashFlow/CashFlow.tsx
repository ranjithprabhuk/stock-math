// pages/StockDetails/components/CashFlow/CashFlow.tsx
import { useEffect, useState } from 'react';
import { Accordion, Alert, Loader, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AlphaVantageApiService from '../../../../services/alpha-vantage-service';
import { useStockData } from '../../../../context/stock-data';
import './CashFlow.css'; // Import the CSS file

interface ICashFlowProps {
  symbol: string;
}

const CashFlow: React.FC<ICashFlowProps> = ({ symbol }) => {
  const { cashFlow: cashFlowData, errorCashFlow: error, loadingCashFlow: loading } = useStockData();

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" className="error-alert">
        {error}
      </Alert>
    );
  }

  if (!cashFlowData) {
    return <Text>No data available</Text>;
  }

  // Prepare data for charts
  const prepareChartData = (dataKey: string) => {
    return cashFlowData?.annualReports
      ?.map((report: any) => ({
        year: report.fiscalDateEnding.substring(0, 4),
        value: parseInt(report[dataKey]) || 0,
      }))
      .reverse(); // Show oldest to newest
  };

  // Format large numbers for better readability
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)} B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)} M`;
    } else if (value <= -1000000000) {
      return `-$${(Math.abs(value) / 1000000000).toFixed(2)} B`;
    } else if (value <= -1000000) {
      return `-$${(Math.abs(value) / 1000000).toFixed(2)} M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="cash-flow-container">
      <Title order={3} className="cash-flow-title">
        {symbol} Cash Flow
      </Title>

      <Accordion
        multiple
        defaultValue={[
          'operatingCashflow',
          'capitalExpenditures',
          'cashflowFromInvestment',
          'cashflowFromFinancing',
          'freeCashFlow',
        ]}
        classNames={{
          root: 'cash-flow-accordion',
          item: 'accordion-item',
          control: 'accordion-control',
          panel: 'accordion-panel',
        }}
      >
        <Accordion.Item value="operatingCashflow" className="operating-cashflow">
          <Accordion.Control>Operating Cash Flow</Accordion.Control>
          <Accordion.Panel>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData('operatingCashflow')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="value" name="Operating Cash Flow" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="capitalExpenditures" className="capital-expenditures">
          <Accordion.Control>Capital Expenditures</Accordion.Control>
          <Accordion.Panel>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData('capitalExpenditures')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="value" name="Capital Expenditures" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="cashflowFromInvestment" className="investment-cashflow">
          <Accordion.Control>Cash Flow from Investment</Accordion.Control>
          <Accordion.Panel>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData('cashflowFromInvestment')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="value" name="Cash Flow from Investment" fill="#ffc658" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="cashflowFromFinancing" className="financing-cashflow">
          <Accordion.Control>Cash Flow from Financing</Accordion.Control>
          <Accordion.Panel>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData('cashflowFromFinancing')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="value" name="Cash Flow from Financing" fill="#ff8042" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="freeCashFlow" className="free-cashflow">
          <Accordion.Control>Free Cash Flow</Accordion.Control>
          <Accordion.Panel>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={prepareChartData('operatingCashflow')?.map((item: { value: number; year: any }) => ({
                    ...item,
                    value:
                      item.value +
                      (parseInt(
                        cashFlowData?.annualReports?.find((report: any) =>
                          report?.fiscalDateEnding?.includes(item?.year)
                        )?.capitalExpenditures || '0'
                      ) || 0),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="value" name="Free Cash Flow" fill="#8dd1e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default CashFlow;
