// src/pages/Home/Home.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Title, TextInput, Text, Paper, Box, Group, Stack, CloseButton, ActionIcon, Transition } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useClickOutside } from '@mantine/hooks';
import AlphaVantageApiService from '../../services/alpha-vantage-service';
import { IStockSearchResult } from '../../interfaces/IStockSearchResult';
import Loader from '../../components/common/Loader/Loader';
import './Home.css';
import StockSearch from './components/StockSearch/StockSearch';
import HomeTitle from './components/HomeTitle/HomeTitle';

interface IHomeProps {}

const Home: React.FC<IHomeProps> = () => {
  return (
    <div className="home-container">
      <div className="home-section">
        <HomeTitle />
        <StockSearch />
      </div>
    </div>
  );
};

export default Home;
