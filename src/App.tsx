import React from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import AppRouter from './router';
import { StockDataProvider } from './context/stock-data';

const theme = createTheme({
  // You can customize the theme here
});

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <StockDataProvider>
        <AppRouter />
      </StockDataProvider>
    </MantineProvider>
  );
}

export default App;
