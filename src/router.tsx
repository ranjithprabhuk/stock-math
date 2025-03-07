import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShellLayout from './components/layout/AppShell';
import Home from './pages/Home/Home';
import StockDetails from './pages/StockDetails/StockDetails';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShellLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/stock-math/" replace={true} />} />
          <Route path="/stock-math/" element={<Home />} />
          <Route path="/stock-math/stock/:symbol" element={<StockDetails />} />
        </Routes>
      </AppShellLayout>
    </BrowserRouter>
  );
};

export default AppRouter;
