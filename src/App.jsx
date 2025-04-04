import React, { useState, useMemo } from 'react';
import { Container, Box, Tabs, Tab, Typography, IconButton, useTheme, ThemeProvider, createTheme, Grid, TextField, Autocomplete, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Drawer, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Footer from './components/Footer';
import SearchIcon from '@mui/icons-material/Search';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MarketSentimentAnalysis from './components/MarketSentimentAnalysis';
import StockMarketTrends from './components/StockMarketTrends';
import LiveStocks from './components/LiveStocks';
import GlobalNews from './components/GlobalNews';
import MarketInsights from './components/MarketInsights';
import FinancialAssistant from './components/FinancialAssistant';
import EducationalHub from './components/EducationalHub';
import FinancialCalculator from './components/FinancialCalculator';
import ExpenseTracker from './components/ExpenseTracker';
import InvestmentPortfolioTracker from './components/InvestmentPortfolioTracker';
import FinancialQuestionnaire from './components/FinancialQuestionnaire';
import AIAssistant from './components/AIAssistant';
import HomePage from "./components/HomePage.jsx";
import TaxPlanner from './components/TaxPlanner';


const App = () => {
  const [mode, setMode] = useState('light');
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark' ? {
            primary: {
              main: '#00B894', // Green for growth/profit
              dark: '#009B7F',
              light: '#33C6A5'
            },
            secondary: {
              main: '#0984E3', // Info/Neutral blue
              dark: '#0874C7',
              light: '#3799E8'
            },
            error: {
              main: '#E17055', // Danger/Loss red
              dark: '#D15F45',
              light: '#E68B77'
            },
            warning: {
              main: '#F1C40F', // Gold for alerts
              dark: '#D4AD0D',
              light: '#F3CD3F'
            },
            info: {
              main: '#9B59B6', // Purple for premium features
              dark: '#874DA0',
              light: '#AF7AC4'
            },
            background: {
              default: '#121212',
              paper: '#1E1E1E'
            },
            text: {
              primary: '#FFFFFF',
              secondary: '#AAAAAA'
            }
          } : {
            primary: {
              main: '#2ECC71', // Green for growth
              dark: '#27AE60',
              light: '#58D68D'
            },
            secondary: {
              main: '#3498DB', // Info/Neutral blue
              dark: '#2E86C1',
              light: '#5DADE2'
            },
            error: {
              main: '#E74C3C', // Danger/Loss red
              dark: '#C0392B',
              light: '#EC7063'
            },
            warning: {
              main: '#F1C40F', // Gold for alerts
              dark: '#D4AC0D',
              light: '#F4D03F'
            },
            info: {
              main: '#9B59B6', // Purple for premium features
              dark: '#884EA0',
              light: '#AF7AC5'
            },
            background: {
              default: '#FFFFFF',
              paper: '#F5F7FA'
            },
            text: {
              primary: '#1C1C1C',
              secondary: '#666666'
            }
          })
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none'
              }
            }
          }
        }
      }),
    [mode]
  );
  const [currentTab, setCurrentTab] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const allItems = [
    { text: 'Financial Calculator', icon: <CalculateIcon />, component: FinancialCalculator },
    { text: 'Expense Tracker', icon: <AccountBalanceWalletIcon />, component: ExpenseTracker },
    { text: 'Financial Profile Builder', icon: <PersonIcon /> },
    { text: 'Investment Portfolio Tracker', icon: <ShowChartIcon />, component: InvestmentPortfolioTracker }
  ];

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const TabPanel = React.memo(({ children, value, index }) => {
    if (value !== index) return null;
    return (
      <div
        role="tabpanel"
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
      >
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </div>
    );
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
        <AppBar position="fixed" sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0F3D3E' : '#E0F7FA', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ 
            height: { xs: 56, sm: 64, md: 72 },
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            px: { xs: 1.5, sm: 2, md: 3 },
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.mode === 'light' ? 'primary.main' : 'inherit',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  },
                  fontSize: { xs: '1.2rem', sm: '1.5rem' }
                }}
                onClick={() => setCurrentTab(-1)}
              >
                StockSense
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 },
                flex: 1,
                mx: { sm: 3, md: 4 },
                justifyContent: 'flex-end'
              }}>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      textTransform: 'none',
                      minWidth: 100,
                      px: 1.5,
                      color: theme.palette.mode === 'light' ? 'text.primary' : 'inherit',
                      '&:hover': {
                        color: 'primary.main',
                        opacity: 0.8
                      },
                      '&.Mui-selected': {
                        color: 'primary.main',
                        fontWeight: 600
                      }
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    },
                    ml: 'auto'
                  }}
                >
              <Tab label="Home" value={-1} />
              <Tab label="Market Analysis" value={0} />
              <Tab label="Financial Tools" value={1} />
              <Tab label="Education" value={2} />
              </Tabs>
              <Box sx={{ flex: 1, maxWidth: 400, ml: { sm: 2, md: 3 } }}>
                <Autocomplete
                  freeSolo
                  options={allItems}
                  getOptionLabel={(option) => option.text}
                  inputValue={searchQuery}
                  onInputChange={(event, newValue) => setSearchQuery(newValue)}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setCurrentTab(1);
                      setTimeout(() => {
                        const componentElement = document.getElementById(newValue.text.replace(/\s+/g, ''));
                        if (componentElement) {
                          componentElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '36px',
                      borderRadius: '18px',
                      backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search features..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '1.1rem' }} />
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 1, sm: 2 } }}>
            <IconButton
              onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
              sx={{
                color: theme.palette.mode === 'light' ? 'text.primary' : 'inherit',
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: mode === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)',
                '&:hover': {
                  transform: mode === 'dark' ? 'rotate(180deg) scale(1.2)' : 'rotate(360deg) scale(1.2)'
                }
              }}
            >
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>


      <Container maxWidth="xl" sx={{ mt: { xs: 8, sm: 10, md: 12 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        {isMobile && (
          <Box sx={{ width: '100%', mb: 3, px: 1 }}>
            <Autocomplete
              freeSolo
              options={allItems}
              getOptionLabel={(option) => option.text}
              inputValue={searchQuery}
              onInputChange={(event, newValue) => setSearchQuery(newValue)}
              onChange={(event, newValue) => {
                if (newValue) {
                  setCurrentTab(1);
                  setTimeout(() => {
                    const componentElement = document.getElementById(newValue.text.replace(/\s+/g, ''));
                    if (componentElement) {
                      componentElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }
              }}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  height: '40px',
                  borderRadius: '20px',
                  backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search features..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '1.1rem' }} />
                  }}
                />
              )}
            />
          </Box>
        )}
        <TabPanel value={currentTab} index={-1}>
          <HomePage onTabChange={setCurrentTab} />
        </TabPanel>
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ mb: 3 }}>
            <MarketSentimentAnalysis />
          </Box>
          <Box sx={{ mb: 3 }}>
            <StockMarketTrends />
          </Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: 2, p: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flex: 1 }}>
                <LiveStocks />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: 2, p: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flex: 1 }}>
                <MarketInsights />
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mb: 3 }}>
            <GlobalNews />
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <FinancialAssistant />
          </Box>
          <Box sx={{ mb: 3 }} id="FinancialCalculator">
            <FinancialCalculator />
          </Box>
          <Box sx={{ mb: 3 }} id="ExpenseTracker">
            <ExpenseTracker />
          </Box>
          <Box sx={{ mb: 3 }}>
            <FinancialQuestionnaire />
          </Box>
          <Box sx={{ mb: 3 }} id="InvestmentPortfolioTracker">
            <InvestmentPortfolioTracker />
          </Box>
          <Box sx={{ mb: 3 }} id="TaxPlanner">
            <TaxPlanner />
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <EducationalHub />
        </TabPanel>
      </Container>
      <AIAssistant />
      <Footer />
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '80%', 
            maxWidth: 280,
            pt: 8,
            background: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)'
          },
        }}
      >
        <Box sx={{ mt: 8, p: 2 }}>
          <List>
            {['Home', 'Market Analysis', 'Financial Tools', 'Education'].map((text, index) => (
              <ListItem 
                button 
                key={text}
                onClick={() => {
                  setCurrentTab(index - 1);
                  setMobileOpen(false);
                }}
                selected={currentTab === index - 1}
              >
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  </ThemeProvider>
);
};

export default App;