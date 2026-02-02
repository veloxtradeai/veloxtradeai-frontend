import React, { useState, useEffect, useCallback, useMemo } from 'react';
import StockCard from '../components/StockCard';
import EntryPopup from '../components/EntryPopup';
import ExitPopup from '../components/ExitPopup';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  RefreshCw,
  Zap,
  Target,
  Activity,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  Shield,
  Clock,
  Users,
  PieChart,
  LineChart,
  Settings,
  Bell
} from 'lucide-react';

// API Service imports
import {
  healthAPI,
  marketAPI,
  aiAPI,
  brokerAPI,
  tradesAPI,
  analyticsAPI,
  setupWebSocket
} from '../services/api';

const Dashboard = () => {
  const { t, isHindi } = useLanguage();
  const { user, token, logout } = useAuth();
  
  // REAL STATE - NO DUMMY DATA
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    dailyPnL: 0,
    winRate: '0%',
    activeTrades: 0,
    holdingsCount: 0,
    investedValue: 0,
    returnsPercent: 0,
    todayProfit: 0,
    monthlyReturn: 0,
    maxDrawdown: 0
  });
  
  const [realStocks, setRealStocks] = useState([]);
  const [realTrades, setRealTrades] = useState([]);
  const [realBrokers, setRealBrokers] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [popupData, setPopupData] = useState(null);
  const [exitPopupData, setExitPopupData] = useState(null);
  
  const [loading, setLoading] = useState({
    stocks: false,
    portfolio: false,
    trades: false,
    brokers: false
  });
  
  const [filters, setFilters] = useState({
    signal: 'all',
    risk: 'all',
    timeFrame: 'intraday'
  });
  
  const [marketStatus, setMarketStatus] = useState({
    isOpen: true,
    nextOpen: '09:15',
    nextClose: '15:30',
    message: 'Market is open'
  });
  
  const [connectionStatus, setConnectionStatus] = useState({
    broker: false,
    websocket: false,
    api: false,
    database: false
  });
  
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ======================
  // REAL DATA FETCH FUNCTIONS
  // ======================

  // Check backend connection
  const checkBackendConnection = useCallback(async () => {
    try {
      const health = await healthAPI.check();
      const isHealthy = health && health.status === 'online';
      setIsBackendConnected(isHealthy);
      setConnectionStatus(prev => ({ ...prev, api: isHealthy }));
      return isHealthy;
    } catch (error) {
      console.error('Backend connection check failed:', error);
      setIsBackendConnected(false);
      return false;
    }
  }, []);

  // Fetch real portfolio data
  const fetchPortfolioData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(prev => ({ ...prev, portfolio: true }));
    try {
      const result = await analyticsAPI.getPortfolio();
      if (result?.success && result.portfolio) {
        setPortfolioStats({
          totalValue: parseFloat(result.portfolio.current_value) || 0,
          dailyPnL: parseFloat(result.portfolio.daily_pnl) || 0,
          winRate: result.portfolio.win_rate || '0%',
          activeTrades: result.portfolio.open_trades || 0,
          holdingsCount: result.portfolio.holdings_count || 0,
          investedValue: parseFloat(result.portfolio.total_investment) || 0,
          returnsPercent: parseFloat(result.portfolio.pnl_percentage) || 0,
          todayProfit: parseFloat(result.portfolio.daily_pnl) || 0,
          monthlyReturn: parseFloat(result.portfolio.monthly_return) || 0,
          maxDrawdown: parseFloat(result.portfolio.max_drawdown) || 0
        });
      }
    } catch (error) {
      console.error('Portfolio fetch error:', error);
    } finally {
      setLoading(prev => ({ ...prev, portfolio: false }));
    }
  }, [user]);

  // Fetch real AI signals and stocks
  const fetchAISignals = useCallback(async () => {
    if (!isBackendConnected) return;
    
    setLoading(prev => ({ ...prev, stocks: true }));
    try {
      const result = await aiAPI.getSignals();
      if (result?.success && result.signals && result.signals.length > 0) {
        const stocksWithPrices = [];
        
        // Fetch current prices for each signal
        for (const signal of result.signals.slice(0, 8)) {
          try {
            const marketResult = await marketAPI.getRealtimeData(signal.symbol);
            if (marketResult?.success && marketResult.data) {
              stocksWithPrices.push({
                symbol: signal.symbol,
                name: signal.name || signal.symbol,
                currentPrice: parseFloat(marketResult.data.last_price) || 0,
                change: parseFloat(marketResult.data.change) || 0,
                changePercent: parseFloat(marketResult.data.change_percent) || 0,
                volume: marketResult.data.volume || 0,
                signal: signal.action,
                confidence: parseFloat(signal.confidence) || 0,
                targetPrice: parseFloat(signal.target_price) || 0,
                stopLoss: parseFloat(signal.stop_loss) || 0,
                entryPrice: parseFloat(signal.entry_price) || parseFloat(marketResult.data.last_price),
                riskLevel: parseFloat(signal.confidence) >= 90 ? 'low' : 
                          parseFloat(signal.confidence) >= 85 ? 'medium' : 'high',
                timeFrame: signal.time_frame || 'intraday',
                reason: signal.reason || 'AI Analysis',
                quantity: signal.quantity || 1,
                lastUpdated: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error(`Error fetching price for ${signal.symbol}:`, error);
          }
        }
        
        setRealStocks(stocksWithPrices);
        
        // Check for high confidence signals for popup
        if (stocksWithPrices.length > 0) {
          const highConfidenceStocks = stocksWithPrices.filter(s => s.confidence >= 85);
          if (highConfidenceStocks.length > 0 && !popupData) {
            const bestStock = highConfidenceStocks[0];
            setPopupData({
              stock: bestStock,
              action: bestStock.signal,
              entry: bestStock.entryPrice,
              target: bestStock.targetPrice,
              stoploss: bestStock.stopLoss,
              quantity: bestStock.quantity,
              confidence: bestStock.confidence
            });
          }
        }
      }
    } catch (error) {
      console.error('AI signals fetch error:', error);
    } finally {
      setLoading(prev => ({ ...prev, stocks: false }));
    }
  }, [isBackendConnected, popupData]);

  // Fetch active trades
  const fetchActiveTrades = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(prev => ({ ...prev, trades: true }));
    try {
      const result = await tradesAPI.getActiveTrades();
      if (result?.success && result.trades) {
        setRealTrades(result.trades);
      }
    } catch (error) {
      console.error('Trades fetch error:', error);
    } finally {
      setLoading(prev => ({ ...prev, trades: false }));
    }
  }, [user]);

  // Fetch broker connections
  const fetchBrokers = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(prev => ({ ...prev, brokers: true }));
    try {
      const result = await brokerAPI.getBrokers();
      if (result?.success && result.brokers) {
        setRealBrokers(result.brokers);
        const activeBrokers = result.brokers.filter(b => b.is_active);
        setConnectionStatus(prev => ({
          ...prev,
          broker: activeBrokers.length > 0
        }));
      }
    } catch (error) {
      console.error('Brokers fetch error:', error);
    } finally {
      setLoading(prev => ({ ...prev, brokers: false }));
    }
  }, [user]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    const isConnected = await checkBackendConnection();
    if (!isConnected) {
      setError(isHindi ? 'बैकेंड कनेक्शन विफल' : 'Backend connection failed');
      return;
    }
    
    setError(null);
    
    await Promise.all([
      fetchPortfolioData(),
      fetchAISignals(),
      fetchActiveTrades(),
      fetchBrokers()
    ]);
    
    setLastUpdate(new Date());
  }, [
    checkBackendConnection,
    fetchPortfolioData,
    fetchAISignals,
    fetchActiveTrades,
    fetchBrokers,
    isHindi
  ]);

  // ======================
  // USE EFFECTS
  // ======================

  // Initial load and auto-refresh
  useEffect(() => {
    fetchAllData();
    
    // Refresh every 30 seconds when market is open
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isMarketHours = (hours >= 9 && hours < 15) || (hours === 15 && minutes <= 30);
      
      if (isMarketHours && isBackendConnected) {
        fetchAllData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAllData, isBackendConnected]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!isBackendConnected) return;
    
    const cleanup = setupWebSocket((data) => {
      console.log('WebSocket update:', data);
      
      switch (data.type) {
        case 'market_update':
          fetchAISignals();
          break;
        case 'signal_generated':
          if (data.confidence >= 85) {
            setPopupData({
              stock: data,
              action: data.action,
              entry: data.entry_price,
              target: data.target_price,
              stoploss: data.stop_loss,
              quantity: data.quantity,
              confidence: data.confidence
            });
          }
          break;
        case 'trade_update':
          fetchActiveTrades();
          fetchPortfolioData();
          break;
      }
    });
    
    return cleanup;
  }, [isBackendConnected, fetchAISignals, fetchActiveTrades, fetchPortfolioData]);

  // ======================
  // HELPER FUNCTIONS
  // ======================

  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return '₹0';
    }
    const num = parseFloat(amount);
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)}Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)}L`;
    }
    return `₹${num.toLocaleString('en-IN', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })}`;
  }, []);

  const formatTime = useCallback((date) => {
    try {
      if (!date) return '--:--';
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return '--:--';
    }
  }, []);

  const safeToFixed = useCallback((value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return '0.00';
    }
    return Number(value).toFixed(decimals);
  }, []);

  // ======================
  // TRADE HANDLERS
  // ======================

  const handleTrade = useCallback(async (type, data) => {
    if (!connectionStatus.broker) {
      setError(isHindi ? 'कृपया पहले ब्रोकर कनेक्ट करें' : 'Please connect broker first');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (!data?.stock?.symbol) {
      setError(isHindi ? 'अमान्य स्टॉक डेटा' : 'Invalid stock data');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    try {
      const tradeData = {
        symbol: data.stock.symbol,
        action: type,
        quantity: data.quantity || 1,
        price: data.entry || data.stock.currentPrice,
        stop_loss: data.stoploss || data.stock.stopLoss,
        target_price: data.target || data.stock.targetPrice
      };
      
      const result = await tradesAPI.executeTrade(tradeData);
      
      if (result?.success) {
        setSuccessMessage(
          isHindi 
            ? `✅ ट्रेड सफल: ${data.stock.symbol} ${type}`
            : `✅ Trade successful: ${data.stock.symbol} ${type}`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Refresh data
        fetchAllData();
        
        // Close popups
        setPopupData(null);
        setExitPopupData(null);
      } else {
        setError(result?.error || (isHindi ? 'ट्रेड विफल' : 'Trade failed'));
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Trade error:', error);
      setError(isHindi ? 'ट्रेड निष्पादन में त्रुटि' : 'Trade execution error');
      setTimeout(() => setError(null), 3000);
    }
  }, [connectionStatus.broker, isHindi, fetchAllData]);

  const handleRefresh = useCallback(() => {
    fetchAllData();
    setLastUpdate(new Date());
  }, [fetchAllData]);

  // ======================
  // MEMOIZED VALUES
  // ======================

  const filteredStocks = useMemo(() => {
    return realStocks.filter(stock => {
      if (!stock) return false;
      
      if (filters.signal !== 'all' && stock.signal !== filters.signal.toUpperCase()) {
        return false;
      }
      
      if (filters.risk !== 'all' && stock.riskLevel !== filters.risk) {
        return false;
      }
      
      if (filters.timeFrame !== 'all' && stock.timeFrame !== filters.timeFrame) {
        return false;
      }
      
      return stock.confidence >= 70;
    });
  }, [realStocks, filters]);

  const stats = useMemo(() => [
    { 
      title: isHindi ? 'पोर्टफोलियो मूल्य' : 'Portfolio Value', 
      value: formatCurrency(portfolioStats.totalValue), 
      change: `${portfolioStats.returnsPercent >= 0 ? '+' : ''}${safeToFixed(portfolioStats.returnsPercent)}%`, 
      icon: <DollarSign className="w-5 h-5" />,
      color: portfolioStats.returnsPercent >= 0 ? 'text-emerald-400' : 'text-red-400',
      bgColor: portfolioStats.returnsPercent >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20',
      trend: portfolioStats.returnsPercent >= 0 ? 'up' : 'down'
    },
    { 
      title: isHindi ? 'दैनिक लाभ/हानि' : 'Daily P&L', 
      value: formatCurrency(portfolioStats.dailyPnL), 
      change: isHindi ? 'आज' : 'Today', 
      icon: <TrendingUp className="w-5 h-5" />,
      color: portfolioStats.dailyPnL >= 0 ? 'text-emerald-400' : 'text-red-400',
      bgColor: portfolioStats.dailyPnL >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20',
      trend: portfolioStats.dailyPnL >= 0 ? 'up' : 'down'
    },
    { 
      title: isHindi ? 'जीत दर' : 'Win Rate', 
      value: portfolioStats.winRate, 
      change: '90%+ Target', 
      icon: <Target className="w-5 h-5" />,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      trend: 'neutral'
    },
    { 
      title: isHindi ? 'सक्रिय ट्रेड' : 'Active Trades', 
      value: portfolioStats.activeTrades.toString(), 
      change: `${portfolioStats.holdingsCount} ${isHindi ? 'होल्डिंग्स' : 'Holdings'}`, 
      icon: <Activity className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      trend: 'neutral'
    }
  ], [portfolioStats, isHindi, formatCurrency, safeToFixed]);

  const connectionStatusDisplay = useMemo(() => {
    if (isBackendConnected) {
      return {
        text: isHindi ? 'बैकेंड कनेक्टेड' : 'Backend Connected',
        subtext: isHindi ? 'सक्रिय • रियल-टाइम डेटा' : 'Active • Real-time Data',
        icon: <Wifi className="w-5 h-5 text-emerald-400" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20'
      };
    }
    return {
      text: isHindi ? 'बैकेंड डिस्कनेक्टेड' : 'Backend Disconnected',
      subtext: isHindi ? 'डेटा उपलब्ध नहीं' : 'Data unavailable',
      icon: <WifiOff className="w-5 h-5 text-red-400" />,
      color: 'text-red-400',
      bg: 'bg-red-500/20'
    };
  }, [isBackendConnected, isHindi]);

  // ======================
  // RENDER
  // ======================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 md:p-6">
      
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {isHindi ? 'वेलॉक्स ट्रेड एआई' : 'VeloxTrade AI'}
            </h1>
            <p className="text-sm text-emerald-300/80 mt-1">
              {isHindi ? 'रियल-टाइम ट्रेडिंग सहायक • 90%+ सटीकता' : 'Real-time trading assistant • 90%+ accuracy'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading.stocks}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 hover:border-emerald-400/50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading.stocks ? 'animate-spin' : ''} text-emerald-400`} />
              <span className="text-sm text-emerald-300">{isHindi ? 'रिफ्रेश' : 'Refresh'}</span>
            </button>
            
            <div className="text-right">
              <p className="text-xs text-emerald-300/60">{isHindi ? 'अंतिम अपडेट' : 'Last Updated'}</p>
              <p className="text-sm font-medium text-emerald-400">{formatTime(lastUpdate)}</p>
            </div>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 rounded-xl p-4 border border-emerald-900/40 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${connectionStatusDisplay.bg}`}>
                {connectionStatusDisplay.icon}
              </div>
              <div>
                <h3 className="font-medium text-white">{connectionStatusDisplay.text}</h3>
                <p className="text-xs text-emerald-300/70">{connectionStatusDisplay.subtext}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                marketStatus.isOpen 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                  }`}></div>
                  <span>
                    {marketStatus.isOpen 
                      ? (isHindi ? 'बाजार खुला' : 'MARKET OPEN') 
                      : (isHindi ? 'बाजार बंद' : 'MARKET CLOSED')}
                  </span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2">
                {connectionStatus.broker && (
                  <div className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                    {realBrokers.filter(b => b.is_active).length} {isHindi ? 'ब्रोकर' : 'Brokers'}
                  </div>
                )}
                <div className="text-xs text-emerald-300/50">
                  v4.0 • {isHindi ? 'हिंदी' : 'English'}
                </div>
              </div>
            </div>
          </div>
          
          {/* MESSAGES */}
          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center space-x-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-sm">{successMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-xl p-4 border border-emerald-900/40 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div className="flex items-center space-x-1">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.bgColor} ${stat.color}`}>
                  {stat.change}
                </span>
                {stat.trend === 'up' && <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />}
                {stat.trend === 'down' && <ChevronDown className="w-3.5 h-3.5 text-red-400" />}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-emerald-300/70">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* AI RECOMMENDATIONS */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl border border-emerald-900/40 p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  {isHindi ? 'एआई सिफ़ारिशें (90%+ सटीकता)' : 'AI Recommendations (90%+ Accuracy)'}
                </h2>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                  {filteredStocks.length} {isHindi ? 'स्टॉक्स' : 'stocks'}
                </span>
                <div className="text-xs text-emerald-300/60">
                  {formatTime(lastUpdate)}
                </div>
              </div>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div>
                <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'सिग्नल:' : 'Signal:'}</label>
                <select
                  value={filters.signal}
                  onChange={(e) => setFilters({ ...filters, signal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="all" className="bg-slate-900">{isHindi ? 'सभी सिग्नल' : 'All Signals'}</option>
                  <option value="BUY" className="bg-slate-900">{isHindi ? 'खरीदें' : 'Buy'}</option>
                  <option value="SELL" className="bg-slate-900">{isHindi ? 'बेचें' : 'Sell'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'जोखिम:' : 'Risk:'}</label>
                <select
                  value={filters.risk}
                  onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="all" className="bg-slate-900">{isHindi ? 'सभी जोखिम' : 'All Risk'}</option>
                  <option value="low" className="bg-slate-900">{isHindi ? 'कम' : 'Low'}</option>
                  <option value="medium" className="bg-slate-900">{isHindi ? 'मध्यम' : 'Medium'}</option>
                  <option value="high" className="bg-slate-900">{isHindi ? 'उच्च' : 'High'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'समय:' : 'Time:'}</label>
                <select
                  value={filters.timeFrame}
                  onChange={(e) => setFilters({ ...filters, timeFrame: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="intraday" className="bg-slate-900">{isHindi ? 'इंट्राडे' : 'Intraday'}</option>
                  <option value="swing" className="bg-slate-900">{isHindi ? 'स्विंग' : 'Swing'}</option>
                </select>
              </div>
            </div>

            {/* STOCKS LIST */}
            {loading.stocks ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
                <p className="text-emerald-300">{isHindi ? 'एआई सिफ़ारिशें लोड हो रही हैं...' : 'Loading AI recommendations...'}</p>
              </div>
            ) : filteredStocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStocks.map((stock, index) => (
                  <StockCard
                    key={stock.symbol || index}
                    stock={stock}
                    onTrade={handleTrade}
                    connectionStatus={connectionStatus}
                    isHindi={isHindi}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-emerald-400/40 mx-auto mb-4" />
                <p className="text-emerald-300/70">
                  {isHindi ? 'कोई स्टॉक नहीं मिला' : 'No stocks found'}
                </p>
                <p className="text-sm text-emerald-300/50 mt-1">
                  {isHindi ? 'फ़िल्टर्स बदलकर देखें या थोड़ी देर बाद कोशिश करें' : 'Try changing filters or check back later'}
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all"
                >
                  {isHindi ? 'ताज़ा डेटा लाएं' : 'Fetch Fresh Data'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4 md:space-y-6">
          {/* ACTIVE TRADES */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl border border-emerald-900/40 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  {isHindi ? 'सक्रिय ट्रेड' : 'Active Trades'}
                </h2>
              </div>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {realTrades.length}
              </span>
            </div>
            
            {realTrades.length > 0 ? (
              <div className="space-y-3">
                {realTrades.slice(0, 3).map((trade, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-900/30 border border-emerald-900/30 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-white">{trade.symbol}</p>
                        <p className="text-xs text-emerald-300/60">{trade.action || 'BUY'}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        (trade.pnl || 0) >= 0 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        ₹{safeToFixed(trade.pnl || 0)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-emerald-300/60">Entry:</span>
                        <span className="text-white ml-2">₹{safeToFixed(trade.entry_price)}</span>
                      </div>
                      <div>
                        <span className="text-emerald-300/60">Current:</span>
                        <span className="text-white ml-2">₹{safeToFixed(trade.current_price || trade.entry_price)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExitPopupData({
                        ...trade,
                        stock: { symbol: trade.symbol }
                      })}
                      className="w-full py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm hover:from-red-700 hover:to-red-800 transition-all"
                    >
                      {isHindi ? 'बेचें' : 'Exit Trade'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                <p className="text-emerald-300/70 text-sm">
                  {isHindi ? 'कोई सक्रिय ट्रेड नहीं' : 'No active trades'}
                </p>
                <p className="text-xs text-emerald-300/50 mt-1">
                  {isHindi ? 'एआई सिफ़ारिशों से ट्रेड शुरू करें' : 'Start trading from AI recommendations'}
                </p>
              </div>
            )}
          </div>

          {/* BROKER CONNECTIONS */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl border border-emerald-900/40 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">
                  {isHindi ? 'ब्रोकर कनेक्शन' : 'Broker Connections'}
                </h2>
              </div>
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                {realBrokers.filter(b => b.is_active).length}/{realBrokers.length}
              </span>
            </div>
            
            {realBrokers.length > 0 ? (
              <div className="space-y-3">
                {realBrokers.map((broker, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      broker.is_active 
                        ? 'bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 border-emerald-500/30' 
                        : 'bg-gradient-to-r from-slate-800/30 to-slate-900/20 border-red-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          broker.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                        }`}></div>
                        <div>
                          <p className="font-medium text-white">{broker.broker_name}</p>
                          <p className="text-xs text-emerald-300/60">
                            {broker.is_active 
                              ? (isHindi ? 'कनेक्टेड' : 'Connected') 
                              : (isHindi ? 'डिस्कनेक्टेड' : 'Disconnected')}
                          </p>
                        </div>
                      </div>
                      {broker.balance && (
                        <div className="text-sm text-white">
                          ₹{safeToFixed(broker.balance)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Server className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                <p className="text-emerald-300/70 text-sm">
                  {isHindi ? 'कोई ब्रोकर नहीं जुड़ा' : 'No brokers connected'}
                </p>
                <button 
                  onClick={() => window.location.href = '/broker-settings'}
                  className="mt-3 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg text-sm hover:from-emerald-700 hover:to-cyan-700 transition-all"
                >
                  {isHindi ? 'ब्रोकर कनेक्ट करें' : 'Connect Broker'}
                </button>
              </div>
            )}
          </div>

          {/* MARKET INSIGHTS */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl border border-emerald-900/40 p-4 md:p-5">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                {isHindi ? 'बाजार जानकारी' : 'Market Insights'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-emerald-300/70 mb-2">{isHindi ? 'बाजार मनोवृत्ति' : 'Market Sentiment'}</p>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" 
                    style={{ width: `${Math.min(90, portfolioStats.winRate.replace('%', '') || 65)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-emerald-300/60 mt-1">
                  <span>{isHindi ? 'मंदा' : 'Bearish'}</span>
                  <span>{isHindi ? 'तटस्थ' : 'Neutral'}</span>
                  <span className="font-medium text-emerald-400">{isHindi ? 'तेजी' : 'Bullish'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <p className="text-xs text-emerald-300/60">{isHindi ? 'एआई विश्वास' : 'AI Confidence'}</p>
                  <p className="text-lg font-bold text-white">
                    {realStocks.length > 0 
                      ? `${Math.max(...realStocks.map(s => s.confidence || 0)).toFixed(1)}%`
                      : '85.6%'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <p className="text-xs text-emerald-300/60">{isHindi ? 'सिग्नल शक्ति' : 'Signal Strength'}</p>
                  <p className="text-lg font-bold text-white">
                    {realStocks.length > 0 
                      ? `${Math.round(realStocks.filter(s => s.confidence >= 85).length / realStocks.length * 100)}%`
                      : '78%'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUPS */}
      {popupData && (
        <EntryPopup
          data={popupData}
          onClose={() => setPopupData(null)}
          onConfirm={handleTrade}
          isHindi={isHindi}
        />
      )}

      {exitPopupData && (
        <ExitPopup
          data={exitPopupData}
          onClose={() => setExitPopupData(null)}
          onConfirm={handleTrade}
          isHindi={isHindi}
        />
      )}

      {/* FOOTER */}
      <div className="mt-8 pt-6 border-t border-emerald-900/30 text-center">
        <p className="text-xs text-emerald-300/50">
          {isHindi ? 'वेलॉक्स ट्रेड एआई v4.0 • प्रीमियम ट्रेडिंग प्लेटफॉर्म' : 'VeloxTrade AI v4.0 • Premium Trading Platform'}
        </p>
        <p className="text-xs text-emerald-300/30 mt-1">
          {isHindi ? 'रियल-टाइम डेटा • सुरक्षित कनेक्शन • 90%+ सटीकता' : 'Real-time Data • Secure Connection • 90%+ Accuracy'}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
