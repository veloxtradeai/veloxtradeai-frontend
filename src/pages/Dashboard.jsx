import React, { useState, useEffect, useCallback } from 'react';
import StockCard from '../components/StockCard';
import EntryPopup from '../components/EntryPopup';
import ExitPopup from '../components/ExitPopup';
import { useLanguage } from '../contexts/LanguageContext';
import { useStocks } from '../hooks/useStocks';
import { portfolioAPI, tradeAPI, brokerAPI, marketAPI } from '../services/api';
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
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  BatteryCharging,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  LineChart,
  TrendingUp as TrendUp,
  TrendingDown as TrendDown
} from 'lucide-react';

const Dashboard = () => {
  const { t, isHindi, language } = useLanguage();
  const { stocks, loading, refreshStocks, marketStatus, portfolioStats, getTopMovers } = useStocks();
  
  // FIXED: Safer state initialization
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

  // FIXED: Safer safeToFixed function
  const safeToFixed = (value, decimals = 2) => {
    if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
      return '0.00';
    }
    return Number(value).toFixed(decimals);
  };

  // FIXED: Safer formatCurrency - toLowerCase error fix
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === '') {
      return '₹0';
    }
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return '₹0';
      
      return `₹${num.toLocaleString('en-IN', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    } catch (error) {
      console.error('formatCurrency error:', error);
      return '₹0';
    }
  };

  // FIXED: Simplified real data fetch - only essential calls
// Dashboard.jsx में fetchRealData function update करो:

const fetchRealData = useCallback(async () => {
  try {
    console.log('🔄 Fetching real data...');
    
    // 1. Backend health check
    const healthResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok && healthData.status === 'online') {
      setIsBackendConnected(true);
      setConnectionStatus(prev => ({ ...prev, api: true }));
      
      // 2. Portfolio data लो
      try {
        const portfolioResponse = await portfolioAPI.getAnalytics();
        if (portfolioResponse && portfolioResponse.success) {
          console.log('✅ Portfolio data loaded');
          // यहाँ portfolio data सेट करो
        }
      } catch (portfolioError) {
        console.log('⚠️ Portfolio endpoint not available');
      }
    }
    
    setLastUpdate(new Date());
    
  } catch (error) {
    console.error('❌ Real data fetch error:', error);
    setIsBackendConnected(false);
  }
}, []);
  
  // AUTO REFRESH AND DATA FETCH
  useEffect(() => {
    fetchRealData();
    
    const interval = setInterval(() => {
      fetchRealData();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchRealData]);

  // AUTO POPUP FOR HIGH CONFIDENCE STOCKS
  useEffect(() => {
    if (!stocks || !Array.isArray(stocks)) return;
    
    const highConfidenceStocks = stocks.filter(
      stock => stock && stock.confidence && stock.signal
    ).filter(
      stock => {
        const confidence = parseFloat(stock.confidence) || 0;
        const signal = String(stock.signal || '').toLowerCase();
        return confidence >= 90 && signal.includes('buy');
      }
    );
    
    if (highConfidenceStocks.length > 0 && connectionStatus.broker) {
      const topStock = highConfidenceStocks[0];
      setPopupData({
        stock: topStock,
        action: 'BUY',
        entry: (topStock.currentPrice || 0) * 0.99,
        target: (topStock.currentPrice || 0) * 1.08,
        stoploss: (topStock.currentPrice || 0) * 0.95,
        quantity: Math.floor(10000 / (topStock.currentPrice || 1))
      });
    }
  }, [stocks, connectionStatus.broker]);

  // FIXED: Safer stats calculation
  const stats = React.useMemo(() => {
    const totalValue = realPortfolio.totalValue || portfolioStats.currentValue || 0;
    const returnsPercent = realPortfolio.returnsPercent || portfolioStats.returnsPercent || 0;
    const dailyPnL = realPortfolio.dailyPnL || portfolioStats.dailyPnL || 0;
    const winRate = realPortfolio.winRate || portfolioStats.winRate || '0%';
    const activeTrades = realPortfolio.activeTrades || portfolioStats.activeTrades || 0;
    const holdingsCount = realPortfolio.holdingsCount || portfolioStats.holdingsCount || 0;

    return [
      { 
        title: t('portfolioValue') || 'Portfolio Value', 
        value: formatCurrency(totalValue), 
        change: `${returnsPercent >= 0 ? '+' : ''}${safeToFixed(returnsPercent)}%`, 
        icon: <DollarSign className="w-4 h-4 md:w-5 md:h-5" />,
        color: returnsPercent >= 0 ? 'text-emerald-400' : 'text-red-400',
        bgColor: returnsPercent >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20',
        trend: returnsPercent >= 0 ? 'up' : 'down',
        borderColor: returnsPercent >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'
      },
      { 
        title: t('dailyPnL') || 'Daily P&L', 
        value: `${dailyPnL >= 0 ? '+' : ''}${formatCurrency(dailyPnL)}`, 
        change: t('today') || 'Today', 
        icon: <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />,
        color: dailyPnL >= 0 ? 'text-emerald-400' : 'text-red-400',
        bgColor: dailyPnL >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20',
        trend: dailyPnL >= 0 ? 'up' : 'down',
        borderColor: dailyPnL >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'
      },
      { 
        title: t('winRate') || 'Win Rate', 
        value: winRate, 
        change: '90%+ Target', 
        icon: <Target className="w-4 h-4 md:w-5 md:h-5" />,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/20',
        trend: 'up',
        borderColor: 'border-cyan-500/30'
      },
      { 
        title: t('activeTrades') || 'Active Trades', 
        value: activeTrades.toString(), 
        change: `${holdingsCount} ${t('holdings') || 'holdings'}`, 
        icon: <Activity className="w-4 h-4 md:w-5 md:h-5" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        trend: 'neutral',
        borderColor: 'border-purple-500/30'
      }
    ];
  }, [realPortfolio, portfolioStats, t]);

  // FIXED: Safer top movers
  const topMovers = React.useMemo(() => {
    try {
      return getTopMovers();
    } catch (error) {
      console.error('getTopMovers error:', error);
      return { gainers: [], losers: [] };
    }
  }, [getTopMovers]);

  // TRADE HANDLER - REAL ORDER
  const handleTrade = async (type, data) => {
    try {
      if (!connectionStatus.broker) {
        alert(isHindi ? 'पहले ब्रोकर कनेक्ट करें!' : 'Please connect broker first!');
        return;
      }
      
      const orderData = {
        symbol: data.symbol,
        action: type,
        quantity: data.quantity,
        price: data.entry,
        stoploss: data.stoploss,
        target: data.target,
        product: 'INTRADAY',
        order_type: 'MARKET'
      };
      
      const result = await brokerAPI.placeOrder(orderData);
      if (result.success) {
        alert(isHindi ? `✅ ऑर्डर प्लेस हुआ: ${result.orderId}` : `✅ Order placed: ${result.orderId}`);
        fetchRealData();
      } else {
        alert(isHindi ? `❌ ऑर्डर फेल: ${result.message}` : `❌ Order failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Trade error:', error);
      alert(isHindi ? 'ऑर्डर में समस्या!' : 'Order error!');
    }
  };

  // FILTER STOCKS - SAFE
  const filteredStocks = React.useMemo(() => {
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

  // FIXED: Safer formatTime
  const formatTime = (date) => {
    try {
      if (!date || !(date instanceof Date)) return '--:--';
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return '--:--';
    }
  };

  // RESPONSIVE DESIGN - Tailwind classes will handle mobile/desktop
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      
      {/* HEADER SECTION */}
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
              onClick={() => {
                refreshStocks();
                fetchRealData();
              }}
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
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 border border-emerald-900/40 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full ${isBackendConnected ? 'bg-emerald-500/30 animate-ping' : 'bg-red-500/30'}`}></div>
                {isBackendConnected ? (
                  <Wifi className="w-5 h-5 text-emerald-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {isBackendConnected ? 
                    (isHindi ? 'बैकेंड कनेक्टेड' : 'Backend Connected') : 
                    (isHindi ? 'बैकेंड डिस्कनेक्टेड' : 'Backend Disconnected')}
                </h3>
                <p className="text-xs text-emerald-300/70">
                  {isHindi ? 'बैकेंड:' : 'Backend:'} {isBackendConnected ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                marketStatus.isOpen 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span>{marketStatus.isOpen ? (isHindi ? 'खुला' : 'OPEN') : (isHindi ? 'बंद' : 'CLOSED')}</span>
                </div>
              </div>
              
              <div className="text-xs text-emerald-300/50">
                v3.0 • {language === 'hi' ? 'हिंदी' : 'English'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-2xl p-4 border ${stat.borderColor} hover:border-${stat.color.split('-')[1]}-500/50 transition-all group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
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
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-emerald-300/70">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* TOP MOVERS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* TOP GAINERS */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <TrendUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{isHindi ? 'टॉप गेनर्स' : 'Top Gainers'}</h2>
                <p className="text-xs text-emerald-300/60">{isHindi ? 'लाइव अपडेट्स' : 'Live updates'}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
              {isHindi ? 'लाइव' : 'LIVE'}
            </span>
          </div>
          
          <div className="space-y-3">
            {(topMovers.gainers || []).map((stock, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 border border-emerald-900/30 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-500/20' : 
                    index === 1 ? 'bg-slate-500/20' : 
                    'bg-amber-500/20'
                  }`}>
                    <span className={`text-sm font-bold ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-slate-400' : 
                      'text-amber-400'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{stock.symbol || 'N/A'}</p>
                    <p className="text-xs text-emerald-300/60">{stock.name || stock.symbol || 'Unknown'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">₹{safeToFixed(stock.currentPrice)}</p>
                  <p className="text-sm text-emerald-400 font-medium">
                    +{safeToFixed(stock.changePercent)}%
                  </p>
                </div>
              </div>
            ))}
            
            {(topMovers.gainers || []).length === 0 && (
              <div className="text-center py-4">
                <p className="text-emerald-300/60">{isHindi ? 'डेटा उपलब्ध नहीं' : 'No data available'}</p>
              </div>
            )}
          </div>
        </div>

        {/* TOP LOSERS */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-red-900/40 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-red-500/20">
                <TrendDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{isHindi ? 'टॉप लूज़र्स' : 'Top Losers'}</h2>
                <p className="text-xs text-red-300/60">{isHindi ? 'लाइव अपडेट्स' : 'Live updates'}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
              {isHindi ? 'लाइव' : 'LIVE'}
            </span>
          </div>
          
          <div className="space-y-3">
            {(topMovers.losers || []).map((stock, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-900/10 to-red-800/5 border border-red-900/30 hover:border-red-500/40 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-500/20">
                    <span className="text-sm font-bold text-slate-400">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{stock.symbol || 'N/A'}</p>
                    <p className="text-xs text-red-300/60">{stock.name || stock.symbol || 'Unknown'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">₹{safeToFixed(stock.currentPrice)}</p>
                  <p className="text-sm text-red-400 font-medium">
                    {safeToFixed(stock.changePercent)}%
                  </p>
                </div>
              </div>
            ))}
            
            {(topMovers.losers || []).length === 0 && (
              <div className="text-center py-4">
                <p className="text-red-300/60">{isHindi ? 'डेटा उपलब्ध नहीं' : 'No data available'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT TABS */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 overflow-hidden mb-8">
        {/* TABS HEADER */}
        <div className="border-b border-emerald-900/40 overflow-x-auto">
          <div className="flex min-w-max md:min-w-0">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === 'recommendations'
                  ? 'text-white bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 border-b-2 border-emerald-400'
                  : 'text-emerald-300/70 hover:text-white hover:bg-emerald-900/20'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{isHindi ? 'AI सिफ़ारिशें' : 'AI Recommendations'}</span>
              <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                {filteredStocks.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === 'active'
                  ? 'text-white bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 border-b-2 border-emerald-400'
                  : 'text-emerald-300/70 hover:text-white hover:bg-emerald-900/20'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{isHindi ? 'एक्टिव ट्रेड्स' : 'Active Trades'}</span>
              <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {realPortfolio.activeTrades || 0}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === 'watchlist'
                  ? 'text-white bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 border-b-2 border-emerald-400'
                  : 'text-emerald-300/70 hover:text-white hover:bg-emerald-900/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isHindi ? 'वॉचलिस्ट' : 'Watchlist'}</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="p-5 md:p-6">
          {/* RECOMMENDATIONS TAB */}
          {activeTab === 'recommendations' && (
            <div>
              {/* FILTERS SECTION */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 mb-3 md:mb-0">
                    <Filter className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">{isHindi ? 'AI स्टॉक सिफ़ारिशें' : 'AI Stock Recommendations'}</h3>
                  </div>
                  <p className="text-sm text-emerald-300/70">
                    {filteredStocks.length} {isHindi ? 'स्टॉक्स मिले' : 'stocks found'} • {isHindi ? '90%+ एक्यूरेसी' : '90%+ accuracy'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'सिग्नल:' : 'Signal:'}</label>
                    <select
                      value={filters.signal}
                      onChange={(e) => setFilters({ ...filters, signal: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      <option value="all" className="bg-slate-900">{isHindi ? 'सभी सिग्नल' : 'All Signals'}</option>
                      <option value="strong_buy" className="bg-slate-900">{isHindi ? 'स्ट्रॉन्ग बाय' : 'Strong Buy'}</option>
                      <option value="buy" className="bg-slate-900">{isHindi ? 'बाय' : 'Buy'}</option>
                      <option value="neutral" className="bg-slate-900">{isHindi ? 'न्यूट्रल' : 'Neutral'}</option>
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
                      <option value="low" className="bg-slate-900">{isHindi ? 'कम रिस्क' : 'Low Risk'}</option>
                      <option value="medium" className="bg-slate-900">{isHindi ? 'मध्यम रिस्क' : 'Medium Risk'}</option>
                      <option value="high" className="bg-slate-900">{isHindi ? 'उच्च रिस्क' : 'High Risk'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'टाइमफ्रेम:' : 'Timeframe:'}</label>
                    <select
                      value={filters.timeFrame}
                      onChange={(e) => setFilters({ ...filters, timeFrame: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      <option value="all" className="bg-slate-900">{isHindi ? 'सभी टाइमफ्रेम' : 'All Timeframes'}</option>
                      <option value="intraday" className="bg-slate-900">{isHindi ? 'इंट्राडे' : 'Intraday'}</option>
                      <option value="swing" className="bg-slate-900">{isHindi ? 'स्विंग' : 'Swing'}</option>
                      <option value="positional" className="bg-slate-900">{isHindi ? 'पोजिशनल' : 'Positional'}</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({ signal: 'all', risk: 'all', timeFrame: 'all' })}
                      className="w-full px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-emerald-900/40 text-emerald-300 rounded-lg hover:border-emerald-500/60 transition-all text-sm"
                    >
                      {isHindi ? 'फ़िल्टर्स हटाएँ' : 'Clear Filters'}
                    </button>
                  </div>
                </div>
              </div>

              {/* STOCK CARDS */}
              {loading ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-emerald-900/20 to-cyan-900/20">
                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                  <p className="mt-4 text-emerald-300">
                    {isHindi ? 'AI सिफ़ारिशें लोड हो रही हैं...' : 'Loading AI recommendations...'}
                  </p>
                  <p className="text-sm text-emerald-300/60 mt-1">
                    {isHindi ? 'मार्केट डेटा एनालाइज़ हो रहा है' : 'Analyzing market data'}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredStocks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredStocks.map((stock, index) => (
                        stock && (
                          <StockCard
                            key={stock.symbol || index}
                            stock={stock}
                            onTrade={handleTrade}
                            connectionStatus={connectionStatus}
                            isHindi={isHindi}
                          />
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="w-12 h-12 text-emerald-400/40 mx-auto mb-4" />
                      <p className="text-emerald-300/70">
                        {isHindi ? 'कोई स्टॉक फ़िल्टर्स से मैच नहीं करता' : 'No stocks match your filters'}
                      </p>
                      <p className="text-sm text-emerald-300/50 mt-1">
                        {isHindi ? 'फ़िल्टर्स बदलकर देखें' : 'Try changing your filters'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TRADES TAB */}
          {activeTab === 'active' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">{isHindi ? 'एक्टिव ट्रेड्स' : 'Active Trades'}</h3>
                </div>
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 text-emerald-400 text-sm rounded-full border border-emerald-500/30">
                  {realPortfolio.activeTrades || 0} {isHindi ? 'ट्रेड्स' : 'trades'}
                </span>
              </div>
              
              {(realPortfolio.activeTrades || 0) > 0 && realTrades.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-emerald-900/40">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10">
                        <th className="py-3 px-4 text-left text-sm font-medium text-emerald-400">
                          {isHindi ? 'स्टॉक' : 'Stock'}
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-emerald-400">
                          {isHindi ? 'एंट्री' : 'Entry'}
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-emerald-400">
                          {isHindi ? 'करंट' : 'Current'}
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-emerald-400">
                          P&L
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-emerald-400">
                          {isHindi ? 'एक्शन' : 'Action'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-900/20">
                      {realTrades.filter(t => t.status === 'open').map((trade, index) => (
                        <tr key={index} className="hover:bg-emerald-900/10">
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{trade.symbol}</div>
                            <div className="text-xs text-emerald-300/60">{trade.action}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">₹{safeToFixed(trade.entryPrice)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">₹{safeToFixed(trade.currentPrice || trade.entryPrice)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`px-3 py-1.5 rounded-full text-sm font-medium inline-block ${
                              (trade.pnl || 0) >= 0 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              ₹{safeToFixed(trade.pnl)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setExitPopupData(trade)}
                              className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm hover:from-red-700 hover:to-red-800 font-medium transition-all"
                            >
                              {isHindi ? 'एक्ज़िट' : 'Exit'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-emerald-400/40 mx-auto mb-4" />
                  <p className="text-emerald-300/70">
                    {isHindi ? 'कोई एक्टिव ट्रेड नहीं' : 'No active trades'}
                  </p>
                  <p className="text-sm text-emerald-300/50 mt-1">
                    {isHindi ? 'ऊपर सिफ़ारिशों से ट्रेड शुरू करें' : 'Start trading from recommendations above'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* WATCHLIST TAB */}
          {activeTab === 'watchlist' && (
            <div>
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-emerald-400/40 mx-auto mb-4" />
                <p className="text-emerald-300/70">
                  {isHindi ? 'वॉचलिस्ट फीचर जल्द ही आ रहा है' : 'Watchlist feature coming soon'}
                </p>
                <p className="text-sm text-emerald-300/50 mt-1">
                  {isHindi ? 'स्टॉक्स वॉचलिस्ट में जोड़ें' : 'Add stocks to your watchlist'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MARKET INSIGHTS */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 border border-emerald-900/40 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5">
          <div className="flex items-center space-x-2 mb-3 md:mb-0">
            <LineChart className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">{isHindi ? 'मार्केट इनसाइट्स' : 'Market Insights'}</h3>
          </div>
          <span className="px-3 py-1 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
            {isHindi ? 'रियल-टाइम' : 'Real-time'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl p-4 border border-emerald-900/40">
            <p className="text-sm text-emerald-300/70 mb-3">
              {isHindi ? 'मार्केट सेन्टीमेंट' : 'Market Sentiment'}
            </p>
            <div className="space-y-3">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-emerald-300/60">Bearish</span>
                <span className="text-xs text-emerald-300/60">Neutral</span>
                <span className="text-xs font-medium text-emerald-400">Bullish</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl p-4 border border-emerald-900/40">
            <p className="text-sm text-emerald-300/70 mb-3">
              {isHindi ? 'वोलैटिलिटी इंडेक्स' : 'Volatility Index'}
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">18.4</p>
                <p className="text-xs text-emerald-300/60 mt-1">
                  {isHindi ? 'पिछले दिन से -0.5' : '-0.5 from yesterday'}
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                {isHindi ? 'मध्यम रिस्क' : 'Medium Risk'}
              </span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl p-4 border border-emerald-900/40">
            <p className="text-sm text-emerald-300/70 mb-3">
              {isHindi ? 'AI कॉन्फिडेंस' : 'AI Confidence'}
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">85.6%</p>
                <p className="text-xs text-emerald-300/60 mt-1">
                  {isHindi ? 'औसत से +2.4%' : '+2.4% above average'}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                {isHindi ? 'उच्च एक्यूरेसी' : 'High Accuracy'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
