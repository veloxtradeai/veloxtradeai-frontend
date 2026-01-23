import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tradingAPI, portfolioAPI, marketAPI } from '../services/api';

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

  const safeToFixed = (value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return '0.00';
    }
    return Number(value).toFixed(decimals);
  };

  const loadStocks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await tradingAPI.getAIScreener();
      
      if (response && response.success && response.recommendations) {
        setStocks(response.recommendations);
        
        const initialRealTimeData = {};
        response.recommendations.forEach(stock => {
          if (stock && stock.symbol) {
            initialRealTimeData[stock.symbol] = {
              price: stock.currentPrice || 0,
              changePercent: stock.changePercent || 0,
              lastUpdated: new Date().toISOString()
            };
          }
        });
        setRealTimeData(initialRealTimeData);
      } else {
        setStocks([]);
        setRealTimeData({});
      }
    } catch (err) {
      console.error('Stocks loading error:', err);
      setError('Failed to load stocks from backend');
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
    const day = now.getDay();
    
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHour = (hour >= 9 && hour < 15) || (hour === 15 && now.getMinutes() < 30);
    
    setMarketStatus({
      isOpen: isWeekday && isMarketHour,
      nextOpen: !isWeekday ? 'Monday 9:15 AM' : 'Tomorrow 9:15 AM',
      nextClose: '3:30 PM'
    });
  }, []);

  const calculatePortfolioStats = useCallback(() => {
    try {
      const calculatePortfolioValue = () => {
        if (!portfolio || !Array.isArray(portfolio) || portfolio.length === 0) return 0;
        
        return portfolio.reduce((total, holding) => {
          if (!holding) return total;
          
          const currentPrice = realTimeData[holding.symbol]?.price || holding.averagePrice || 0;
          const quantity = holding.quantity || 0;
          return total + (currentPrice * quantity);
        }, 0);
      };

      const calculateDailyPnL = () => {
        if (!portfolio || !Array.isArray(portfolio) || portfolio.length === 0) return 0;
        
        let totalPnL = 0;
        portfolio.forEach(holding => {
          if (!holding) return;
          
          const currentPrice = realTimeData[holding.symbol]?.price || holding.averagePrice || 0;
          const averagePrice = holding.averagePrice || 0;
          const quantity = holding.quantity || 0;
          const pnl = (currentPrice - averagePrice) * quantity;
          totalPnL += pnl;
        });
        return totalPnL;
      };

      const currentValue = calculatePortfolioValue();
      const dailyPnL = calculateDailyPnL();
      
      const investment = portfolio.reduce((total, holding) => {
        if (!holding) return total;
        return total + ((holding.averagePrice || 0) * (holding.quantity || 0));
      }, 0);
      
      const returns = currentValue - investment;
      const returnsPercent = investment > 0 ? (returns / investment) * 100 : 0;

      const totalTrades = portfolio.length;
      const winningTrades = portfolio.filter(h => (h.pnl || 0) > 0).length;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

      return {
        currentValue: parseFloat(safeToFixed(currentValue, 0)),
        investedValue: parseFloat(safeToFixed(investment, 0)),
        returns: parseFloat(safeToFixed(returns, 0)),
        returnsPercent: parseFloat(safeToFixed(returnsPercent, 2)),
        dailyPnL: parseFloat(safeToFixed(dailyPnL, 0)),
        holdingsCount: Array.isArray(portfolio) ? portfolio.length : 0,
        activeTrades: Array.isArray(portfolio) ? portfolio.filter(h => 
          h?.status === 'ACTIVE' || h?.status === 'open'
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
  }, [portfolio, realTimeData]);

  useEffect(() => {
    loadStocks();
    loadPortfolio();
    checkMarketStatus();
    
    const interval = setInterval(() => {
      checkMarketStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkMarketStatus]);

  const refreshStocks = async () => {
    await loadStocks();
    await loadPortfolio();
  };

  const getTopMovers = () => {
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return { gainers: [], losers: [] };
    }
    
    const withChange = stocks.map(stock => ({
      ...stock,
      change: stock.changePercent || 0
    }));
    
    const sorted = [...withChange].sort((a, b) => (b.change || 0) - (a.change || 0));
    
    return {
      gainers: sorted.slice(0, 3),
      losers: sorted.slice(-3).reverse()
    };
  };

  const value = {
    stocks: stocks || [],
    portfolio: portfolio || [],
    realTimeData: realTimeData || {},
    loading,
    error,
    marketStatus,
    
    portfolioStats: calculatePortfolioStats(),
    
    refreshStocks,
    getStockDetails: async (symbol) => {
      const stock = stocks.find(s => s.symbol === symbol);
      return stock || null;
    },
    getStockPrice: (symbol) => {
      return realTimeData[symbol]?.price || 0;
    },
    
    getTopMovers,
    
    safeToFixed
  };

  return (
    <StocksContext.Provider value={value}>
      {children}
    </StocksContext.Provider>
  );
};
