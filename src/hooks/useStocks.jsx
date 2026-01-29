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
  const [realTimeData, setRealTimeData] = useState({});
  const [portfolio, setPortfolio] = useState([]);
  const [marketStatus, setMarketStatus] = useState({
    isOpen: false,
    nextOpen: 'Tomorrow 9:15 AM',
    nextClose: '3:30 PM'
  });
  const [backendConnected, setBackendConnected] = useState(false);

  const safeToFixed = (value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return '0.00';
    }
    return Number(value).toFixed(decimals);
  };

  // Check backend connection first
  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`);
      const data = await response.json();
      setBackendConnected(response.ok && data.status === 'online');
      return response.ok && data.status === 'online';
    } catch (err) {
      console.error('Backend connection failed:', err);
      setBackendConnected(false);
      return false;
    }
  };

  // Load stocks from backend - REAL DATA
  const loadStocks = async () => {
    if (!backendConnected) {
      console.log('Backend not connected, skipping stock load');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First try AI signals endpoint
      let response = await tradingAPI.getAISignals();
      
      if (response && response.success) {
        // Handle different response formats
        let stockList = [];
        
        if (Array.isArray(response.signals)) {
          stockList = response.signals;
        } else if (response.data && Array.isArray(response.data)) {
          stockList = response.data;
        } else if (Array.isArray(response)) {
          stockList = response;
        }
        
        // If we got stocks, set them
        if (stockList.length > 0) {
          console.log(`✅ Loaded ${stockList.length} stocks from backend`);
          setStocks(stockList);
          
          // Also get real-time data for these stocks
          const symbols = stockList.map(s => s.symbol).join(',');
          if (symbols) {
            const realTimeResponse = await marketAPI.getLiveData(symbols);
            if (realTimeResponse && realTimeResponse.success && realTimeResponse.data) {
              setRealTimeData(realTimeResponse.data);
            }
          }
        } else {
          // If no AI signals, try top gainers
          console.log('No AI signals, trying top gainers...');
          const topGainersResponse = await marketAPI.getTopGainers();
          if (topGainersResponse && topGainersResponse.success && topGainersResponse.data) {
            setStocks(topGainersResponse.data);
          } else {
            // Fallback to default stocks
            const defaultSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];
            const promises = defaultSymbols.map(symbol => marketAPI.getStockSignal(symbol));
            const results = await Promise.all(promises);
            
            const validStocks = results.filter(r => r && r.success).map(r => ({
              symbol: r.symbol,
              name: r.symbol,
              currentPrice: r.market_data?.last_price || 0,
              changePercent: r.market_data?.change || 0,
              signal: r.ai_signal?.action || 'neutral',
              confidence: r.ai_signal?.confidence || '0%',
              volume: r.market_data?.volume || 0,
              high: r.market_data?.high || 0,
              low: r.market_data?.low || 0
            }));
            
            setStocks(validStocks);
          }
        }
      } else {
        console.warn('AI signals endpoint returned no data');
        // Set empty array to show no data message
        setStocks([]);
      }
    } catch (err) {
      console.error('❌ Stocks loading error:', err);
      setError('Failed to load stocks from backend. Please try again.');
      setStocks([]);
      setRealTimeData({});
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      const response = await portfolioAPI.getAnalytics();
      if (response && response.success && response.portfolio) {
        setPortfolio(response.portfolio.holdings || []);
      } else {
        setPortfolio([]);
      }
    } catch (error) {
      console.error('Portfolio error:', error);
      setPortfolio([]);
    }
  };

  const checkMarketStatus = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const day = now.getDay();
    
    // Indian Market Hours: 9:15 AM to 3:30 PM, Monday to Friday
    const isWeekday = day >= 1 && day <= 5;
    const currentTime = hour * 60 + minute;
    const marketOpenTime = 9 * 60 + 15; // 9:15 AM
    const marketCloseTime = 15 * 60 + 30; // 3:30 PM
    
    setMarketStatus({
      isOpen: isWeekday && currentTime >= marketOpenTime && currentTime <= marketCloseTime,
      nextOpen: !isWeekday ? 'Monday 9:15 AM' : (currentTime < marketOpenTime ? 'Today 9:15 AM' : 'Tomorrow 9:15 AM'),
      nextClose: '3:30 PM'
    });
  }, []);

  const calculatePortfolioStats = useCallback(() => {
    try {
      // If we have portfolio data from backend, use it
      if (portfolio.length > 0) {
        const portfolioData = portfolio[0]; // Assuming first item has summary
        return {
          currentValue: portfolioData.totalValue || 0,
          investedValue: portfolioData.investedValue || 0,
          returns: (portfolioData.totalValue || 0) - (portfolioData.investedValue || 0),
          returnsPercent: portfolioData.returnsPercent || 0,
          dailyPnL: portfolioData.dailyPnL || 0,
          holdingsCount: portfolioData.holdingsCount || 0,
          activeTrades: portfolioData.activeTrades || 0,
          winRate: portfolioData.winRate || '0%'
        };
      }

      // Fallback calculation from real-time data
      const calculatePortfolioValue = () => {
        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) return 0;
        
        return stocks.reduce((total, stock) => {
          if (!stock) return total;
          
          const currentPrice = realTimeData[stock.symbol]?.price || stock.currentPrice || stock.market_data?.last_price || 0;
          const quantity = stock.quantity || 100; // Default quantity
          return total + (currentPrice * quantity);
        }, 0);
      };

      const calculateDailyPnL = () => {
        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) return 0;
        
        let totalPnL = 0;
        stocks.forEach(stock => {
          if (!stock) return;
          
          const currentPrice = realTimeData[stock.symbol]?.price || stock.currentPrice || stock.market_data?.last_price || 0;
          const previousClose = stock.previousClose || currentPrice * 0.98; // Estimate
          const quantity = stock.quantity || 100;
          const pnl = (currentPrice - previousClose) * quantity;
          totalPnL += pnl;
        });
        return totalPnL;
      };

      const currentValue = calculatePortfolioValue();
      const dailyPnL = calculateDailyPnL();
      
      const investment = stocks.reduce((total, stock) => {
        if (!stock) return total;
        const avgPrice = stock.averagePrice || (stock.currentPrice || stock.market_data?.last_price || 0) * 0.95;
        const quantity = stock.quantity || 100;
        return total + (avgPrice * quantity);
      }, 0);
      
      const returns = currentValue - investment;
      const returnsPercent = investment > 0 ? (returns / investment) * 100 : 0;

      const totalTrades = stocks.length;
      const winningTrades = stocks.filter(s => {
        const change = s.changePercent || s.market_data?.change || 0;
        return change > 0;
      }).length;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

      return {
        currentValue: parseFloat(safeToFixed(currentValue, 0)),
        investedValue: parseFloat(safeToFixed(investment, 0)),
        returns: parseFloat(safeToFixed(returns, 0)),
        returnsPercent: parseFloat(safeToFixed(returnsPercent, 2)),
        dailyPnL: parseFloat(safeToFixed(dailyPnL, 0)),
        holdingsCount: Array.isArray(stocks) ? stocks.length : 0,
        activeTrades: Array.isArray(stocks) ? stocks.filter(s => 
          s?.status === 'ACTIVE' || s?.status === 'open' || s?.signal === 'buy' || s?.signal === 'strong_buy'
        ).length : 0,
        winRate: `${safeToFixed(winRate, 1)}%`
      };
    } catch (error) {
      console.error('Portfolio stats error:', error);
      return {
        currentValue: 0,
        investedValue: 0,
        returns: 0,
        returnsPercent: 0,
        dailyPnL: 0,
        holdingsCount: 0,
        activeTrades: 0,
        winRate: '0%'
      };
    }
  }, [portfolio, stocks, realTimeData]);

  // Initialize and load data
  useEffect(() => {
    const initializeData = async () => {
      const connected = await checkBackendConnection();
      if (connected) {
        await loadStocks();
        await loadPortfolio();
      } else {
        setError('Backend is not connected. Please check your internet connection or try again later.');
        setLoading(false);
      }
      checkMarketStatus();
    };

    initializeData();
    
    // Auto-refresh every 30 seconds if backend is connected
    let interval;
    if (backendConnected) {
      interval = setInterval(() => {
        loadStocks();
        loadPortfolio();
        checkMarketStatus();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [backendConnected]);

  const refreshStocks = async () => {
    await loadStocks();
    await loadPortfolio();
    checkMarketStatus();
  };

  const getTopMovers = () => {
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return { gainers: [], losers: [] };
    }
    
    // Calculate change percent for each stock
    const withChange = stocks.map(stock => {
      const change = stock.changePercent || stock.market_data?.change || 0;
      const changePercent = typeof change === 'number' ? change : parseFloat(change) || 0;
      
      return {
        ...stock,
        symbol: stock.symbol || 'N/A',
        name: stock.name || stock.symbol || 'Unknown',
        currentPrice: stock.currentPrice || stock.market_data?.last_price || 0,
        changePercent: changePercent
      };
    }).filter(stock => !isNaN(stock.changePercent));
    
    // Sort by change percent
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

  const value = {
    stocks: stocks || [],
    portfolio: portfolio || [],
    realTimeData: realTimeData || {},
    loading,
    error,
    marketStatus,
    backendConnected,
    
    portfolioStats: calculatePortfolioStats(),
    
    refreshStocks,
    getStockDetails: async (symbol) => {
      try {
        const response = await marketAPI.getStockSignal(symbol);
        if (response && response.success) {
          return response;
        }
        return null;
      } catch (error) {
        console.error('Error fetching stock details:', error);
        return null;
      }
    },
    getStockPrice: (symbol) => {
      return realTimeData[symbol]?.price || 0;
    },
    
    getTopMovers,
    
    safeToFixed,
    checkBackendConnection
  };

  return (
    <StocksContext.Provider value={value}>
      {children}
    </StocksContext.Provider>
  );
};
