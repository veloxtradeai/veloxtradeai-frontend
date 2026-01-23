import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Import the API

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

  // Load initial data
  useEffect(() => {
    loadStocks();
    loadPortfolio();
    loadWatchlist();
    checkMarketStatus();
    
    // Setup WebSocket for real-time updates
    const cleanup = api.setupWebSocket((data) => {
      if (data.type === 'price_update' && data.symbol) {
        setRealTimeData(prev => ({
          ...prev,
          [data.symbol]: {
            ...prev[data.symbol],
            price: data.price,
            changePercent: data.changePercent,
            lastUpdated: data.timestamp
          }
        }));
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const checkMarketStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Market hours: 9:15 AM to 3:30 PM, Monday to Friday
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
      // Use the API from api.js
      const result = await api.trading.getAIScreener();
      
      if (result.success && result.recommendations) {
        const stocksData = result.recommendations.map(stock => ({
          ...stock,
          currentPrice: stock.currentPrice || 0,
          changePercent: stock.changePercent || 0,
          signal: stock.signal || 'neutral',
          confidence: stock.confidence || 75,
          riskLevel: stock.riskLevel || 'medium',
          timeFrame: stock.timeFrame || 'swing'
        }));
        
        setStocks(stocksData);
        
        // Initialize real-time data
        const initialRealTimeData = {};
        stocksData.forEach(stock => {
          initialRealTimeData[stock.symbol] = {
            price: stock.currentPrice,
            changePercent: stock.changePercent,
            lastUpdated: new Date().toISOString()
          };
        });
        
        setRealTimeData(initialRealTimeData);
      } else {
        // Fallback to mock data structure if API returns different format
        console.warn('API returned unexpected format, using fallback data');
        const fallbackStocks = [
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
        
        setStocks(fallbackStocks);
        
        const fallbackRealTimeData = {};
        fallbackStocks.forEach(stock => {
          fallbackRealTimeData[stock.symbol] = {
            price: stock.currentPrice,
            changePercent: stock.changePercent,
            lastUpdated: new Date().toISOString()
          };
        });
        
        setRealTimeData(fallbackRealTimeData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load stocks');
      console.error('Stock loading error:', err);
      
      // Set empty state on error
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      // Try to load from API first
      const result = await api.portfolio.getAnalytics();
      
      if (result.success && result.portfolio) {
        // If API returns portfolio data, use it
        const portfolioData = {
          holdings: result.portfolio.holdings || [],
          stats: result.portfolio
        };
        
        localStorage.setItem('velox_portfolio', JSON.stringify(portfolioData));
        setPortfolio(portfolioData.holdings || []);
      } else {
        // Fallback to localStorage
        const portfolioData = JSON.parse(localStorage.getItem('velox_portfolio') || '{"holdings": [], "stats": {}}');
        setPortfolio(portfolioData.holdings || []);
      }
    } catch (error) {
      console.error('Portfolio loading error:', error);
      // Fallback to localStorage
      const portfolioData = JSON.parse(localStorage.getItem('velox_portfolio') || '{"holdings": [], "stats": {}}');
      setPortfolio(portfolioData.holdings || []);
    }
  };

  const loadWatchlist = async () => {
    try {
      // Load from localStorage
      const watchlistData = JSON.parse(localStorage.getItem('velox_watchlist') || '[]');
      setWatchlist(watchlistData);
    } catch (error) {
      console.error('Watchlist loading error:', error);
      setWatchlist([]);
    }
  };

  const updateRealTimePrices = async () => {
    if (!stocks.length || !marketStatus.isOpen) return;
    
    try {
      const symbols = stocks.slice(0, 20).map(s => s.symbol);
      const result = await api.market.getLiveData(symbols.join(','));
      
      if (result.success && result.recommendations) {
        setRealTimeData(prev => {
          const updated = { ...prev };
          result.recommendations.forEach(stock => {
            updated[stock.symbol] = {
              ...prev[stock.symbol],
              price: stock.currentPrice,
              changePercent: stock.changePercent,
              lastUpdated: new Date().toISOString()
            };
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Real-time update error:', error);
      // Fallback to simulated updates
      simulateRealTimeUpdates();
    }
  };

  const simulateRealTimeUpdates = () => {
    setRealTimeData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(symbol => {
        const current = updated[symbol];
        if (current && current.price) {
          const change = (Math.random() - 0.5) * 0.02; // ±2%
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
    try {
      const result = await api.market.getStockData(symbol);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error('Failed to fetch stock details');
    } catch (err) {
      console.error('Failed to get stock details:', err);
      // Return from local data
      const stock = stocks.find(s => s.symbol === symbol);
      return stock || {
        symbol,
        name: symbol,
        currentPrice: realTimeData[symbol]?.price || 0,
        changePercent: realTimeData[symbol]?.changePercent || 0,
      };
    }
  };

  const addToWatchlist = async (stock) => {
    try {
      const updatedWatchlist = [...watchlist, stock];
      setWatchlist(updatedWatchlist);
      
      // Save to localStorage
      localStorage.setItem('velox_watchlist', JSON.stringify(updatedWatchlist));
      
      return { success: true };
    } catch (error) {
      console.error('Add to watchlist error:', error);
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
      console.error('Remove from watchlist error:', error);
      return { success: false, error: error.message };
    }
  };

  const isInWatchlist = (symbol) => {
    return watchlist.some(stock => stock.symbol === symbol);
  };

  const getStockPrice = (symbol) => {
    return realTimeData[symbol]?.price || 0;
  };

  const calculatePortfolioValue = () => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = getStockPrice(holding.symbol) || holding.averagePrice || 0;
      return total + (currentPrice * (holding.quantity || 0));
    }, 0);
  };

  const calculateDailyPnL = () => {
    let totalPnL = 0;
    
    portfolio.forEach(holding => {
      const currentPrice = getStockPrice(holding.symbol) || holding.averagePrice || 0;
      const pnl = (currentPrice - (holding.averagePrice || 0)) * (holding.quantity || 0);
      totalPnL += pnl;
    });
    
    return totalPnL;
  };

  const calculateTotalInvestment = () => {
    return portfolio.reduce((total, holding) => {
      return total + ((holding.averagePrice || 0) * (holding.quantity || 0));
    }, 0);
  };

  const calculateTotalReturns = () => {
    const currentValue = calculatePortfolioValue();
    const investment = calculateTotalInvestment();
    return currentValue - investment;
  };

  const calculateReturnsPercentage = () => {
    const investment = calculateTotalInvestment();
    if (investment === 0) return 0;
    const returns = calculateTotalReturns();
    return (returns / investment) * 100;
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
        tradeType: tradeData.tradeType || 'INTRADAY',
        stopLoss: tradeData.stopLoss,
        target: tradeData.targetPrice || tradeData.target,
        status: 'ACTIVE'
      };
      
      const updatedPortfolio = [...portfolio, newHolding];
      setPortfolio(updatedPortfolio);
      
      // Update localStorage
      const portfolioData = {
        holdings: updatedPortfolio,
        lastUpdated: new Date().toISOString(),
        totalValue: calculatePortfolioValue()
      };
      localStorage.setItem('velox_portfolio', JSON.stringify(portfolioData));
      
      // Try to save to API
      try {
        await api.trade.addTrade({
          ...tradeData,
          status: 'open'
        });
      } catch (apiError) {
        console.warn('Failed to save trade to API, using localStorage only:', apiError);
      }
      
      return { success: true, holding: newHolding };
    } catch (error) {
      console.error('Add to portfolio error:', error);
      return { success: false, error: error.message };
    }
  };

  const removeFromPortfolio = async (holdingId, exitData) => {
    try {
      const holding = portfolio.find(h => h.id === holdingId);
      if (!holding) {
        return { success: false, error: 'Holding not found' };
      }
      
      const updatedPortfolio = portfolio.filter(h => h.id !== holdingId);
      setPortfolio(updatedPortfolio);
      
      // Update localStorage
      const portfolioData = {
        holdings: updatedPortfolio,
        lastUpdated: new Date().toISOString(),
        totalValue: calculatePortfolioValue()
      };
      localStorage.setItem('velox_portfolio', JSON.stringify(portfolioData));
      
      // Calculate P&L
      const pnl = ((exitData.exitPrice || 0) - (holding.averagePrice || 0)) * (holding.quantity || 0);
      const pnlPercent = holding.averagePrice ? 
        (((exitData.exitPrice || 0) - holding.averagePrice) / holding.averagePrice) * 100 : 0;
      
      // Try to update in API
      try {
        await api.trade.closeTrade(holdingId);
      } catch (apiError) {
        console.warn('Failed to update trade in API:', apiError);
      }
      
      return { 
        success: true, 
        pnl: parseFloat(pnl.toFixed(2)), 
        pnlPercent: parseFloat(pnlPercent.toFixed(2)) 
      };
    } catch (error) {
      console.error('Remove from portfolio error:', error);
      return { success: false, error: error.message };
    }
  };

  const getTradesHistory = (limit = 50) => {
    const trades = JSON.parse(localStorage.getItem('velox_trades') || '[]');
    return trades.slice(-limit).reverse();
  };

  const getPortfolioStats = () => {
    const currentValue = calculatePortfolioValue();
    const investment = calculateTotalInvestment();
    const returns = calculateTotalReturns();
    const returnsPercent = calculateReturnsPercentage();
    const dailyPnL = calculateDailyPnL();
    
    return {
      currentValue: parseFloat(currentValue.toFixed(2)),
      investment: parseFloat(investment.toFixed(2)),
      returns: parseFloat(returns.toFixed(2)),
      returnsPercent: parseFloat(returnsPercent.toFixed(2)),
      dailyPnL: parseFloat(dailyPnL.toFixed(2)),
      holdingsCount: portfolio.length,
      activeTrades: portfolio.filter(h => h.status === 'ACTIVE').length
    };
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
    
    // Portfolio calculations
    portfolioValue: calculatePortfolioValue(),
    dailyPnL: calculateDailyPnL(),
    portfolioStats: getPortfolioStats(),
    
    // Methods
    refreshStocks,
    getStockDetails,
    getStockPrice,
    updateRealTimePrices,
    
    // Watchlist
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    
    // Portfolio management
    addToPortfolio,
    removeFromPortfolio,
    getTradesHistory,
    getPortfolioStats
  };

  return (
    <StocksContext.Provider value={value}>
      {children}
    </StocksContext.Provider>
  );
};
