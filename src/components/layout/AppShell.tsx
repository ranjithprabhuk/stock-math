import React from 'react';
import { AppShell } from '@mantine/core';
import Header from './Header';
import './AppShell.css';

interface AppShellLayoutProps {
  children: React.ReactNode;
}

const AppShellLayout: React.FC<AppShellLayoutProps> = ({ children }) => {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AppShellLayout;
