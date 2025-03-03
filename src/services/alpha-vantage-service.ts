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
}

export default AlphaVantageApiService;
