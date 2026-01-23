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
  const { stocks, loading, refreshStocks, portfolioStats, marketStatus, realTimeData } = useStocks();
  const [filters, setFilters] = useState({
    signal: 'all',
    risk: 'all',
    timeFrame: 'all'
  });
  const [activeTab, setActiveTab] = useState('recommendations');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Safe portfolio stats with defaults
const safePortfolioStats = {
  currentValue: portfolioStats?.currentValue || 0,
  returnsPercent: portfolioStats?.returnsPercent || 0,
  dailyPnL: portfolioStats?.dailyPnL || 0,
  activeTrades: portfolioStats?.activeTrades || 0,
  holdingsCount: portfolioStats?.holdingsCount || 0
};
  // Safe market status with defaults
  const safeMarketStatus = {
    isOpen: marketStatus?.isOpen || false,
    nextOpen: marketStatus?.nextOpen || 'Tomorrow 9:15 AM'
  };

  // Update timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Dashboard stats
  const stats = [
    { 
      title: 'Portfolio Value', 
      value: `₹${safePortfolioStats.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, 
      change: `${safePortfolioStats.returnsPercent >= 0 ? '+' : ''}${safePortfolioStats.returnsPercent.toFixed(1)}%`, 
      icon: <DollarSign className="w-6 h-6" />,
      color: safePortfolioStats.returnsPercent >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: safePortfolioStats.returnsPercent >= 0 ? 'bg-green-100' : 'bg-red-100',
      trend: safePortfolioStats.returnsPercent >= 0 ? 'up' : 'down'
    },
    { 
      title: 'Daily P&L', 
      value: `₹${safePortfolioStats.dailyPnL >= 0 ? '+' : ''}${safePortfolioStats.dailyPnL.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, 
      change: safePortfolioStats.dailyPnL >= 0 ? 'Today' : 'Today', 
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

  // Top gainers and losers
  const getTopMovers = () => {
    if (!stocks || !stocks.length) return { gainers: [], losers: [] };
    
    const sorted = [...stocks].sort((a, b) => {
      const aChange = realTimeData && realTimeData[a.symbol]?.changePercent || 0;
      const bChange = realTimeData && realTimeData[b.symbol]?.changePercent || 0;
      return bChange - aChange;
    });
    
    return {
      gainers: sorted.slice(0, 3),
      losers: sorted.slice(-3).reverse()
    };
  };

  const topMovers = getTopMovers();

  const handleTrade = (type, data) => {
    console.log(`${type} trade:`, data);
    // Trading logic will be implemented when backend is ready
    alert(`Trade ${type} triggered for ${data.symbol}. This will be implemented with backend.`);
  };

  const filteredStocks = stocks ? stocks.filter(stock => {
    if (filters.signal !== 'all' && stock.signal !== filters.signal) return false;
    if (filters.risk !== 'all' && stock.riskLevel !== filters.risk) return false;
    if (filters.timeFrame !== 'all' && stock.timeFrame !== filters.timeFrame) return false;
    return true;
  }) : [];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-6">
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

      {/* Stats Grid */}
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

      {/* Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-500" />
              <span>Top Gainers</span>
            </h2>
            <span className="text-sm text-green-600">Live</span>
          </div>
          
          <div className="space-y-3">
            {topMovers.gainers.length > 0 ? (
              topMovers.gainers.map((stock, index) => {
                const realTimePrice = realTimeData && realTimeData[stock.symbol]?.price;
                const realTimeChange = realTimeData && realTimeData[stock.symbol]?.changePercent;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium">{stock.symbol}</p>
                      <p className="text-sm text-gray-500">{stock.name || stock.companyName || stock.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{(realTimePrice || stock.currentPrice || 0).toFixed(2)}</p>
                      <p className="text-sm text-green-600">
                        +{(realTimeChange || stock.changePercent || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                No gainers data available
              </div>
            )}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span>Top Losers</span>
            </h2>
            <span className="text-sm text-red-600">Live</span>
          </div>
          
          <div className="space-y-3">
            {topMovers.losers.length > 0 ? (
              topMovers.losers.map((stock, index) => {
                const realTimePrice = realTimeData && realTimeData[stock.symbol]?.price;
                const realTimeChange = realTimeData && realTimeData[stock.symbol]?.changePercent;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium">{stock.symbol}</p>
                      <p className="text-sm text-gray-500">{stock.name || stock.companyName || stock.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{(realTimePrice || stock.currentPrice || 0).toFixed(2)}</p>
                      <p className="text-sm text-red-600">
                        {(realTimeChange || stock.changePercent || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                No losers data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Recommendations/Active Trades */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recommendations
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Trades ({safePortfolioStats.activeTrades})
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'watchlist'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Watchlist
            </button>
          </nav>
        </div>

        {activeTab === 'recommendations' && (
          <div className="p-6">
            {/* Filters */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>AI Stock Recommendations</span>
                </h2>
                <span className="text-sm text-gray-500">{filteredStocks.length} stocks found</span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.signal}
                  onChange={(e) => setFilters({ ...filters, signal: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Signals</option>
                  <option value="strong_buy">Strong Buy</option>
                  <option value="buy">Buy</option>
                  <option value="neutral">Neutral</option>
                  <option value="sell">Sell</option>
                  <option value="strong_sell">Strong Sell</option>
                </select>

                <select
                  value={filters.risk}
                  onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>

                <select
                  value={filters.timeFrame}
                  onChange={(e) => setFilters({ ...filters, timeFrame: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Time Frames</option>
                  <option value="intraday">Intraday</option>
                  <option value="swing">Swing (1-5 days)</option>
                  <option value="positional">Positional (5-30 days)</option>
                </select>

                <button
                  onClick={() => setFilters({ signal: 'all', risk: 'all', timeFrame: 'all' })}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Stock Cards */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading AI recommendations...</p>
                <p className="text-sm text-gray-500">Analyzing market data and patterns</p>
              </div>
            ) : (
              <div>
                {filteredStocks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStocks.map((stock, index) => (
                      <StockCard
                        key={stock.symbol || index}
                        stock={stock}
                        onTrade={handleTrade}
                        realTimeData={realTimeData && realTimeData[stock.symbol]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No stocks match your current filters</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your filter criteria or refresh data</p>
                    <button
                      onClick={refreshStocks}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Refresh Data
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Active Trades</h2>
            {safePortfolioStats.activeTrades > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Stock</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Entry</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Current</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">P&L</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">SL/Target</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Time</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-center text-gray-500" colSpan="7">
                        No active trades. Start trading from recommendations above!
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active trades</p>
                <p className="text-sm text-gray-400 mt-1">Start trading from the recommendations above</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Your Watchlist</h2>
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Watchlist feature coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Add stocks to your watchlist for quick access</p>
              <button className="mt-4 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Market Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Market Insights</span>
          </h2>
          <span className="text-sm text-blue-600">Real-time</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-sm text-gray-500 mb-1">Market Sentiment</p>
            <div className="flex items-center space-x-2">
              <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '65%' }}></div>
              </div>
              <span className="text-sm font-medium text-green-600">Bullish</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-sm text-gray-500 mb-1">Volatility Index</p>
            <p className="text-lg font-bold">18.4</p>
            <p className="text-xs text-gray-500">Medium Risk</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 hover:shadow-sm transition-shadow">
            <p className="text-sm text-gray-500 mb-1">AI Confidence</p>
            <p className="text-lg font-bold">85.6%</p>
            <p className="text-xs text-gray-500">High Accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
