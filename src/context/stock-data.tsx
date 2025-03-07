import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, JSX } from 'react';
import AlphaVantageApiService from '../services/alpha-vantage-service';
import { ICompanyOverview } from '../interfaces/ICompanyOverview';
import { IEarnings } from '../interfaces/IEarnings';
import { IIncomeStatement } from '../interfaces/IIncomeStatement';
import { ICashFlow } from '../interfaces/ICashFlow';
import { IBalanceSheet } from '../interfaces/IBalanceSheet';
import { IQuote } from '../interfaces/IQuote';

interface StockDataContextType {
  companyOverview: ICompanyOverview | null;
  eps: IEarnings | null;
  incomeStatement: IIncomeStatement | null;
  cashFlow: ICashFlow | null;
  balanceSheet: IBalanceSheet | null;
  loadingOverview: boolean;
  loadingEPS: boolean;
  loadingIncomeStatement: boolean;
  loadingCashFlow: boolean;
  loadingBalanceSheet: boolean;
  errorOverview: string | null;
  errorEPS: string | null;
  errorIncomeStatement: string | null;
  errorCashFlow: string | null;
  errorBalanceSheet: string | null;
  fetchAllData: (symbol: string) => Promise<void>;
  resetAllData: () => void;
}

// Create Context with proper types
const StockDataContext = createContext<StockDataContextType | undefined>(undefined);
// Context Provider Component
interface StockDataProviderProps {
  children: ReactNode;
}

export const StockDataProvider = ({ children }: StockDataProviderProps): JSX.Element => {
  const [companyOverview, setCompanyOverview] = useState<ICompanyOverview | null>(null);
  const [quote, setQuote] = useState<IQuote | null>(null);
  const [eps, setEPS] = useState<IEarnings | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IIncomeStatement | null>(null);
  const [cashFlow, setCashFlow] = useState<ICashFlow | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<IBalanceSheet | null>(null);

  // Separate loading states
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingEPS, setLoadingEPS] = useState(false);
  const [loadingIncomeStatement, setLoadingIncomeStatement] = useState(false);
  const [loadingCashFlow, setLoadingCashFlow] = useState(false);
  const [loadingBalanceSheet, setLoadingBalanceSheet] = useState(false);

  // Separate error states
  const [errorOverview, setErrorOverview] = useState<string | null>(null);
  const [errorEPS, setErrorEPS] = useState<string | null>(null);
  const [errorIncomeStatement, setErrorIncomeStatement] = useState<string | null>(null);
  const [errorCashFlow, setErrorCashFlow] = useState<string | null>(null);
  const [errorBalanceSheet, setErrorBalanceSheet] = useState<string | null>(null);

  // API Fetch Functions

  const fetchCompanyOverview = async (symbol: string) => {
    try {
      setLoadingOverview(true);
      setErrorOverview(null);

      const response = await AlphaVantageApiService.getCompanyOverview(symbol);
      const quoteInfo = await AlphaVantageApiService.getGlobalQuote(symbol);
      response.price = quoteInfo.price;

      if (!response || Object.keys(response).length === 0) {
        setErrorOverview('No company data available');
      } else {
        setCompanyOverview(response);
        setQuote(quoteInfo);
      }
    } catch (err) {
      setErrorOverview('Failed to load company overview');
      console.error(err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchEPS = async (symbol: string) => {
    try {
      setLoadingEPS(true);
      setErrorEPS(null);

      const response = await AlphaVantageApiService.getEarnings(symbol);

      if (!response || Object.keys(response).length === 0) {
        setErrorEPS('No EPS data available');
      } else {
        setEPS(response);
      }
    } catch (err) {
      setErrorEPS('Failed to load EPS data');
      console.error(err);
    } finally {
      setLoadingEPS(false);
    }
  };

  const fetchIncomeStatement = async (symbol: string) => {
    try {
      setLoadingIncomeStatement(true);
      setErrorIncomeStatement(null);

      const response = await AlphaVantageApiService.getIncomeStatement(symbol);

      if (!response || Object.keys(response).length === 0) {
        setErrorIncomeStatement('No income statement data available');
      } else {
        setIncomeStatement(response);
      }
    } catch (err) {
      setErrorIncomeStatement('Failed to load income statement');
      console.error(err);
    } finally {
      setLoadingIncomeStatement(false);
    }
  };

  const fetchCashFlow = async (symbol: string) => {
    try {
      setLoadingCashFlow(true);
      setErrorCashFlow(null);

      const response = await AlphaVantageApiService.getCashFlow(symbol);

      if (!response || Object.keys(response).length === 0) {
        setErrorCashFlow('No cash flow data available');
      } else {
        setCashFlow(response);
      }
    } catch (err) {
      setErrorCashFlow('Failed to load cash flow data');
      console.error(err);
    } finally {
      setLoadingCashFlow(false);
    }
  };

  const fetchBalanceSheet = async (symbol: string) => {
    try {
      setLoadingBalanceSheet(true);
      setErrorBalanceSheet(null);

      const response = await AlphaVantageApiService.getBalanceSheet(symbol);

      if (!response || Object.keys(response).length === 0) {
        setErrorBalanceSheet('No balance sheet data available');
      } else {
        setBalanceSheet(response);
      }
    } catch (err) {
      setErrorBalanceSheet('Failed to load balance sheet data');
      console.error(err);
    } finally {
      setLoadingBalanceSheet(false);
    }
  };

  const fetchAllData = async (symbol: string) => {
    fetchCompanyOverview(symbol);
    fetchEPS(symbol);
    fetchIncomeStatement(symbol);
    fetchCashFlow(symbol);
    fetchBalanceSheet(symbol);
  };

  const resetAllData = () => {
    console.log('reset');
    setCompanyOverview(null);
    setEPS(null);
    setIncomeStatement(null);
    setCashFlow(null);
    setBalanceSheet(null);
    setErrorOverview(null);
    setErrorEPS(null);
    setErrorIncomeStatement(null);
    setErrorCashFlow(null);
    setErrorBalanceSheet(null);
  };

  return (
    <StockDataContext.Provider
      value={{
        companyOverview,
        eps,
        incomeStatement,
        cashFlow,
        balanceSheet,

        loadingOverview,
        loadingEPS,
        loadingIncomeStatement,
        loadingCashFlow,
        loadingBalanceSheet,

        errorOverview,
        errorEPS,
        errorIncomeStatement,
        errorCashFlow,
        errorBalanceSheet,

        fetchAllData,
        resetAllData,
      }}
    >
      {children}
    </StockDataContext.Provider>
  );
};

// Custom Hook for Using the Context
export const useStockData = () => {
  const context = useContext(StockDataContext);
  if (context === undefined) {
    throw new Error('useStockData must be used within a StockDataProvider');
  }
  return context;
};
