import React, { useState, useEffect, useCallback, useMemo } from 'react';
import StockCard from '../components/StockCard';
import EntryPopup from '../components/EntryPopup';
import ExitPopup from '../components/ExitPopup';
import { useLanguage } from '../contexts/LanguageContext';
import { useStocks } from '../hooks/useStocks';
import { portfolioAPI, tradeAPI, brokerAPI, marketAPI, healthAPI, setupWebSocket } from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  Zap,
  Target,
  Shield,
  Activity,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  LineChart,
  X,
  Maximize2,
  Layers,
  BarChart2,
  PieChart,
  Users,
  Eye,
  Battery,
  Database,
  Server
} from 'lucide-react';

const Dashboard = () => {
  const { t, isHindi, language } = useLanguage();
  const { stocks, loading, refreshStocks, marketStatus, portfolioStats } = useStocks();
  
  // REAL STATE - NO DUMMY
  const [realPortfolio, setRealPortfolio] = useState({
    totalValue: 0,
    dailyPnL: 0,
    winRate: '0%',
    activeTrades: 0,
    holdingsCount: 0,
    investedValue: 0,
    returnsPercent: 0
  });
  
  const [realTrades, setRealTrades] = useState([]);
  const [realBrokers, setRealBrokers] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [popupData, setPopupData] = useState(null);
  const [exitPopupData, setExitPopupData] = useState(null);
  const [filters, setFilters] = useState({
    signal: 'all',
    risk: 'all',
    timeFrame: 'all'
  });
  const [activeTab, setActiveTab] = useState('recommendations');
  const [connectionStatus, setConnectionStatus] = useState({
    broker: false,
    websocket: false,
    api: false
  });
  const [error, setError] = useState(null);

  // Chart & Modal States
  const [selectedStock, setSelectedStock] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartType, setChartType] = useState('candlestick');
  const [timeframe, setTimeframe] = useState('1d');
  const [showOptionChain, setShowOptionChain] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState('NIFTY');

  // REAL DATA FETCH - NO DUMMY
  const fetchRealData = useCallback(async () => {
    try {
      console.log('🔄 Fetching real dashboard data...');
      
      // Check backend health first
      const healthResult = await healthAPI.check();
      const isHealthy = healthResult?.success && healthResult.status === 'online';
      setIsBackendConnected(isHealthy);
      
      if (!isHealthy) {
        setError(isHindi ? 'बैकेंड कनेक्शन में समस्या' : 'Backend connection issue');
        return;
      }
      
      setError(null);
      
      // Fetch portfolio data
      const portfolioResult = await portfolioAPI.getAnalytics();
      if (portfolioResult?.success) {
        setRealPortfolio({
          totalValue: portfolioResult.portfolio?.totalValue || 0,
          dailyPnL: portfolioResult.portfolio?.dailyPnL || 0,
          winRate: portfolioResult.portfolio?.winRate || '0%',
          activeTrades: portfolioResult.portfolio?.activeTrades || 0,
          holdingsCount: portfolioResult.portfolio?.holdingsCount || 0,
          investedValue: portfolioResult.portfolio?.investedValue || 0,
          returnsPercent: portfolioResult.portfolio?.returnsPercent || 0
        });
      }
      
      // Fetch active trades
      const tradesResult = await tradeAPI.getActiveTrades();
      if (tradesResult?.success && Array.isArray(tradesResult.trades)) {
        setRealTrades(tradesResult.trades);
      }
      
      // Fetch brokers
      const brokersResult = await brokerAPI.getBrokers();
      if (brokersResult?.success) {
        setRealBrokers(brokersResult.brokers || []);
        const connectedBrokers = brokersResult.brokers?.filter(b => b.is_active) || [];
        setConnectionStatus(prev => ({
          ...prev,
          broker: connectedBrokers.length > 0,
          api: isHealthy
        }));
      }
      
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ Real data fetch error:', error);
      setIsBackendConnected(false);
      setError(isHindi ? 'डेटा लोड नहीं हो सका' : 'Failed to load data');
    }
  }, [isHindi]);

  // Auto refresh and WebSocket setup
  useEffect(() => {
    // Initial fetch
    fetchRealData();
    
    // Setup WebSocket for real-time updates
    const cleanup = setupWebSocket((data) => {
      console.log('📡 WebSocket data:', data);
      
      switch (data.type) {
        case 'market_update':
          refreshStocks();
          break;
        case 'signal_generated':
          if (data.confidence >= 85) {
            setPopupData({
              stock: data,
              action: data.action || 'BUY',
              entry: data.entry_price || 0,
              target: data.target_price || 0,
              stoploss: data.stop_loss || 0,
              quantity: data.quantity || 1
            });
          }
          break;
        case 'trade_update':
          fetchRealData();
          break;
      }
    });
    
    // Auto refresh interval
    const intervalId = setInterval(() => {
      if (isBackendConnected && marketStatus?.isOpen) {
        fetchRealData();
        setLastUpdate(new Date());
      }
    }, 30000);
    
    return () => {
      cleanup();
      clearInterval(intervalId);
    };
  }, [fetchRealData, isBackendConnected, marketStatus]);

  // Auto popup for high confidence signals
  useEffect(() => {
    if (!stocks || !Array.isArray(stocks) || !isBackendConnected || popupData) return;
    
    const highConfidenceStocks = stocks.filter(
      stock => stock && stock.confidence && stock.signal && parseFloat(stock.confidence) >= 85
    );
    
    if (highConfidenceStocks.length > 0 && connectionStatus.broker) {
      const topStock = highConfidenceStocks[0];
      setPopupData({
        stock: topStock,
        action: 'BUY',
        entry: topStock.entry_price || (topStock.currentPrice || 0) * 0.99,
        target: topStock.target_price || (topStock.currentPrice || 0) * 1.08,
        stoploss: topStock.stop_loss || (topStock.currentPrice || 0) * 0.95,
        quantity: topStock.quantity || Math.floor(10000 / (topStock.currentPrice || 1))
      });
    }
  }, [stocks, connectionStatus.broker, isBackendConnected, popupData]);

  // Helper functions
  const safeToFixed = useCallback((value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return '0.00';
    }
    return Number(value).toFixed(decimals);
  }, []);

  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return '₹0';
    }
    const num = parseFloat(amount);
    return `₹${num.toLocaleString('en-IN', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  }, []);

  const formatTime = useCallback((date) => {
    try {
      if (!date) return '--:--';
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '--:--';
    }
  }, []);

  // Handle trade
  const handleTrade = useCallback(async (type, data) => {
    try {
      if (!connectionStatus.broker) {
        alert(isHindi ? 'पहले ब्रोकर कनेक्ट करें!' : 'Please connect broker first!');
        return;
      }
      
      if (!data?.symbol) {
        alert(isHindi ? 'इनवैलिड स्टॉक डेटा!' : 'Invalid stock data!');
        return;
      }
      
      const orderData = {
        symbol: data.symbol,
        action: type,
        quantity: data.quantity || 1,
        price: data.entry || 0,
        stoploss: data.stoploss || 0,
        target: data.target || 0,
        product: 'INTRADAY',
        order_type: 'MARKET'
      };
      
      const result = await brokerAPI.placeOrder(orderData);
      if (result?.success) {
        alert(isHindi ? `✅ ऑर्डर प्लेस हुआ: ${result.orderId || 'N/A'}` : `✅ Order placed: ${result.orderId || 'N/A'}`);
        fetchRealData();
        
        if (popupData) setPopupData(null);
        if (exitPopupData) setExitPopupData(null);
      } else {
        alert(isHindi ? `❌ ऑर्डर फेल: ${result?.message || 'Unknown error'}` : `❌ Order failed: ${result?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Trade error:', error);
      alert(isHindi ? 'ऑर्डर में समस्या!' : 'Order error!');
    }
  }, [connectionStatus.broker, isHindi, fetchRealData, popupData, exitPopupData]);

  // Filter stocks
  const filteredStocks = useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return [];
    
    return stocks.filter(stock => {
      if (!stock) return false;
      
      if (filters.signal !== 'all') {
        const stockSignal = String(stock.signal || '').toLowerCase();
        const filterSignal = filters.signal.toLowerCase();
        if (!stockSignal.includes(filterSignal)) return false;
      }
      
      if (filters.risk !== 'all' && stock.riskLevel !== filters.risk) return false;
      if (filters.timeFrame !== 'all' && stock.timeFrame !== filters.timeFrame) return false;
      
      return true;
    });
  }, [stocks, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalValue = realPortfolio.totalValue || 0;
    const returnsPercent = realPortfolio.returnsPercent || 0;
    const dailyPnL = realPortfolio.dailyPnL || 0;
    const winRate = realPortfolio.winRate || '0%';
    const activeTrades = realPortfolio.activeTrades || 0;
    const holdingsCount = realPortfolio.holdingsCount || 0;

    return [
      { 
        title: t('portfolioValue') || 'Portfolio Value', 
        value: formatCurrency(totalValue), 
        change: `${returnsPercent >= 0 ? '+' : ''}${safeToFixed(returnsPercent)}%`, 
        icon: <DollarSign className="w-5 h-5" />,
        color: returnsPercent >= 0 ? 'text-emerald-400' : 'text-red-400',
        bgColor: returnsPercent >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
      },
      { 
        title: t('dailyPnL') || 'Daily P&L', 
        value: `${dailyPnL >= 0 ? '+' : ''}${formatCurrency(dailyPnL)}`, 
        change: t('today') || 'Today', 
        icon: <TrendingUp className="w-5 h-5" />,
        color: dailyPnL >= 0 ? 'text-emerald-400' : 'text-red-400',
        bgColor: dailyPnL >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
      },
      { 
        title: t('winRate') || 'Win Rate', 
        value: winRate, 
        change: '90%+ Target', 
        icon: <Target className="w-5 h-5" />,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/20'
      },
      { 
        title: t('activeTrades') || 'Active Trades', 
        value: activeTrades.toString(), 
        change: `${holdingsCount} ${t('holdings') || 'holdings'}`, 
        icon: <Activity className="w-5 h-5" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20'
      }
    ];
  }, [realPortfolio, t, formatCurrency, safeToFixed]);

  // Connection status display
  const connectionStatusDisplay = useMemo(() => {
    if (isBackendConnected) {
      return {
        text: isHindi ? 'बैकेंड कनेक्टेड' : 'Backend Connected',
        subtext: isHindi ? 'सक्रिय' : 'Active',
        icon: <Wifi className="w-5 h-5 text-emerald-400" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20'
      };
    }
    return {
      text: isHindi ? 'बैकेंड डिस्कनेक्टेड' : 'Backend Disconnected',
      subtext: isHindi ? 'निष्क्रिय' : 'Inactive',
      icon: <WifiOff className="w-5 h-5 text-red-400" />,
      color: 'text-red-400',
      bg: 'bg-red-500/20'
    };
  }, [isBackendConnected, isHindi]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refreshStocks();
    fetchRealData();
    setLastUpdate(new Date());
  }, [refreshStocks, fetchRealData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      
      {/* HEADER */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t('dashboard') || 'Dashboard'}
            </h1>
            <p className="text-sm text-emerald-300/80 mt-1">
              {isHindi ? 'रियल-टाइम ट्रेडिंग इनसाइट्स' : 'Real-time trading insights'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-3 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 hover:border-emerald-400/50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} text-emerald-400`} />
              <span className="text-sm text-emerald-300">{t('refresh') || 'Refresh'}</span>
            </button>
            
            <div className="text-right">
              <p className="text-xs text-emerald-300/60">{isHindi ? 'अपडेट' : 'Updated'}</p>
              <p className="text-sm font-medium text-emerald-400">{formatTime(lastUpdate)}</p>
            </div>
          </div>
        </div>

        {/* CONNECTION STATUS */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 rounded-2xl p-4 border border-emerald-900/40 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${connectionStatusDisplay.bg}`}>
                {connectionStatusDisplay.icon}
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {connectionStatusDisplay.text}
                </h3>
                <p className="text-xs text-emerald-300/70">
                  {connectionStatusDisplay.subtext}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                marketStatus?.isOpen 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    marketStatus?.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                  }`}></div>
                  <span>{marketStatus?.isOpen ? (isHindi ? 'खुला' : 'OPEN') : (isHindi ? 'बंद' : 'CLOSED')}</span>
                </div>
              </div>
              
              <div className="text-xs text-emerald-300/50">
                v3.0 • {language === 'hi' ? 'हिंदी' : 'English'}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-2xl p-4 border border-emerald-900/40 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div className="flex items-center space-x-1">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.bgColor} ${stat.color}`}>
                  {stat.change}
                </span>
                {stat.value.includes('+') && <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />}
                {stat.value.includes('-') && <ChevronDown className="w-3.5 h-3.5 text-red-400" />}
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-emerald-300/70">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STOCK RECOMMENDATIONS */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  {isHindi ? 'AI सिफ़ारिशें' : 'AI Recommendations'}
                </h2>
              </div>
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                {filteredStocks.length} {isHindi ? 'स्टॉक्स' : 'stocks'}
              </span>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div>
                <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'सिग्नल:' : 'Signal:'}</label>
                <select
                  value={filters.signal}
                  onChange={(e) => setFilters({ ...filters, signal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="all" className="bg-slate-900">{isHindi ? 'सभी सिग्नल' : 'All Signals'}</option>
                  <option value="buy" className="bg-slate-900">{isHindi ? 'बाय' : 'Buy'}</option>
                  <option value="sell" className="bg-slate-900">{isHindi ? 'सेल' : 'Sell'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'रिस्क:' : 'Risk:'}</label>
                <select
                  value={filters.risk}
                  onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="all" className="bg-slate-900">{isHindi ? 'सभी रिस्क' : 'All Risk'}</option>
                  <option value="low" className="bg-slate-900">{isHindi ? 'लो' : 'Low'}</option>
                  <option value="medium" className="bg-slate-900">{isHindi ? 'मीडियम' : 'Medium'}</option>
                  <option value="high" className="bg-slate-900">{isHindi ? 'हाई' : 'High'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'टाइमफ्रेम:' : 'Timeframe:'}</label>
                <select
                  value={filters.timeFrame}
                  onChange={(e) => setFilters({ ...filters, timeFrame: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="all" className="bg-slate-900">{isHindi ? 'सभी' : 'All'}</option>
                  <option value="intraday" className="bg-slate-900">{isHindi ? 'इंट्राडे' : 'Intraday'}</option>
                  <option value="swing" className="bg-slate-900">{isHindi ? 'स्विंग' : 'Swing'}</option>
                </select>
              </div>
            </div>

            {/* STOCK CARDS */}
            {loading ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
                <p className="text-emerald-300">{isHindi ? 'AI सिफ़ारिशें लोड हो रही हैं...' : 'Loading AI recommendations...'}</p>
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
                  {isHindi ? 'फ़िल्टर्स बदलकर देखें' : 'Try changing filters'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          {/* ACTIVE TRADES */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  {isHindi ? 'एक्टिव ट्रेड्स' : 'Active Trades'}
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
                    className="p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/30 border border-emerald-900/30 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-white">{trade.symbol}</p>
                        <p className="text-xs text-emerald-300/60">{trade.action}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        (trade.pnl || 0) >= 0 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        ₹{safeToFixed(trade.pnl || 0)}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-300/60">Entry:</span>
                      <span className="text-white">₹{safeToFixed(trade.entryPrice)}</span>
                    </div>
                    <button
                      onClick={() => setExitPopupData(trade)}
                      className="w-full mt-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm hover:from-red-700 hover:to-red-800 transition-all"
                    >
                      {isHindi ? 'एक्ज़िट' : 'Exit'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                <p className="text-emerald-300/70 text-sm">
                  {isHindi ? 'कोई एक्टिव ट्रेड नहीं' : 'No active trades'}
                </p>
              </div>
            )}
          </div>

          {/* BROKER CONNECTIONS */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">
                  {isHindi ? 'ब्रोकर कनेक्शन' : 'Broker Connections'}
                </h2>
              </div>
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                {realBrokers.filter(b => b.is_active).length}
              </span>
            </div>
            
            {realBrokers.length > 0 ? (
              <div className="space-y-3">
                {realBrokers.map((broker, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-xl border ${
                      broker.is_active 
                        ? 'bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 border-emerald-500/30' 
                        : 'bg-gradient-to-r from-slate-800/30 to-slate-900/20 border-red-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{broker.broker_name}</p>
                        <p className="text-xs text-emerald-300/60">
                          {broker.is_active 
                            ? (isHindi ? 'कनेक्टेड' : 'Connected') 
                            : (isHindi ? 'डिस्कनेक्टेड' : 'Disconnected')}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        broker.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                      }`}></div>
                    </div>
                    {broker.is_active && broker.balance && (
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-emerald-300/60">Balance:</span>
                          <span className="text-white">₹{safeToFixed(broker.balance)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Server className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                <p className="text-emerald-300/70 text-sm">
                  {isHindi ? 'कोई ब्रोकर नहीं' : 'No brokers connected'}
                </p>
                <button className="mt-3 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg text-sm hover:from-emerald-700 hover:to-cyan-700 transition-all">
                  {isHindi ? 'ब्रोकर कनेक्ट करें' : 'Connect Broker'}
                </button>
              </div>
            )}
          </div>

          {/* MARKET INSIGHTS */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                {isHindi ? 'मार्केट इनसाइट्स' : 'Market Insights'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-emerald-300/70 mb-2">{isHindi ? 'मार्केट सेन्टीमेंट' : 'Market Sentiment'}</p>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-emerald-300/60 mt-1">
                  <span>{isHindi ? 'बेयरिश' : 'Bearish'}</span>
                  <span>{isHindi ? 'न्यूट्रल' : 'Neutral'}</span>
                  <span className="font-medium text-emerald-400">{isHindi ? 'बुलिश' : 'Bullish'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <p className="text-xs text-emerald-300/60">{isHindi ? 'वोलैटिलिटी' : 'Volatility'}</p>
                  <p className="text-lg font-bold text-white">18.4</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <p className="text-xs text-emerald-300/60">{isHindi ? 'AI कॉन्फिडेंस' : 'AI Confidence'}</p>
                  <p className="text-lg font-bold text-white">85.6%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ENTRY POPUP */}
      {popupData && (
        <EntryPopup
          data={popupData}
          onClose={() => setPopupData(null)}
          onConfirm={handleTrade}
          isHindi={isHindi}
        />
      )}

      {/* EXIT POPUP */}
      {exitPopupData && (
        <ExitPopup
          data={exitPopupData}
          onClose={() => setExitPopupData(null)}
          onConfirm={handleTrade}
          isHindi={isHindi}
        />
      )}
    </div>
  );
};

export default Dashboard;
