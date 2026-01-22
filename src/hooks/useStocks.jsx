import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import config from '../config';

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
    nextOpen: '',
    nextClose: ''
  });

  // Load initial data
  useEffect(() => {
    loadStocks();
    loadPortfolio();
    loadWatchlist();
    checkMarketStatus();
    
    // Setup real-time updates
    const realTimeInterval = setInterval(() => {
      updateRealTimePrices();
    }, 30000); // Every 30 seconds

    return () => clearInterval(realTimeInterval);
  }, []);

  const checkMarketStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Market hours: 9:15 AM to 3:30 PM, Monday to Friday
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHour = hour >= 9 && hour < 15 || (hour === 15 && now.getMinutes() < 30);
    
    setMarketStatus({
      isOpen: isWeekday && isMarketHour,
      nextOpen: !isWeekday ? 'Monday 9:15 AM' : '',
      nextClose: '3:30 PM'
    });
  };

  const loadStocks = async () => {
    setLoading(true);
    setError(null);

    try {
      // REAL API CALL - Replace with actual endpoint
      const response = await fetch(`${config.API_BASE_URL}/stocks/recommendations`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          const stocksWithRealTime = result.data.map(stock => ({
            ...stock,
            currentPrice: stock.price || 0,
            change: stock.change || 0,
            changePercent: stock.changePercent || 0,
            volume: stock.volume || 0,
            marketCap: stock.marketCap || 0,
            signal: calculateSignal(stock),
            confidence: calculateConfidence(stock),
            riskLevel: calculateRiskLevel(stock)
          }));
          
          setStocks(stocksWithRealTime);
          
          // Initialize real-time data
          const initialRealTimeData = {};
          stocksWithRealTime.forEach(stock => {
            initialRealTimeData[stock.symbol] = {
              price: stock.currentPrice,
              change: stock.change,
              changePercent: stock.changePercent,
              volume: stock.volume,
              high: stock.high || stock.currentPrice * 1.02,
              low: stock.low || stock.currentPrice * 0.98,
              open: stock.open || stock.currentPrice,
              prevClose: stock.prevClose || stock.currentPrice,
              lastUpdated: new Date().toISOString()
            };
          });
          
          setRealTimeData(initialRealTimeData);
        } else {
          throw new Error(result.message || 'Failed to load stocks');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Stock loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSignal = (stock) => {
    // AI Signal calculation based on indicators
    const rsi = stock.rsi || 50;
    const macd = stock.macd || 0;
    const volumeRatio = stock.volumeRatio || 1;
    
    if (rsi < 30 && macd > 0 && volumeRatio > 1.5) return 'strong_buy';
    if (rsi < 40 && macd > 0) return 'buy';
    if (rsi > 70 && macd < 0) return 'sell';
    if (rsi > 60 && macd < 0) return 'weak_sell';
    return 'neutral';
  };

  const calculateConfidence = (stock) => {
    // Calculate confidence level (0-100%)
    const indicators = [
      stock.rsi ? Math.abs(50 - stock.rsi) / 50 : 0,
      stock.macd ? Math.abs(stock.macd) : 0,
      stock.volumeRatio ? Math.min(stock.volumeRatio / 2, 1) : 0
    ];
    
    const avgConfidence = indicators.reduce((a, b) => a + b, 0) / indicators.length;
    return Math.min(Math.round(avgConfidence * 100), 95);
  };

  const calculateRiskLevel = (stock) => {
    const volatility = stock.volatility || 0;
    if (volatility < 0.5) return 'low';
    if (volatility < 1.0) return 'medium';
    return 'high';
  };

  const loadPortfolio = async () => {
    try {
      // Load from localStorage initially
      const portfolioData = JSON.parse(localStorage.getItem('velox_portfolio') || '{"holdings": []}');
      setPortfolio(portfolioData.holdings || []);
      
      // Sync with API if available
      const response = await fetch(`${config.API_BASE_URL}/portfolio`);
      if (response.ok) {
        const apiData = await response.json();
        if (apiData.success) {
          setPortfolio(apiData.holdings || []);
          localStorage.setItem('velox_portfolio', JSON.stringify(apiData));
        }
      }
    } catch (error) {
      console.error('Portfolio loading error:', error);
    }
  };

  const loadWatchlist = async () => {
    try {
      const watchlistData = JSON.parse(localStorage.getItem('velox_watchlist') || '[]');
      setWatchlist(watchlistData);
      
      // Sync with API if available
      const response = await fetch(`${config.API_BASE_URL}/watchlist`);
      if (response.ok) {
        const apiData = await response.json();
        if (apiData.success) {
          setWatchlist(apiData.watchlist || []);
          localStorage.setItem('velox_watchlist', JSON.stringify(apiData.watchlist));
        }
      }
    } catch (error) {
      console.error('Watchlist loading error:', error);
    }
  };

  const updateRealTimePrices = async () => {
    if (!stocks.length || !marketStatus.isOpen) return;
    
    try {
      const symbols = stocks.slice(0, 20).map(s => s.symbol); // Limit to 20 symbols
      const response = await fetch(`${config.API_BASE_URL}/stocks/realtime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRealTimeData(prev => {
            const updated = { ...prev };
            result.data.forEach(stock => {
              updated[stock.symbol] = {
                ...prev[stock.symbol],
                ...stock,
                lastUpdated: new Date().toISOString()
              };
            });
            return updated;
          });
        }
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
        const change = (Math.random() - 0.5) * 0.02; // ±2%
        const newPrice = current.price * (1 + change);
        
        updated[symbol] = {
          ...current,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat((newPrice - (current.prevClose || current.price)).toFixed(2)),
          changePercent: parseFloat((change * 100).toFixed(2)),
          volume: Math.floor(current.volume * (1 + Math.random() * 0.1)),
          lastUpdated: new Date().toISOString()
        };
      });
      return updated;
    });
  };

  const refreshStocks = async () => {
    await loadStocks();
  };

  const getStockDetails = async (symbol) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/stocks/${symbol}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }
      throw new Error('Failed to fetch stock details');
    } catch (err) {
      console.error('Failed to get stock details:', err);
      // Return basic structure if API fails
      return {
        symbol,
        name: symbol,
        currentPrice: realTimeData[symbol]?.price || 0,
        change: realTimeData[symbol]?.change || 0,
        changePercent: realTimeData[symbol]?.changePercent || 0,
        data: realTimeData[symbol] || {}
      };
    }
  };

  const addToWatchlist = async (stock) => {
    try {
      const updatedWatchlist = [...watchlist, stock];
      setWatchlist(updatedWatchlist);
      
      // Save to localStorage
      localStorage.setItem('velox_watchlist', JSON.stringify(updatedWatchlist));
      
      // Sync with API
      await fetch(`${config.API_BASE_URL}/watchlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: stock.symbol })
      });
      
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
      
      await fetch(`${config.API_BASE_URL}/watchlist/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      
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
      const currentPrice = getStockPrice(holding.symbol) || holding.averagePrice;
      return total + (currentPrice * holding.quantity);
    }, 0);
  };

  const calculateDailyPnL = () => {
    let totalPnL = 0;
    
    portfolio.forEach(holding => {
      const currentPrice = getStockPrice(holding.symbol) || holding.averagePrice;
      const pnl = (currentPrice - holding.averagePrice) * holding.quantity;
      totalPnL += pnl;
    });
    
    return totalPnL;
  };

  const calculateTotalInvestment = () => {
    return portfolio.reduce((total, holding) => {
      return total + (holding.averagePrice * holding.quantity);
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
        symbol: tradeData.stockSymbol,
        name: tradeData.stockName,
        quantity: tradeData.quantity,
        averagePrice: tradeData.entryPrice,
        entryDate: new Date().toISOString(),
        tradeType: tradeData.tradeType || 'INTRADAY',
        stopLoss: tradeData.stopLoss,
        target: tradeData.targetPrice,
        broker: tradeData.broker,
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
      
      // Save trade to history
      const trades = JSON.parse(localStorage.getItem('velox_trades') || '[]');
      trades.push({
        type: 'BUY',
        ...tradeData,
        tradeId: `TRADE_${Date.now()}`,
        status: 'COMPLETED',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('velox_trades', JSON.stringify(trades));
      
      // Sync with API
      await fetch(`${config.API_BASE_URL}/portfolio/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHolding)
      });
      
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
      const pnl = (exitData.exitPrice - holding.averagePrice) * holding.quantity;
      const pnlPercent = ((exitData.exitPrice - holding.averagePrice) / holding.averagePrice) * 100;
      
      // Save trade to history
      const trades = JSON.parse(localStorage.getItem('velox_trades') || '[]');
      trades.push({
        type: 'SELL',
        symbol: holding.symbol,
        name: holding.name,
        quantity: holding.quantity,
        entryPrice: holding.averagePrice,
        exitPrice: exitData.exitPrice,
        pnl: parseFloat(pnl.toFixed(2)),
        pnlPercent: parseFloat(pnlPercent.toFixed(2)),
        holdingPeriod: exitData.holdingPeriod,
        exitDate: new Date().toISOString(),
        reason: exitData.exitReason,
        status: 'COMPLETED',
        tradeId: `TRADE_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('velox_trades', JSON.stringify(trades));
      
      // Sync with API
      await fetch(`${config.API_BASE_URL}/portfolio/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdingId, exitData })
      });
      
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
      currentValue,
      investment,
      returns,
      returnsPercent: parseFloat(returnsPercent.toFixed(2)),
      dailyPnL,
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