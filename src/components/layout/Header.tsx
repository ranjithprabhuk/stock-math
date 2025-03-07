import React, { useState } from 'react';
import { Group, Button, Title, Avatar, Switch, useMantineColorScheme } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { IconSun, IconMoon, IconUser } from '@tabler/icons-react';
import './Header.css';

interface HeaderProps {
  // Add any props the Header might need
}

const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would be connected to your auth state

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  // For demonstration purposes only - in a real app, you'd use your auth system
  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="header-container">
      <Group justify="space-between" style={{ width: '100%' }}>
        <div className="logo-container">
          <Title order={3} className="logo-text">
            Stock <span className={'gradient-text'}>Math</span>
          </Title>
        </div>

        <Group>
          <div className="navigation-links">
            <Button
              component={Link}
              to="/stock-math"
              variant={location.pathname === '/' ? 'filled' : 'subtle'}
              size="sm"
            >
              Home
            </Button>
          </div>

          <Group>
            <div className="theme-toggle">
              <Switch
                checked={colorScheme === 'dark'}
                onChange={toggleColorScheme}
                size="md"
                onLabel={<IconSun size="1rem" stroke={2.5} />}
                offLabel={<IconMoon size="1rem" stroke={2.5} />}
              />
            </div>

            {/* {isLoggedIn ? (
              <Avatar color="blue" radius="xl">
                <IconUser size="1.5rem" />
              </Avatar>
            ) : (
              <Group>
                <Button variant="subtle" size="sm">
                  Login
                </Button>
                <Button size="sm">Sign Up</Button>
              </Group>
            )} */}

            {/* Demo toggle - remove in production */}
            {/* <Button onClick={toggleLogin} size="xs" variant="outline" style={{ marginLeft: '8px' }}>
              {isLoggedIn ? 'Logout' : 'Login'} (Demo)
            </Button> */}
          </Group>
        </Group>
      </Group>
    </div>
  );
};

export default Header;
