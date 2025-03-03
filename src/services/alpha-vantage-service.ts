// src/services/alpha-vantage-service.ts

import { IStockSearchResult } from '../interfaces/IStockSearchResult';
import { IStockSearchResponse } from '../interfaces/IStockSearchResponse';

class AlphaVantageApiService {
  private static baseUrl = process.env.REACT_APP_ALPHA_VANTAGE_BASE_URL;
  private static apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

  /**
   * Searches for stocks based on the provided keyword
   * @param keyword The search term
   * @returns Array of stock search results
   */
  public static async searchStocks(keyword: string): Promise<IStockSearchResult[]> {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keyword)}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: IStockSearchResponse = await response.json();

      // If no matches or unexpected response structure
      if (!data.bestMatches) {
        return [];
      }

      // Transform API response to our interface
      return data.bestMatches.map((match) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        marketOpen: match['5. marketOpen'],
        marketClose: match['6. marketClose'],
        timezone: match['7. timezone'],
        currency: match['8. currency'],
        matchScore: match['9. matchScore'],
      }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  }

  static async getCompanyOverview(symbol: string) {
    try {
      const response = await fetch(`${this.baseUrl}query?function=OVERVIEW&symbol=${symbol}&apikey=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching company overview:', error);
      throw error;
    }
  }

  static async getIncomeStatement(symbol: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${this.apiKey}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching income statement:', error);
      throw error;
    }
  }

  static async getBalanceSheet(symbol: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}query?function=BALANCE_SHEET&symbol=${symbol}&apikey=${this.apiKey}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      throw error;
    }
  }

  static async getCashFlow(symbol: string) {
    try {
      const response = await fetch(`${this.baseUrl}query?function=CASH_FLOW&symbol=${symbol}&apikey=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cash flow:', error);
      throw error;
    }
  }

  static async getEarnings(symbol: string) {
    try {
      const response = await fetch(`${this.baseUrl}query?function=EARNINGS&symbol=${symbol}&apikey=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }
  }
}

export default AlphaVantageApiService;
