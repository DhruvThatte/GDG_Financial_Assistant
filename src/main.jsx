import React, { useState, useMemo } from 'react';
import App from './App';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { UserProfileProvider } from './contexts/UserProfileContext';

const Root = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#82b1ff' : '#2196f3',
        dark: darkMode ? '#448aff' : '#1976d2',
        light: darkMode ? '#bbdefb' : '#64b5f6'
      },
      secondary: {
        main: darkMode ? '#ff80ab' : '#f50057',
        dark: darkMode ? '#f50057' : '#c51162',
        light: darkMode ? '#ff4081' : '#ff4081'
      },
      background: {
        default: darkMode ? '#121212' : '#fafafa',
        paper: darkMode ? '#1e1e1e' : '#ffffff'
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? '#b0bec5' : '#757575'
      }
    }
  }), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProfileProvider>
        <BrowserRouter>
          <App darkMode={darkMode} onDarkModeChange={toggleDarkMode} />
        </BrowserRouter>
      </UserProfileProvider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
