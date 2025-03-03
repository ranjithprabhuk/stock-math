import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShellLayout from './components/layout/AppShell';
import Home from './pages/Home/Home';
import StockDetails from './pages/StockDetails/StockDetails';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShellLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stock/:symbol" element={<StockDetails />} />
        </Routes>
      </AppShellLayout>
    </BrowserRouter>
  );
};

export default AppRouter;
