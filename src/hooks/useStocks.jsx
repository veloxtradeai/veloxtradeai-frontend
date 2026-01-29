import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { marketAPI, tradingAPI, portfolioAPI } from '../services/api';

const StocksContext = createContext();

export const useStocks = () => {
  const context = useContext(StocksContext);
  if (!context) {
    throw new Error('useStocks must be used within a StocksProvider');
  }
  return context;
};

export const StocksProvider = ({ children }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketStatus, setMarketStatus] = useState({
    isOpen: false,
    nextOpen: 'Tomorrow 9:15 AM',
    nextClose: '3:30 PM'
  });
  const [backendConnected, setBackendConnected] = useState(false);
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    dailyPnL: 0,
    winRate: '0%',
    activeTrades: 0,
    holdingsCount: 0
  });

  // Check backend connection
  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`);
      const data = await response.json();
      const connected = response.ok && data.status === 'online';
      setBackendConnected(connected);
      return connected;
    } catch (err) {
      console.error('Backend connection failed:', err);
      setBackendConnected(false);
      return false;
    }
  };

  // Load REAL stocks from backend
  const loadStocks = async () => {
    if (!backendConnected) {
      console.log('Backend not connected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try AI signals first
      const signalsResponse = await tradingAPI.getAISignals();
      
      if (signalsResponse && signalsResponse.success && signalsResponse.data && signalsResponse.data.length > 0) {
        console.log(`✅ Loaded ${signalsResponse.data.length} AI signals`);
        setStocks(signalsResponse.data);
      } else {
        // Fallback to top gainers
        const gainersResponse = await marketAPI.getTopGainers();
        
        if (gainersResponse && gainersResponse.success && gainersResponse.gainers) {
          // Format gainers as stocks
          const formattedStocks = gainersResponse.gainers.map(gainer => ({
            symbol: gainer.symbol,
            name: gainer.symbol,
            currentPrice: gainer.last_price || 0,
            changePercent: gainer.change_percent || 0,
            signal: 'buy',
            confidence: '85%',
            volume: gainer.volume || 0,
            high: gainer.high || 0,
            low: gainer.low || 0
          }));
          
          console.log(`✅ Loaded ${formattedStocks.length} gainers`);
          setStocks(formattedStocks);
        } else {
          // No data available
          console.log('No stock data available');
          setStocks([]);
        }
      }
    } catch (err) {
      console.error('Stocks loading error:', err);
      setError('Failed to load stocks');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load REAL portfolio
  const loadPortfolio = async () => {
    try {
      const response = await portfolioAPI.getAnalytics();
      if (response && response.success && response.portfolio) {
        setPortfolioData({
          totalValue: response.portfolio.totalValue || 0,
          dailyPnL: response.portfolio.dailyPnL || 0,
          winRate: response.portfolio.winRate || '0%',
          activeTrades: response.portfolio.activeTrades || 0,
          holdingsCount: response.portfolio.holdingsCount || 0
        });
      }
    } catch (error) {
      console.error('Portfolio error:', error);
    }
  };

  // Check market status
  const checkMarketStatus = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const day = now.getDay();
    
    const isWeekday = day >= 1 && day <= 5;
    const currentTime = hour * 60 + minute;
    const marketOpenTime = 9 * 60 + 15;
    const marketCloseTime = 15 * 60 + 30;
    
    setMarketStatus({
      isOpen: isWeekday && currentTime >= marketOpenTime && currentTime <= marketCloseTime,
      nextOpen: !isWeekday ? 'Monday 9:15 AM' : (currentTime < marketOpenTime ? 'Today 9:15 AM' : 'Tomorrow 9:15 AM'),
      nextClose: '3:30 PM'
    });
  }, []);

  // Get top movers
  const getTopMovers = () => {
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return { gainers: [], losers: [] };
    }
    
    const withChange = stocks.map(stock => ({
      ...stock,
      changePercent: parseFloat(stock.changePercent) || 0
    })).filter(stock => !isNaN(stock.changePercent));
    
    const sorted = [...withChange].sort((a, b) => b.changePercent - a.changePercent);
    
    return {
      gainers: sorted.slice(0, 3).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        changePercent: stock.changePercent
      })),
      losers: sorted.slice(-3).reverse().map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        changePercent: stock.changePercent
      }))
    };
  };

  // Initialize
  useEffect(() => {
    const initializeData = async () => {
      const connected = await checkBackendConnection();
      if (connected) {
        await loadStocks();
        await loadPortfolio();
      } else {
        setError('Backend is not connected');
        setLoading(false);
      }
      checkMarketStatus();
    };

    initializeData();
    
    // Auto-refresh
    let interval;
    if (backendConnected) {
      interval = setInterval(() => {
        loadStocks();
        loadPortfolio();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [backendConnected]);

  const refreshStocks = async () => {
    await loadStocks();
    await loadPortfolio();
  };

  const value = {
    stocks: stocks || [],
    loading,
    error,
    marketStatus,
    backendConnected,
    
    portfolioStats: portfolioData,
    
    refreshStocks,
    getTopMovers
  };

  return (
    <StocksContext.Provider value={value}>
      {children}
    </StocksContext.Provider>
  );
};
