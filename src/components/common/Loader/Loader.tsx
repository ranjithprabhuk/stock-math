// src/components/common/Loader/Loader.tsx

import React from 'react';
import { Loader as MantineLoader, Center, Box } from '@mantine/core';
import './Loader.css';

interface ILoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  inline?: boolean;
  text?: string;
}

const Loader: React.FC<ILoaderProps> = ({ size = 'md', color = 'blue', inline = false, text }) => {
  if (inline) {
    return (
      <Box className="inline-loader">
        <MantineLoader size={size} color={color} />
        {text && <span className="loader-text">{text}</span>}
      </Box>
    );
  }

  return (
    <Center className="loader-container">
      <div className="loader-content">
        <MantineLoader size={size} color={color} />
        {text && <div className="loader-text">{text}</div>}
      </div>
    </Center>
  );
};

export default Loader;
