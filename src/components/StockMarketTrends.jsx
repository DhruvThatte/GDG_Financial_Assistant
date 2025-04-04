import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid, Box, CircularProgress, TextField, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, ReferenceLine } from 'recharts';
import { fetchMarketTrends } from '../services/api';
import { STOCK_SYMBOLS } from '../config/api';

const StockMarketTrends = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(STOCK_SYMBOLS[0]);
  const [searchInput, setSearchInput] = useState('');
  const [stockData, setStockData] = useState({
    symbol: null,
    startPrice: null,
    currentPrice: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Clear previous data
        setData([]);
        setStockData({
          symbol: null,
          startPrice: null,
          currentPrice: null
        });

        const trendsData = await fetchMarketTrends(selectedStock);

        if (trendsData && Array.isArray(trendsData) && trendsData.length > 0) {
          // Ensure all required data points are present and valid
          const validData = trendsData.filter(item => (
            item &&
            typeof item.close === 'number' &&
            typeof item.open === 'number' &&
            typeof item.high === 'number' &&
            typeof item.low === 'number' &&
            typeof item.volume === 'number'
          ));

          if (validData.length > 0) {
            // Update with validated data
            setData(validData);
            const startPrice = validData[0].close;
            const currentPrice = validData[validData.length - 1].close;

            setStockData({
              symbol: selectedStock,
              startPrice,
              currentPrice
            });
          } else {
            console.warn('No valid data points found for', selectedStock);
          }
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      };
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [selectedStock]);

  const calculateGainLoss = () => {
    const { startPrice, currentPrice } = stockData;
    if (!startPrice || !currentPrice) return '0.00';

    const absoluteChange = currentPrice - startPrice;
    const percentageChange = (absoluteChange / Math.abs(startPrice)) * 100;

    if (isNaN(percentageChange)) return '0.00';
    const sign = percentageChange >= 0 ? '+' : '';
    return `${sign}${percentageChange.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          📊 Stock Market Trends
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <Autocomplete
            fullWidth
            freeSolo
            options={STOCK_SYMBOLS}
            value={selectedStock}
            onChange={(event, newValue) => {
              if (newValue) {
                setSelectedStock(newValue);
              }
              setSearchInput('');
            }}
            inputValue={searchInput}
            onInputChange={(event, newInputValue) => {
              setSearchInput(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Search for stocks..."
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                    }
                  }
                }}
              />
            )}
          />
        </Box>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Stock Prices Over Time
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Bar dataKey="close" fill="#00bcd4" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography
              variant="body2"
              color={parseFloat(calculateGainLoss()) >= 0 ? 'success.main' : 'error.main'}
            >
              {calculateGainLoss()}%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Candlestick Chart
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId={0} domain={['auto', 'auto']} />
                <YAxis yAxisId={1} orientation="right" domain={['auto', 'auto']} />
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <Paper sx={{ p: 1 }}>
                          <Typography variant="body2">Time: {data.name}</Typography>
                          <Typography variant="body2" color="#4caf50">Open: ${data.open?.toFixed(2)}</Typography>
                          <Typography variant="body2" color="#2196f3">High: ${data.high?.toFixed(2)}</Typography>
                          <Typography variant="body2" color="#2196f3">Low: ${data.low?.toFixed(2)}</Typography>
                          <Typography variant="body2" color="#f44336">Close: ${data.close?.toFixed(2)}</Typography>
                          <Typography variant="body2" color="#757575">Volume: {data.volume?.toLocaleString()}</Typography>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
                {data.map((entry, index) => {
                  if (!entry || typeof entry.close !== 'number' || typeof entry.open !== 'number') {
                    return null;
                  }
                  const color = entry.close >= entry.open ? "#00e676" : "#ff1744";
                  const barHeight = Math.abs(entry.close - entry.open);
                  const y = Math.min(entry.open, entry.close);

                  return (
                    <React.Fragment key={index}>
                      {typeof entry.volume === 'number' && (
                        <Bar
                          dataKey="volume"
                          yAxisId={1}
                          fill={color}
                          opacity={0.3}
                        />
                      )}
                      {typeof entry.high === 'number' && typeof entry.low === 'number' && (
                        <Bar
                          dataKey="open"
                          yAxisId={0}
                          fill={color}
                          stroke={color}
                          strokeWidth={1}
                          shape={(props) => {
                            const { x, width } = props;
                            return (
                              <g>
                                <rect
                                  x={x - width / 2}
                                  y={y}
                                  width={width}
                                  height={barHeight || 1}
                                  fill={color}
                                />
                                <line
                                  x1={x}
                                  y1={entry.low}
                                  x2={x}
                                  y2={entry.high}
                                  stroke={color}
                                  strokeWidth={1}
                                />
                              </g>
                            );
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography
              variant="body2"
              color={parseFloat(calculateGainLoss()) >= 0 ? 'success.main' : 'error.main'}
            >
              {calculateGainLoss()}%
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StockMarketTrends;