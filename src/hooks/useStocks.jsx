import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState({});
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [marketStatus, setMarketStatus] = useState({
    isOpen: false,
    nextOpen: 'Tomorrow 9:15 AM',
    nextClose: '3:30 PM'
  });

  // Calculate portfolio stats with default values
  const calculatePortfolioStats = useCallback(() => {
    const calculatePortfolioValue = () => {
      if (!portfolio || !portfolio.length) return 0;
      return portfolio.reduce((total, holding) => {
        const currentPrice = realTimeData[holding.symbol]?.price || holding.averagePrice || 0;
        const quantity = holding.quantity || 0;
        return total + (currentPrice * quantity);
      }, 0);
    };

    const calculateDailyPnL = () => {
      if (!portfolio || !portfolio.length) return 0;
      let totalPnL = 0;
      portfolio.forEach(holding => {
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
      return total + ((holding.averagePrice || 0) * (holding.quantity || 0));
    }, 0);
    
    const returns = currentValue - investment;
    const returnsPercent = investment > 0 ? (returns / investment) * 100 : 0;

    return {
      currentValue: parseFloat(currentValue.toFixed(2)),
      investment: parseFloat(investment.toFixed(2)),
      returns: parseFloat(returns.toFixed(2)),
      returnsPercent: parseFloat(returnsPercent.toFixed(2)),
      dailyPnL: parseFloat(dailyPnL.toFixed(2)),
      holdingsCount: portfolio.length,
      activeTrades: portfolio.filter(h => h.status === 'ACTIVE').length
    };
  }, [portfolio, realTimeData]);

  // Load initial data
  useEffect(() => {
    loadStocks();
    loadPortfolio();
    loadWatchlist();
    checkMarketStatus();
    
    // Setup real-time updates
    const interval = setInterval(() => {
      if (marketStatus.isOpen) {
        updateRealTimePrices();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkMarketStatus = () => {
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
  };

  const loadStocks = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.trading.getAIScreener();
      
      // Use mock data since backend returns 404
      const mockStocks = [
        { 
          symbol: 'RELIANCE', 
          name: 'Reliance Industries Ltd', 
          currentPrice: 2800.50, 
          changePercent: 2.5, 
          signal: 'strong_buy',
          riskLevel: 'medium',
          timeFrame: 'swing',
          confidence: 85
        },
        { 
          symbol: 'TCS', 
          name: 'Tata Consultancy Services Ltd', 
          currentPrice: 3800.75, 
          changePercent: 1.8, 
          signal: 'buy',
          riskLevel: 'low',
          timeFrame: 'positional',
          confidence: 78
        },
        { 
          symbol: 'HDFCBANK', 
          name: 'HDFC Bank Ltd', 
          currentPrice: 1650.25, 
          changePercent: -0.5, 
          signal: 'neutral',
          riskLevel: 'low',
          timeFrame: 'intraday',
          confidence: 65
        },
        { 
          symbol: 'INFY', 
          name: 'Infosys Ltd', 
          currentPrice: 1550.80, 
          changePercent: 3.2, 
          signal: 'buy',
          riskLevel: 'medium',
          timeFrame: 'swing',
          confidence: 82
        }
      ];
      
      setStocks(mockStocks);
      
      const initialRealTimeData = {};
      mockStocks.forEach(stock => {
        initialRealTimeData[stock.symbol] = {
          price: stock.currentPrice,
          changePercent: stock.changePercent,
          lastUpdated: new Date().toISOString()
        };
      });
      
      setRealTimeData(initialRealTimeData);
      
    } catch (err) {
      console.log('Using mock stocks data');
      const mockStocks = [
        { 
          symbol: 'RELIANCE', 
          name: 'Reliance Industries Ltd', 
          currentPrice: 2800.50, 
          changePercent: 2.5, 
          signal: 'strong_buy',
          riskLevel: 'medium',
          timeFrame: 'swing',
          confidence: 85
        }
      ];
      setStocks(mockStocks);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      const portfolioData = JSON.parse(localStorage.getItem('velox_portfolio') || '{"holdings": []}');
      setPortfolio(portfolioData.holdings || []);
    } catch (error) {
      console.error('Portfolio loading error:', error);
      setPortfolio([]);
    }
  };

  const loadWatchlist = async () => {
    try {
      const watchlistData = JSON.parse(localStorage.getItem('velox_watchlist') || '[]');
      setWatchlist(watchlistData);
    } catch (error) {
      console.error('Watchlist loading error:', error);
      setWatchlist([]);
    }
  };

  const updateRealTimePrices = async () => {
    if (!stocks.length || !marketStatus.isOpen) return;
    
    // Simulate price updates for demo
    setRealTimeData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(symbol => {
        const current = updated[symbol];
        if (current && current.price) {
          const change = (Math.random() - 0.5) * 0.02;
          const newPrice = current.price * (1 + change);
          
          updated[symbol] = {
            ...current,
            price: parseFloat(newPrice.toFixed(2)),
            changePercent: parseFloat((change * 100).toFixed(2)),
            lastUpdated: new Date().toISOString()
          };
        }
      });
      return updated;
    });
  };

  const refreshStocks = async () => {
    await loadStocks();
  };

  const getStockDetails = async (symbol) => {
    const stock = stocks.find(s => s.symbol === symbol);
    return stock || {
      symbol,
      name: symbol,
      currentPrice: realTimeData[symbol]?.price || 0,
      changePercent: realTimeData[symbol]?.changePercent || 0,
    };
  };

  const getStockPrice = (symbol) => {
    return realTimeData[symbol]?.price || 0;
  };

  const addToWatchlist = async (stock) => {
    try {
      const updatedWatchlist = [...watchlist, stock];
      setWatchlist(updatedWatchlist);
      localStorage.setItem('velox_watchlist', JSON.stringify(updatedWatchlist));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      const updatedWatchlist = watchlist.filter(stock => stock.symbol !== symbol);
      setWatchlist(updatedWatchlist);
      localStorage.setItem('velox_watchlist', JSON.stringify(updatedWatchlist));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const isInWatchlist = (symbol) => {
    return watchlist.some(stock => stock.symbol === symbol);
  };

  const addToPortfolio = async (tradeData) => {
    try {
      const newHolding = {
        id: `HOLD_${Date.now()}`,
        symbol: tradeData.stockSymbol || tradeData.symbol,
        name: tradeData.stockName || tradeData.name,
        quantity: tradeData.quantity || 0,
        averagePrice: tradeData.entryPrice || tradeData.price || 0,
        entryDate: new Date().toISOString(),
        status: 'ACTIVE'
      };
      
      const updatedPortfolio = [...portfolio, newHolding];
      setPortfolio(updatedPortfolio);
      
      localStorage.setItem('velox_portfolio', JSON.stringify({ holdings: updatedPortfolio }));
      return { success: true, holding: newHolding };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeFromPortfolio = async (holdingId) => {
    try {
      const updatedPortfolio = portfolio.filter(h => h.id !== holdingId);
      setPortfolio(updatedPortfolio);
      localStorage.setItem('velox_portfolio', JSON.stringify({ holdings: updatedPortfolio }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    // Data
    stocks,
    portfolio,
    watchlist,
    realTimeData,
    loading,
    error,
    marketStatus,
    
    // Portfolio calculations - FIXED: Now returning proper object
    portfolioStats: calculatePortfolioStats(),
    
    // Methods
    refreshStocks,
    getStockDetails,
    getStockPrice,
    
    // Watchlist
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    
    // Portfolio management
    addToPortfolio,
    removeFromPortfolio
  };

  return (
    <StocksContext.Provider value={value}>
      {children}
    </StocksContext.Provider>
  );
};
