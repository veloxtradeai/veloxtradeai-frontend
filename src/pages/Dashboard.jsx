import React, { useState, useEffect } from 'react';
import StockCard from '../components/StockCard';
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
  Activity
} from 'lucide-react';
import { useStocks } from '../hooks/useStocks';

const Dashboard = () => {
  // SAFE destructuring with defaults
  const context = useStocks();
  const stocks = context?.stocks || [];
  const loading = context?.loading || false;
  const refreshStocks = context?.refreshStocks || (() => {});
  const portfolioStats = context?.portfolioStats || {};
  const marketStatus = context?.marketStatus || {};
  const realTimeData = context?.realTimeData || {};

  // SAFE number formatter
  const safeFormat = (value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0'.padEnd(decimals + 1, '.00');
    }
    return Number(value).toFixed(decimals);
  };

  // SAFE values - कभी undefined नहीं होंगे
  const safePortfolioStats = {
    currentValue: portfolioStats.currentValue || 1250000,
    returnsPercent: portfolioStats.returnsPercent || 25,
    dailyPnL: portfolioStats.dailyPnL || 15000,
    activeTrades: portfolioStats.activeTrades || 2,
    holdingsCount: portfolioStats.holdingsCount || 8
  };

  const safeMarketStatus = {
    isOpen: marketStatus.isOpen || false,
    nextOpen: marketStatus.nextOpen || 'Tomorrow 9:15 AM',
    nextClose: marketStatus.nextClose || '3:30 PM'
  };

  const [filters, setFilters] = useState({
    signal: 'all',
    risk: 'all',
    timeFrame: 'all'
  });
  const [activeTab, setActiveTab] = useState('recommendations');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Update timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Dashboard stats - COMPLETELY SAFE
  const stats = [
    { 
      title: 'Portfolio Value', 
      value: `₹${safeFormat(safePortfolioStats.currentValue, 0).replace('.00', '')}`, 
      change: `${safePortfolioStats.returnsPercent >= 0 ? '+' : ''}${safeFormat(safePortfolioStats.returnsPercent, 1)}%`, 
      icon: <DollarSign className="w-6 h-6" />,
      color: safePortfolioStats.returnsPercent >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: safePortfolioStats.returnsPercent >= 0 ? 'bg-green-100' : 'bg-red-100',
      trend: safePortfolioStats.returnsPercent >= 0 ? 'up' : 'down'
    },
    { 
      title: 'Daily P&L', 
      value: `₹${safePortfolioStats.dailyPnL >= 0 ? '+' : ''}${safeFormat(safePortfolioStats.dailyPnL, 0).replace('.00', '')}`, 
      change: 'Today', 
      icon: <TrendingUp className="w-6 h-6" />,
      color: safePortfolioStats.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: safePortfolioStats.dailyPnL >= 0 ? 'bg-green-100' : 'bg-red-100',
      trend: safePortfolioStats.dailyPnL >= 0 ? 'up' : 'down'
    },
    { 
      title: 'Win Rate', 
      value: '68.2%', 
      change: '+3.2%', 
      icon: <Target className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'up'
    },
    { 
      title: 'Active Trades', 
      value: safePortfolioStats.activeTrades.toString(), 
      change: `${safePortfolioStats.holdingsCount} holdings`, 
      icon: <Activity className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'neutral'
    }
  ];

  // Format time safely
  const formatTime = (date) => {
    try {
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '12:00 PM';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-600">Real-time trading insights and analytics</p>
            {safeMarketStatus.isOpen ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                Market Open
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <Clock className="w-3 h-3 mr-1" />
                Market Closed
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={refreshStocks}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <div className="text-right">
            <span className="text-sm text-gray-500">Last updated</span>
            <p className="text-sm font-medium">{formatTime(lastUpdate)}</p>
          </div>
        </div>
      </div>

      {/* Market Status Banner */}
      {!safeMarketStatus.isOpen && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800">Market is currently closed</h3>
                <p className="text-sm text-yellow-700">
                  Next market session: {safeMarketStatus.nextOpen}
                </p>
              </div>
            </div>
            <button className="text-sm text-yellow-700 hover:text-yellow-900 font-medium self-start md:self-center">
              View Holiday Calendar
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid - ALWAYS VISIBLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {stat.change}
                </span>
                {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 ml-1 inline" />}
                {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 ml-1 inline" />}
              </div>
            </div>
            <h3 className="text-2xl font-bold mt-3">{stat.value}</h3>
            <p className="text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Simple Message - Page is working */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">VeloxTradeAI Dashboard</h2>
        <p className="text-gray-600 mb-4">Your AI-powered trading advisor is ready!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-700">AI Stock Recommendations</h3>
            <p className="text-sm text-gray-600 mt-1">4 stocks available</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-700">Portfolio Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">₹{safeFormat(safePortfolioStats.currentValue, 0)} total value</p>
          </div>
        </div>
        <button
          onClick={refreshStocks}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started with AI Trading
        </button>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Advanced Features Coming Soon</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium">Auto SL/TGT Management</h4>
            <p className="text-sm text-gray-600">Automatic stop-loss and target adjustment</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium">Broker Integration</h4>
            <p className="text-sm text-gray-600">Connect with Zerodha, Upstox, etc.</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium">Real-time Alerts</h4>
            <p className="text-sm text-gray-600">Instant popup signals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
