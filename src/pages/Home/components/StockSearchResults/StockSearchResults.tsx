import { Paper, Loader, Text, Stack, Group } from '@mantine/core';
import { Transition } from '@mantine/core';
import Flag from 'react-world-flags';
import { IStockSearchResult } from '../../../../interfaces/IStockSearchResult';
import './StockSearchResults.css';
import { regionToCountryCode } from '../../../../utils/region-to-country-code';

const StockSearchResults = ({
  showResults,
  searchResults,
  isLoading,
  error,
  searchQuery,
  handleSelectStock,
}: {
  showResults: boolean;
  searchResults: IStockSearchResult[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  handleSelectStock: (symbol: string) => void;
}) => {
  return (
    <Transition mounted={showResults} transition="pop" duration={200}>
      {(styles) => (
        <Paper className="search-results" shadow="md" style={{ ...styles }} withBorder>
          {isLoading ? (
            <Loader size="sm" />
          ) : error ? (
            <Text color="red" size="sm" className="search-message">
              {error}
            </Text>
          ) : searchResults.length === 0 ? (
            <Text size="sm" className="search-message">
              {searchQuery.trim() ? 'No results found' : 'Start typing to search stocks'}
            </Text>
          ) : (
            <Stack style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.map((result) => (
                <Paper
                  key={result.symbol}
                  className="search-result-item"
                  onClick={() => handleSelectStock(result.symbol)}
                  style={{ cursor: 'pointer' }}
                >
                  <Group>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Flag
                        code={regionToCountryCode[result.region]}
                        style={{ width: '24px', height: '24px', marginRight: '10px' }}
                      />
                      <div className={'stock-info'}>
                        <Text fw={500}>{result.name}</Text>
                        <Text size="xs" color="dimmed">
                          {result.symbol}
                        </Text>
                      </div>
                    </div>
                    <Text size="sm" color="dimmed">
                      {result.currency}
                    </Text>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      )}
    </Transition>
  );
};

export default StockSearchResults;
