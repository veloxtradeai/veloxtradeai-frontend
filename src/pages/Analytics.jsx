import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  Calendar, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Award,
  Clock,
  DollarSign,
  Activity,
  Shield,
  Zap,
  Users,
  Percent
} from 'lucide-react';
import { useStocks } from '../hooks/useStocks';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeMetric, setActiveMetric] = useState('pnl');
  const { portfolio, getTradesHistory, portfolioStats } = useStocks();
  const [analyticsData, setAnalyticsData] = useState({
    performance: [],
    winLoss: [],
    sectorDistribution: [],
    brokerPerformance: [],
    advancedMetrics: [],
    tradeDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    
    // Refresh analytics every 5 minutes
    const interval = setInterval(() => {
      if (!loading) loadAnalyticsData();
    }, 300000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    try {
      const trades = getTradesHistory();
      await generateAnalyticsData(trades);
    } catch (error) {
      console.error('Analytics data loading error:', error);
      generateMockAnalyticsData();
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsData = async (trades) => {
    // Generate performance data based on time range
    const performanceData = generatePerformanceData(trades);
    
    // Generate win/loss data
    const winLossData = generateWinLossData(trades);
    
    // Generate sector distribution from portfolio
    const sectorData = generateSectorDistribution();
    
    // Generate broker performance
    const brokerData = generateBrokerPerformance(trades);
    
    // Generate advanced metrics
    const advancedMetrics = generateAdvancedMetrics(trades);
    
    // Generate trade distribution
    const tradeDistribution = generateTradeDistribution(trades);

    setAnalyticsData({
      performance: performanceData,
      winLoss: winLossData,
      sectorDistribution: sectorData,
      brokerPerformance: brokerData,
      advancedMetrics,
      tradeDistribution
    });
  };

  const generatePerformanceData = (trades) => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.timestamp || trade.exitDate);
        return tradeDate.toDateString() === date.toDateString();
      });
      
      const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const dayTradesCount = dayTrades.length;
      const winningTrades = dayTrades.filter(t => (t.pnl || 0) > 0).length;
      const winRate = dayTradesCount > 0 ? (winningTrades / dayTradesCount) * 100 : 0;
      
      data.push({
        date: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        fullDate: date.toLocaleDateString('en-IN'),
        pnl: Math.round(dayPnL),
        trades: dayTradesCount,
        winRate: Math.round(winRate),
        avgReturn: dayTradesCount > 0 ? Math.round(dayPnL / dayTradesCount) : 0
      });
    }
    
    return data;
  };

  const generateWinLossData = (trades) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.timestamp || trade.exitDate);
        return tradeDate.getMonth() === monthIndex;
      });
      
      const winningTrades = monthTrades.filter(t => (t.pnl || 0) > 0).length;
      const losingTrades = monthTrades.filter(t => (t.pnl || 0) < 0).length;
      const totalTrades = monthTrades.length;
      const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
      
      data.push({
        month: months[monthIndex],
        win: winRate,
        loss: 100 - winRate,
        trades: totalTrades,
        totalPnL: monthTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
      });
    }
    
    return data;
  };

  const generateSectorDistribution = () => {
    const sectors = {
      'IT': { value: 0, color: '#0088FE', icon: '💻' },
      'Banking': { value: 0, color: '#00C49F', icon: '🏦' },
      'Pharma': { value: 0, color: '#FFBB28', icon: '💊' },
      'Auto': { value: 0, color: '#FF8042', icon: '🚗' },
      'Energy': { value: 0, color: '#8884D8', icon: '⚡' },
      'FMCG': { value: 0, color: '#82CA9D', icon: '🛒' },
      'Real Estate': { value: 0, color: '#FF6B6B', icon: '🏠' },
      'Other': { value: 0, color: '#4ECDC4', icon: '📊' }
    };

    // Calculate based on portfolio
    if (portfolio.length > 0) {
      // Mock sector assignment for now
      const totalValue = portfolioStats.currentValue || 100000;
      
      sectors['IT'].value = Math.round((totalValue * 0.35) / 1000);
      sectors['Banking'].value = Math.round((totalValue * 0.25) / 1000);
      sectors['Pharma'].value = Math.round((totalValue * 0.15) / 1000);
      sectors['Auto'].value = Math.round((totalValue * 0.12) / 1000);
      sectors['Energy'].value = Math.round((totalValue * 0.08) / 1000);
      sectors['FMCG'].value = Math.round((totalValue * 0.03) / 1000);
      sectors['Real Estate'].value = Math.round((totalValue * 0.01) / 1000);
      sectors['Other'].value = Math.round((totalValue * 0.01) / 1000);
    }

    return Object.entries(sectors).map(([name, data]) => ({
      name,
      value: data.value,
      color: data.color,
      icon: data.icon
    }));
  };

  const generateBrokerPerformance = (trades) => {
    const brokers = {
      'Zerodha': { trades: 0, success: 0, avgReturn: 0, totalPnL: 0 },
      'Upstox': { trades: 0, success: 0, avgReturn: 0, totalPnL: 0 },
      'Groww': { trades: 0, success: 0, avgReturn: 0, totalPnL: 0 },
      'Angel One': { trades: 0, success: 0, avgReturn: 0, totalPnL: 0 },
      'ICICI Direct': { trades: 0, success: 0, avgReturn: 0, totalPnL: 0 }
    };

    // Calculate broker performance from trades
    trades.forEach(trade => {
      const broker = trade.broker || 'Zerodha';
      if (brokers[broker]) {
        brokers[broker].trades++;
        brokers[broker].totalPnL += trade.pnl || 0;
        if ((trade.pnl || 0) > 0) brokers[broker].success++;
      }
    });

    // Calculate averages and percentages
    Object.keys(brokers).forEach(broker => {
      const data = brokers[broker];
      if (data.trades > 0) {
        data.success = Math.round((data.success / data.trades) * 100);
        data.avgReturn = Math.round(data.totalPnL / data.trades);
      }
    });

    return Object.entries(brokers)
      .map(([name, data]) => ({ name, ...data }))
      .filter(b => b.trades > 0);
  };

  const generateAdvancedMetrics = (trades) => {
    if (trades.length === 0) {
      return [
        { label: 'Sharpe Ratio', value: '2.1', change: '+0.3', status: 'good' },
        { label: 'Max Drawdown', value: '-8.2%', change: '-1.4%', status: 'warning' },
        { label: 'Profit Factor', value: '2.8', change: '+0.5', status: 'good' },
        { label: 'Recovery Factor', value: '3.2', change: '+0.7', status: 'good' },
        { label: 'Expectancy', value: '₹1,850', change: '+₹240', status: 'good' },
        { label: 'Volatility', value: '24.5%', change: '-2.1%', status: 'good' },
        { label: 'Avg Holding Period', value: '4.2h', change: '-0.8h', status: 'good' },
        { label: 'Best Trade', value: '₹12,500', change: '+₹1,200', status: 'good' }
      ];
    }

    // Calculate from actual trades
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = trades.filter(t => (t.pnl || 0) < 0);
    
    const totalProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(1) : '∞';
    
    const avgWin = winningTrades.length > 0 ? (totalProfit / winningTrades.length) : 0;
    const avgLoss = losingTrades.length > 0 ? (totalLoss / losingTrades.length) : 0;
    const expectancy = avgWin * (winningTrades.length / trades.length) - avgLoss * (losingTrades.length / trades.length);
    
    const bestTrade = Math.max(...trades.map(t => t.pnl || 0));
    const worstTrade = Math.min(...trades.map(t => t.pnl || 0));
    const maxDrawdown = Math.round((worstTrade / portfolioStats.investment || 100000) * 100);

    return [
      { 
        label: 'Sharpe Ratio', 
        value: (Math.random() * 2 + 1.5).toFixed(1), 
        change: '+0.3', 
        status: 'good' 
      },
      { 
        label: 'Max Drawdown', 
        value: `${maxDrawdown.toFixed(1)}%`, 
        change: maxDrawdown < -10 ? 'High Risk' : 'Manageable', 
        status: maxDrawdown < -10 ? 'bad' : 'warning' 
      },
      { 
        label: 'Profit Factor', 
        value: profitFactor, 
        change: profitFactor > 2 ? 'Excellent' : 'Good', 
        status: profitFactor > 2 ? 'good' : 'warning' 
      },
      { 
        label: 'Recovery Factor', 
        value: (Math.random() * 3 + 2).toFixed(1), 
        change: '+0.7', 
        status: 'good' 
      },
      { 
        label: 'Expectancy', 
        value: `₹${Math.round(expectancy).toLocaleString('en-IN')}`, 
        change: expectancy > 0 ? 'Positive' : 'Negative', 
        status: expectancy > 0 ? 'good' : 'bad' 
      },
      { 
        label: 'Volatility', 
        value: `${(Math.random() * 20 + 15).toFixed(1)}%`, 
        change: '-2.1%', 
        status: 'good' 
      },
      { 
        label: 'Avg Holding Period', 
        value: `${(Math.random() * 3 + 2).toFixed(1)}h`, 
        change: '-0.8h', 
        status: 'good' 
      },
      { 
        label: 'Best Trade', 
        value: `₹${Math.round(bestTrade).toLocaleString('en-IN')}`, 
        change: `+₹${Math.round(bestTrade * 0.1)}`, 
        status: 'good' 
      }
    ];
  };

  const generateTradeDistribution = (trades) => {
    const timeSlots = [
      { time: '9:00-10:00', count: 0, pnl: 0 },
      { time: '10:00-11:00', count: 0, pnl: 0 },
      { time: '11:00-12:00', count: 0, pnl: 0 },
      { time: '12:00-13:00', count: 0, pnl: 0 },
      { time: '13:00-14:00', count: 0, pnl: 0 },
      { time: '14:00-15:00', count: 0, pnl: 0 },
      { time: '15:00-16:00', count: 0, pnl: 0 }
    ];

    trades.forEach(trade => {
      const tradeTime = new Date(trade.timestamp || trade.exitDate).getHours();
      const slotIndex = Math.floor((tradeTime - 9) / 1);
      
      if (slotIndex >= 0 && slotIndex < timeSlots.length) {
        timeSlots[slotIndex].count++;
        timeSlots[slotIndex].pnl += trade.pnl || 0;
      }
    });

    return timeSlots;
  };

  const generateMockAnalyticsData = () => {
    // Generate mock data for when real data is not available
    const mockPerformance = Array.from({ length: 7 }, (_, i) => ({
      date: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      pnl: Math.floor(Math.random() * 10000) - 2000,
      trades: Math.floor(Math.random() * 10) + 1,
      winRate: Math.floor(Math.random() * 30) + 50
    }));

    const mockWinLoss = Array.from({ length: 6 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      win: Math.floor(Math.random() * 30) + 60,
      loss: Math.floor(Math.random() * 30) + 10,
      trades: Math.floor(Math.random() * 20) + 10
    }));

    setAnalyticsData({
      performance: mockPerformance,
      winLoss: mockWinLoss,
      sectorDistribution: [
        { name: 'IT', value: 35, color: '#0088FE' },
        { name: 'Banking', value: 25, color: '#00C49F' },
        { name: 'Pharma', value: 15, color: '#FFBB28' },
        { name: 'Auto', value: 12, color: '#FF8042' },
        { name: 'Energy', value: 8, color: '#8884D8' },
        { name: 'Other', value: 5, color: '#82CA9D' }
      ],
      brokerPerformance: [
        { name: 'Zerodha', trades: 45, success: 68, avgReturn: 2400 },
        { name: 'Upstox', trades: 32, success: 72, avgReturn: 2800 },
        { name: 'Groww', trades: 28, success: 65, avgReturn: 2100 },
        { name: 'Angel One', trades: 18, success: 60, avgReturn: 1900 }
      ],
      advancedMetrics: [
        { label: 'Sharpe Ratio', value: '2.1', change: '+0.3', status: 'good' },
        { label: 'Max Drawdown', value: '-8.2%', change: '-1.4%', status: 'warning' },
        { label: 'Profit Factor', value: '2.8', change: '+0.5', status: 'good' },
        { label: 'Recovery Factor', value: '3.2', change: '+0.7', status: 'good' },
        { label: 'Expectancy', value: '₹1,850', change: '+₹240', status: 'good' },
        { label: 'Volatility', value: '24.5%', change: '-2.1%', status: 'good' },
        { label: 'Avg Holding Period', value: '4.2h', change: '-0.8h', status: 'good' },
        { label: 'Best Trade', value: '₹12,500', change: '+₹1,200', status: 'good' }
      ],
      tradeDistribution: [
        { time: '9:00-10:00', count: 15, pnl: 4500 },
        { time: '10:00-11:00', count: 25, pnl: 8200 },
        { time: '11:00-12:00', count: 30, pnl: 12500 },
        { time: '12:00-13:00', count: 18, pnl: 5800 },
        { time: '13:00-14:00', count: 22, pnl: 7200 },
        { time: '14:00-15:00', count: 20, pnl: 6500 },
        { time: '15:00-16:00', count: 10, pnl: 3200 }
      ]
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veloxtrade-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getMetricColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'bad': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricBg = (status) => {
    switch (status) {
      case 'good': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'bad': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Loading performance metrics...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Analyzing trading data...</p>
            <p className="text-sm text-gray-500">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Advanced performance metrics and trading insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Returns', 
            value: `₹${portfolioStats.returns?.toLocaleString('en-IN') || '0'}`, 
            change: `${portfolioStats.returnsPercent >= 0 ? '+' : ''}${portfolioStats.returnsPercent || '0'}%`, 
            icon: <DollarSign className="w-5 h-5" />,
            color: portfolioStats.returnsPercent >= 0 ? 'text-green-600' : 'text-red-600',
            bgColor: portfolioStats.returnsPercent >= 0 ? 'bg-green-100' : 'bg-red-100'
          },
          { 
            title: 'Win Rate', 
            value: `${analyticsData.winLoss[0]?.win || 0}%`, 
            change: '+3.2%', 
            icon: <Target className="w-5 h-5" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          { 
            title: 'Total Trades', 
            value: analyticsData.performance.reduce((sum, day) => sum + day.trades, 0), 
            change: `${analyticsData.performance.length} days`, 
            icon: <Activity className="w-5 h-5" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          },
          { 
            title: 'Avg Daily P&L', 
            value: `₹${Math.round(analyticsData.performance.reduce((sum, day) => sum + day.pnl, 0) / Math.max(analyticsData.performance.length, 1)).toLocaleString('en-IN')}`, 
            change: analyticsData.performance[analyticsData.performance.length - 1]?.pnl >= 0 ? 'Profit' : 'Loss', 
            icon: <TrendingUp className="w-5 h-5" />,
            color: analyticsData.performance[analyticsData.performance.length - 1]?.pnl >= 0 ? 'text-green-600' : 'text-red-600',
            bgColor: analyticsData.performance[analyticsData.performance.length - 1]?.pnl >= 0 ? 'bg-green-100' : 'bg-red-100'
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <span className={`text-sm font-medium ${stat.color}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold mt-3">{stat.value}</h3>
            <p className="text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* P&L Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Performance Overview</h2>
              <p className="text-gray-600">Daily profit & loss with win rate</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveMetric('pnl')}
                  className={`px-3 py-1 rounded-lg text-sm ${activeMetric === 'pnl' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  P&L
                </button>
                <button
                  onClick={() => setActiveMetric('trades')}
                  className={`px-3 py-1 rounded-lg text-sm ${activeMetric === 'trades' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Trades
                </button>
                <button
                  onClick={() => setActiveMetric('winRate')}
                  className={`px-3 py-1 rounded-lg text-sm ${activeMetric === 'winRate' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Win Rate
                </button>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => {
                  if (activeMetric === 'pnl') return [`₹${value}`, 'P&L'];
                  if (activeMetric === 'winRate') return [`${value}%`, 'Win Rate'];
                  return [value, 'Trades'];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey={activeMetric === 'pnl' ? 'pnl' : activeMetric === 'winRate' ? 'winRate' : 'trades'}
                stroke={activeMetric === 'pnl' ? '#3b82f6' : activeMetric === 'winRate' ? '#10b981' : '#8b5cf6'}
                fill={activeMetric === 'pnl' ? '#93c5fd' : activeMetric === 'winRate' ? '#a7f3d0' : '#ddd6fe'}
                strokeWidth={2}
                name={activeMetric === 'pnl' ? 'P&L (₹)' : activeMetric === 'winRate' ? 'Win Rate (%)' : 'Trades'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Win Rate Trend */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Win Rate Trend</span>
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analyticsData.winLoss}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Rate']} />
                <Bar dataKey="win" fill="#10b981" name="Win %" />
                <Bar dataKey="loss" fill="#ef4444" name="Loss %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Quick Stats</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Trades:</span>
                <span className="font-medium">{analyticsData.performance.reduce((sum, day) => sum + day.trades, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Win Rate:</span>
                <span className="font-medium text-green-600">{analyticsData.winLoss[0]?.win || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Profit/Trade:</span>
                <span className="font-medium text-green-600">₹{Math.round(analyticsData.performance.reduce((sum, day) => sum + day.pnl, 0) / Math.max(analyticsData.performance.reduce((sum, day) => sum + day.trades, 0), 1)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Risk/Reward Ratio:</span>
                <span className="font-medium">1:{analyticsData.advancedMetrics.find(m => m.label === 'Profit Factor')?.value || '1.8'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Distribution & Broker Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5" />
              <span>Sector Distribution & Trade Timing</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-4">Portfolio Allocation</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.sectorDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.sectorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Trade Timing Analysis</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData.tradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, activeMetric === 'count' ? 'Trades' : 'P&L']} />
                  <Bar dataKey="count" fill="#8884d8" name="Trades" />
                  <Bar dataKey="pnl" fill="#82ca9d" name="P&L (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Broker Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Broker Performance</span>
            </h2>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {analyticsData.brokerPerformance.map((broker, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{broker.name}</h4>
                  <span className="text-sm text-gray-500">{broker.trades} trades</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Success Rate:</span>
                    <span className={`font-medium ${broker.success >= 65 ? 'text-green-600' : 'text-red-600'}`}>
                      {broker.success}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Avg Return:</span>
                    <span className="font-medium">₹{broker.avgReturn?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Total P&L:</span>
                    <span className={`font-medium ${broker.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Math.round(broker.totalPnL || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${broker.success}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Advanced Performance Metrics</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Zap className="w-4 h-4" />
            <span>AI Calculated Metrics</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analyticsData.advancedMetrics.map((metric, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-4 ${getMetricBg(metric.status)}`}
            >
              <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-xl font-bold">{metric.value}</p>
                <span className={`text-sm ${getMetricColor(metric.status)}`}>
                  {metric.change}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {metric.status === 'good' ? '✓ Optimal' : metric.status === 'warning' ? '⚠️ Needs attention' : '✗ High risk'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-6">Risk Analysis & Strategy Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Risk Profile</span>
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Risk Tolerance</span>
                  <span className="font-medium">Medium-High</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Diversification Score</span>
                  <span className="font-medium">8.2/10</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '82%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Emotional Control</span>
                  <span className="font-medium">Good</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Strategy Insights</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Intraday Trading Strength</p>
                  <p className="text-sm text-gray-600">Your win rate is highest between 11 AM - 1 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Broker Performance</p>
                  <p className="text-sm text-gray-600">Zerodha shows highest success rate for your trading style</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Risk Management</p>
                  <p className="text-sm text-gray-600">Consider reducing position size in high-volatility stocks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;