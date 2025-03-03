// src/pages/Home/Home.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Title,
  TextInput,
  Text,
  Paper,
  Box,
  Group,
  Stack,
  CloseButton,
  ActionIcon,
  Transition,
  ThemeIcon,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useClickOutside } from '@mantine/hooks';
import AlphaVantageApiService from '../../../../services/alpha-vantage-service';
import { IStockSearchResult } from '../../../../interfaces/IStockSearchResult';
import Loader from '../../../../components/common/Loader/Loader';
import './StockSearch.css';
import StockSearchResults from '../StockSearchResults/StockSearchResults';

interface IStockSearch {}

const StockSearch: React.FC<IStockSearch> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IStockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useClickOutside(() => setShowResults(false));
  const navigate = useNavigate();

  useEffect(() => {
    // Clean up timeout on component unmount
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowResults(true);

    // Add a small delay to prevent excessive API calls while typing
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await AlphaVantageApiService.searchStocks(query);
        setSearchResults(results);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch search results. Please try again.');
        setSearchResults([]);
        setIsLoading(false);
      }
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSelectStock = (symbol: string) => {
    navigate(`/stock-math/stock/${symbol}`);
  };

  return (
    <Box className="search-container" ref={dropdownRef}>
      <TextInput
        placeholder="Search for stocks..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        size="lg"
        radius="md"
        // icon={<IconSearch size="1.2rem" />}
        className="search-input"
        rightSection={
          searchQuery ? (
            <ActionIcon onClick={handleClearSearch}>
              <IconX size="1.2rem" />
            </ActionIcon>
          ) : (
            <IconSearch size="1.2rem" />
          )
        }
      />

      <StockSearchResults
        showResults={showResults}
        error={error}
        searchResults={searchResults}
        isLoading={isLoading}
        searchQuery={searchQuery}
        handleSelectStock={handleSelectStock}
      />
    </Box>
  );
};

export default StockSearch;
