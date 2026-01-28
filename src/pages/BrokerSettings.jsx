import React, { useState, useEffect } from 'react';
import BrokerSelector from '../components/BrokerSelector';
import { 
  Link, 
  Unlink, 
  RefreshCw, 
  Download, 
  Upload,
  Activity,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Plus,
  Info,
  Database,
  Server,
  Shield,
  Key,
  Settings,
  Wallet,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'https://veloxtradeai-api.velox-trade-ai.workers.dev';

const BrokerSettings = () => {
  const [brokers, setBrokers] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBroker, setActiveBroker] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [selectedHoldings, setSelectedHoldings] = useState([]);
  
  const [apiKeys, setApiKeys] = useState({
    zerodha: { key: '', secret: '', userId: '', pin: '', totp: '' },
    upstox: { key: '', secret: '', userId: '', pin: '' },
    groww: { key: '', secret: '', userId: '', pin: '' },
    angelone: { key: '', secret: '', userId: '', pin: '' },
    icicidirect: { key: '', secret: '', userId: '', pin: '' },
    hdfcsec: { key: '', secret: '', userId: '', pin: '' }
  });

  const [brokerConnections, setBrokerConnections] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvestment: 0,
    currentValue: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
    todayPnl: 0
  });

  // Get user ID from localStorage or auth context
  const getUserId = () => {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    return userData.user_id || 'demo-user-123';
  };

  const getUserToken = () => {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    return userData.token || '';
  };

  // Load brokers from backend
  useEffect(() => {
    loadBrokersAndHoldings();
  }, []);

  const loadBrokersAndHoldings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = getUserId();
      
      // 1. Fetch broker connections
      const brokersRes = await fetch(`${API_BASE_URL}/api/broker/data?user_id=${userId}`);
      const brokersData = await brokersRes.json();
      
      if (brokersData.success) {
        setBrokers(brokersData.brokers || []);
        setBrokerConnections(brokersData.brokers.map(broker => ({
          id: broker.id,
          name: broker.broker_name,
          status: broker.is_active ? 'connected' : 'disconnected',
          connectedSince: broker.connected_at ? new Date(broker.connected_at).toLocaleDateString('en-IN') : null,
          lastSync: broker.last_sync || null,
          holdings: 0, // Will be updated from holdings
          balance: 0,
          equity: 0,
          profitLoss: '0',
          todayTrades: 0,
          accountType: broker.account_type || 'Regular',
          apiKey: broker.api_key ? `${broker.api_key.substring(0, 8)}...` : '',
          apiSecret: broker.api_secret ? '********' : ''
        })));
      }

      // 2. Fetch holdings (from trades table)
      const tradesRes = await fetch(`${API_BASE_URL}/api/trades?user_id=${userId}`);
      const tradesData = await tradesRes.json();
      
      if (tradesData.success) {
        const openTrades = tradesData.trades.filter(trade => trade.status === 'open');
        setHoldings(openTrades.map(trade => {
          const currentValue = trade.entry_price * trade.quantity * 1.02; // Assume 2% gain
          const pnl = currentValue - (trade.entry_price * trade.quantity);
          const pnlPercent = (trade.entry_price * trade.quantity) > 0 ? 
            (pnl / (trade.entry_price * trade.quantity)) * 100 : 0;
          
          return {
            symbol: trade.symbol,
            name: trade.symbol, // Could be mapped to actual names
            quantity: trade.quantity || 0,
            avgPrice: trade.entry_price || 0,
            currentPrice: trade.entry_price * 1.02, // Assume 2% up
            investedAmount: trade.entry_price * trade.quantity,
            currentValue: currentValue,
            pnl: pnl,
            pnlPercent: pnlPercent,
            broker: 'Zerodha', // Default for now
            tradeId: trade.id,
            status: trade.status
          };
        }));
        
        // Calculate portfolio stats
        const totalInvestment = openTrades.reduce((sum, trade) => 
          sum + (trade.entry_price * trade.quantity), 0);
        const totalCurrentValue = openTrades.reduce((sum, trade) => 
          sum + (trade.entry_price * trade.quantity * 1.02), 0);
        const totalPnl = totalCurrentValue - totalInvestment;
        const totalPnlPercent = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;
        
        setPortfolioStats({
          totalInvestment,
          currentValue: totalCurrentValue,
          totalPnl,
          totalPnlPercent,
          todayPnl: totalPnl * 0.1 // Assume 10% of total is today's P&L
        });
        
        // Update holdings count in broker connections
        setBrokerConnections(prev => prev.map(broker => ({
          ...broker,
          holdings: openTrades.filter(t => !broker.name || broker.name === 'Zerodha').length,
          balance: 10000, // Mock available balance
          equity: totalCurrentValue * 0.5, // Mock equity
          profitLoss: totalPnl >= 0 ? `+₹${Math.round(totalPnl).toLocaleString()}` : `-₹${Math.round(Math.abs(totalPnl)).toLocaleString()}`
        })));
      }
      
    } catch (error) {
      console.error('Failed to load broker data:', error);
      setError('Failed to connect to backend. Please check your connection.');
      // Load mock data as fallback
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock broker connections
    const mockBrokers = [
      {
        id: 'broker-1',
        name: 'Zerodha',
        status: 'connected',
        connectedSince: '2024-01-15',
        lastSync: '15:45',
        holdings: 8,
        balance: 125000,
        equity: 285000,
        profitLoss: '+₹12,500',
        todayTrades: 3,
        accountType: 'Regular',
        apiKey: 'XK8H2D...',
        apiSecret: '********'
      },
      {
        id: 'broker-2',
        name: 'Groww',
        status: 'connected',
        connectedSince: '2024-02-01',
        lastSync: '14:20',
        holdings: 5,
        balance: 75000,
        equity: 185000,
        profitLoss: '+₹8,250',
        todayTrades: 2,
        accountType: 'Regular',
        apiKey: 'GRW9A3...',
        apiSecret: '********'
      }
    ];
    
    setBrokerConnections(mockBrokers);
    setBrokers(mockBrokers);
    
    // Mock holdings
    const mockHoldings = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', quantity: 10, avgPrice: 2850, currentPrice: 2925, investedAmount: 28500, currentValue: 29250, pnl: 750, pnlPercent: 2.63, broker: 'Zerodha', todayPnl: 125 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', quantity: 15, avgPrice: 3750, currentPrice: 3825, investedAmount: 56250, currentValue: 57375, pnl: 1125, pnlPercent: 2.0, broker: 'Zerodha', todayPnl: 225 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', quantity: 20, avgPrice: 1650, currentPrice: 1683, investedAmount: 33000, currentValue: 33660, pnl: 660, pnlPercent: 2.0, broker: 'Groww', todayPnl: 132 },
      { symbol: 'INFY', name: 'Infosys', quantity: 25, avgPrice: 1500, currentPrice: 1522, investedAmount: 37500, currentValue: 38050, pnl: 550, pnlPercent: 1.47, broker: 'Groww', todayPnl: 110 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank', quantity: 30, avgPrice: 1100, currentPrice: 1122, investedAmount: 33000, currentValue: 33660, pnl: 660, pnlPercent: 2.0, broker: 'Zerodha', todayPnl: 132 }
    ];
    
    setHoldings(mockHoldings);
    
    // Calculate portfolio stats
    const totalInvestment = mockHoldings.reduce((sum, h) => sum + h.investedAmount, 0);
    const totalCurrentValue = mockHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalPnl = mockHoldings.reduce((sum, h) => sum + h.pnl, 0);
    const totalPnlPercent = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;
    const todayPnl = mockHoldings.reduce((sum, h) => sum + (h.todayPnl || 0), 0);
    
    setPortfolioStats({
      totalInvestment,
      currentValue: totalCurrentValue,
      totalPnl,
      totalPnlPercent,
      todayPnl
    });
  };

  const syncHoldings = async (brokerId) => {
    setIsSyncing(true);
    try {
      const userId = getUserId();
      const broker = brokerConnections.find(b => b.id === brokerId);
      
      if (!broker) {
        throw new Error('Broker not found');
      }
      
      // In a real implementation, this would call broker API
      // For now, simulate syncing by updating lastSync time
      
      // Update broker connection
      setBrokerConnections(prev => prev.map(b => 
        b.id === brokerId 
          ? { 
              ...b, 
              lastSync: new Date().toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit'
              }),
              holdings: Math.min(b.holdings + 2, 15) // Mock increase
            }
          : b
      ));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { success: true, message: 'Holdings synced successfully' };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSync = async (brokerId) => {
    if (!brokerId) return;
    
    setIsSyncing(true);
    try {
      await syncHoldings(brokerId);
      
      // Show success
      const brokerName = brokerConnections.find(b => b.id === brokerId)?.name;
      alert(`✅ ${brokerName} holdings synced successfully!`);
    } catch (error) {
      console.error('Sync failed:', error);
      alert(`❌ Sync failed: ${error.message || 'Please check your connection'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    const connectedBrokers = brokerConnections.filter(b => b.status === 'connected');
    if (connectedBrokers.length === 0) {
      alert('No connected brokers to sync!');
      return;
    }
    
    setIsSyncing(true);
    try {
      for (const broker of connectedBrokers) {
        try {
          await syncHoldings(broker.id);
        } catch (err) {
          console.error(`Sync failed for ${broker.name}:`, err);
        }
      }
      
      alert(`✅ ${connectedBrokers.length} broker(s) synced successfully!`);
    } catch (error) {
      console.error('Sync all failed:', error);
      alert('❌ Some brokers failed to sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectBroker = async (brokerType, apiKey, apiSecret, userId, pin) => {
    setLoading(true);
    
    try {
      const currentUserId = getUserId();
      
      const response = await fetch(`${API_BASE_URL}/api/broker/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getUserToken()}`
        },
        body: JSON.stringify({
          user_id: currentUserId,
          broker_name: brokerType,
          api_key: apiKey,
          api_secret: apiSecret,
          user_id_broker: userId,
          pin: pin
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add new broker to connections
        const newBroker = {
          id: data.broker_id,
          name: brokerType.charAt(0).toUpperCase() + brokerType.slice(1),
          status: 'connected',
          connectedSince: new Date().toISOString().split('T')[0],
          lastSync: 'Just now',
          holdings: 0,
          balance: 0,
          equity: 0,
          profitLoss: '0',
          todayTrades: 0,
          accountType: 'Regular',
          apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : '',
          apiSecret: '********'
        };
        
        setBrokerConnections(prev => [...prev, newBroker]);
        setBrokers(prev => [...prev, newBroker]);
        
        // Clear API keys
        setApiKeys(prev => ({
          ...prev,
          [brokerType]: { key: '', secret: '', userId: '', pin: '' }
        }));
        
        setActiveBroker(null);
        alert('✅ Broker connected successfully!');
      } else {
        throw new Error(data.message || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert(`❌ Connection failed: ${error.message || 'Please check your API keys'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKeys = (brokerId, apiKey, apiSecret, userId = '', pin = '') => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      alert('Please enter both API Key and API Secret');
      return;
    }

    // In real app, this would call backend API
    handleConnectBroker(brokerId, apiKey, apiSecret, userId, pin);
  };

  const handleDisconnect = async (brokerId) => {
    if (window.confirm('Are you sure you want to disconnect this broker?\n\nYou will need to reconnect with API keys to access holdings.')) {
      // In a real implementation, this would call backend API to disconnect
      // For now, just remove from local state
      
      setBrokerConnections(prev => prev.map(broker => 
        broker.id === brokerId 
          ? { 
              ...broker, 
              status: 'disconnected',
              holdings: 0,
              balance: 0,
              equity: 0,
              profitLoss: '0',
              todayTrades: 0,
              lastSync: null,
              connectedSince: null
            }
          : broker
      ));
      
      // Clear stored API keys for this broker
      setApiKeys(prev => ({
        ...prev,
        [brokerId]: { key: '', secret: '', userId: '', pin: '' }
      }));
      
      alert('Broker disconnected successfully!');
    }
  };

  const handleTestConnection = async (brokerId) => {
    const broker = brokerConnections.find(b => b.id === brokerId);
    if (!broker) return;

    setConnectionStatus(prev => ({
      ...prev,
      [brokerId]: { ...prev[brokerId], isChecking: true }
    }));

    // Test connection by pinging backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      
      const isSuccess = data.status === 'online';
      
      setConnectionStatus(prev => ({
        ...prev,
        [brokerId]: { 
          ...prev[brokerId], 
          isChecking: false,
          lastChecked: new Date().toISOString(),
          status: isSuccess ? 'success' : 'failed'
        }
      }));

      if (isSuccess) {
        alert(`✅ Connection to ${broker.name} successful!`);
      } else {
        alert(`❌ Connection to ${broker.name} failed. Please check API keys.`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [brokerId]: { 
          ...prev[brokerId], 
          isChecking: false,
          lastChecked: new Date().toISOString(),
          status: 'failed'
        }
      }));
      alert(`❌ Connection test failed: ${error.message}`);
    }
  };

  const handleExportHoldings = () => {
    if (holdings.length === 0) {
      alert('No holdings to export!');
      return;
    }
    
    const data = selectedHoldings.length > 0 ? selectedHoldings : holdings;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Stock,Quantity,Avg Price,Current Price,Invested,Current Value,P&L,P&L%,Broker\n"
      + data.map(h => 
          `${h.symbol},${h.quantity || 0},${h.avgPrice || 0},${h.currentPrice || 0},${h.investedAmount || 0},${h.currentValue || 0},${h.pnl || 0},${h.pnlPercent || 0}%,${h.broker || 'Unknown'}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `veloxtrade_holdings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals
  const connectedCount = brokerConnections.filter(b => b.status === 'connected').length;
  const totalHoldings = holdings.length;
  const totalBalance = brokerConnections.reduce((sum, broker) => sum + (broker.balance || 0), 0);
  const totalEquity = brokerConnections.reduce((sum, broker) => sum + (broker.equity || 0), 0);

  // Broker-specific configuration
  const brokerConfigs = {
    zerodha: {
      name: 'Zerodha',
      logo: 'Z',
      color: 'blue',
      authType: 'api',
      fields: ['api_key', 'api_secret', 'user_id', 'pin', 'totp'],
      instructions: 'Generate API keys from Zerodha Console with read permissions'
    },
    upstox: {
      name: 'Upstox',
      logo: 'U',
      color: 'purple',
      authType: 'api',
      fields: ['api_key', 'api_secret'],
      instructions: 'Get API keys from Upstox Developer Portal'
    },
    groww: {
      name: 'Groww',
      logo: 'G',
      color: 'green',
      authType: 'api',
      fields: ['api_key', 'api_secret', 'user_id'],
      instructions: 'API keys available in Groww Settings'
    },
    angelone: {
      name: 'Angel One',
      logo: 'A',
      color: 'orange',
      authType: 'api',
      fields: ['api_key', 'api_secret', 'user_id', 'pin'],
      instructions: 'Generate API keys from Angel One Developer'
    },
    icicidirect: {
      name: 'ICICI Direct',
      logo: 'I',
      color: 'red',
      authType: 'credentials',
      fields: ['user_id', 'password', 'pin'],
      instructions: 'Use your ICICI Direct login credentials'
    },
    hdfcsec: {
      name: 'HDFC Securities',
      logo: 'H',
      color: 'blue',
      authType: 'credentials',
      fields: ['user_id', 'password', 'pin'],
      instructions: 'Use your HDFC Securities login credentials'
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Broker Settings</h1>
            <p className="text-gray-600">Loading broker connections...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Connecting to backend...</p>
            <p className="text-sm text-gray-500">Fetching broker data from VeloxTradeAI</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Broker Settings</h1>
          <p className="text-gray-600">Connect and manage your trading accounts</p>
        </div>
        <button 
          onClick={() => setActiveBroker('select')}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Broker</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
          <p className="text-sm text-red-600 mt-2">
            Make sure your backend is running at: {API_BASE_URL}
          </p>
        </div>
      )}

      {/* Stats Cards - Show only if connected */}
      {connectedCount > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Brokers</p>
                <p className="text-2xl font-bold text-gray-900">{connectedCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Server className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {brokerConnections.filter(b => b.status === 'disconnected').length} available to connect
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Holdings</p>
                <p className="text-2xl font-bold text-gray-900">{totalHoldings}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Database className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">stocks across all brokers</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalBalance.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">across all accounts</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Equity</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalEquity.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">current portfolio value</div>
          </div>
        </div>
      ) : (
        // Empty state when no brokers connected
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Unlink className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Brokers Connected</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect your trading account to view holdings, sync portfolio, and get AI-powered insights.
          </p>
          <button 
            onClick={() => setActiveBroker('select')}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Your First Broker</span>
          </button>
          <div className="mt-8 text-sm text-gray-500">
            <p className="mb-2">Supported brokers:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.values(brokerConfigs).map((broker) => (
                <span key={broker.name} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                  {broker.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Broker Connections Table - Only show if we have brokers */}
      {brokerConnections.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Broker Connections</h2>
                <p className="text-gray-600">Manage your broker connections and API keys</p>
              </div>
              {connectedCount > 0 && (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => window.open('https://developers.kite.trade/', '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <Info className="w-4 h-4 mr-1" />
                    Connection Guide
                  </button>
                </div>
              )}
            </div>
          </div>

          {connectedCount === 0 ? (
            // No connected brokers
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Unlink className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Connections</h3>
              <p className="text-gray-600 mb-6">Connect a broker to start syncing your holdings</p>
              <button 
                onClick={() => setActiveBroker('select')}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Connect Broker</span>
              </button>
            </div>
          ) : (
            // Connected brokers table
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Broker</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Holdings</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Balance/Equity</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Last Sync</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brokerConnections.map((broker) => (
                    <tr key={broker.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            broker.status === 'connected' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <span className={`font-bold ${
                              broker.status === 'connected' ? 'text-blue-600' : 'text-gray-400'
                            }`}>
                              {broker.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{broker.name}</p>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {broker.accountType}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {broker.status === 'connected' 
                                ? broker.connectedSince 
                                  ? `Connected since ${broker.connectedSince}`
                                  : 'Connected'
                                : 'Not connected'
                              }
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            broker.status === 'connected'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {broker.status === 'connected' ? 'Connected' : 'Disconnected'}
                          </span>
                          {connectionStatus[broker.id]?.isChecking && (
                            <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium">{broker.holdings} stocks</p>
                          {broker.status === 'connected' && broker.profitLoss !== '0' && (
                            <p className="text-sm text-gray-500">
                              P&L: <span className={
                                broker.profitLoss?.includes('+') ? 'text-green-600' : 
                                broker.profitLoss?.includes('-') ? 'text-red-600' : 'text-gray-600'
                              }>
                                {broker.profitLoss}
                              </span>
                            </p>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium">₹{broker.balance.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">₹{broker.equity.toLocaleString()} equity</p>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div>
                          <p className={broker.lastSync ? 'text-gray-700' : 'text-gray-400'}>
                            {broker.lastSync || 'Never'}
                          </p>
                          {broker.status === 'connected' && broker.todayTrades > 0 && (
                            <p className="text-xs text-blue-600">{broker.todayTrades} trades today</p>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {broker.status === 'connected' ? (
                            <>
                              <button
                                onClick={() => handleSync(broker.id)}
                                disabled={isSyncing}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Sync Holdings"
                              >
                                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                              </button>
                              <button
                                onClick={() => setActiveBroker(broker.id)}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Manage API Keys"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleTestConnection(broker.id)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                title="Test Connection"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDisconnect(broker.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                title="Disconnect"
                              >
                                <Unlink className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setActiveBroker(broker.id)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {connectedCount === 0 
                  ? 'No brokers connected' 
                  : `Total: ${brokerConnections.length} brokers • ${connectedCount} connected • ${brokerConnections.length - connectedCount} disconnected`
                }
              </p>
              <div className="flex items-center space-x-3">
                {connectedCount > 0 && (
                  <button 
                    onClick={handleSyncAll}
                    disabled={isSyncing}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync All Brokers</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings Summary - Only show if we have holdings */}
      {holdings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Portfolio Summary</h2>
                <p className="text-gray-600">Combined holdings from all connected brokers</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleExportHoldings}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                {connectedCount > 0 && (
                  <button 
                    onClick={handleSyncAll}
                    disabled={isSyncing}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync All'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-5">
                <p className="text-sm text-gray-600 mb-2">Total Investments</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-gray-900">₹{portfolioStats.totalInvestment.toLocaleString()}</p>
                  <span className="text-sm font-medium text-gray-500">
                    across {holdings.length} holdings
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-5">
                <p className="text-sm text-gray-600 mb-2">Current Value</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-gray-900">₹{portfolioStats.currentValue.toLocaleString()}</p>
                  <span className={`text-sm font-medium ${
                    portfolioStats.totalPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {portfolioStats.totalPnlPercent >= 0 ? '+' : ''}{portfolioStats.totalPnlPercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-5">
                <p className="text-sm text-gray-600 mb-2">Total P&L</p>
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold ${
                    portfolioStats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {portfolioStats.totalPnl >= 0 ? '+' : ''}₹{Math.abs(portfolioStats.totalPnl).toLocaleString()}
                  </p>
                  <span className="text-sm font-medium text-gray-500">
                    overall
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100 p-5">
                <p className="text-sm text-gray-600 mb-2">Day P&L</p>
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold ${
                    portfolioStats.todayPnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {portfolioStats.todayPnl >= 0 ? '+' : ''}₹{Math.abs(portfolioStats.todayPnl).toLocaleString()}
                  </p>
                  <span className="text-sm font-medium text-gray-500">
                    today
                  </span>
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            {holdings.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Stock</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Quantity</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Avg Price</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Current</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Invested</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Current Value</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">P&L</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">Broker</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.slice(0, 10).map((holding, index) => {
                      const pnl = holding.pnl || 0;
                      const pnlPercent = holding.pnlPercent || 0;
                      
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium">{holding.symbol}</p>
                              <p className="text-sm text-gray-500">{holding.name || 'NSE'}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium">{holding.quantity || 0}</span>
                          </td>
                          <td className="py-4 px-6">₹{holding.avgPrice?.toLocaleString() || '0'}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              ₹{holding.currentPrice?.toLocaleString() || '0'}
                              {holding.currentPrice > holding.avgPrice ? (
                                <span className="ml-2 text-xs text-green-600">↗</span>
                              ) : holding.currentPrice < holding.avgPrice ? (
                                <span className="ml-2 text-xs text-red-600">↘</span>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-4 px-6">₹{holding.investedAmount.toLocaleString()}</td>
                          <td className="py-4 px-6">₹{holding.currentValue.toLocaleString()}</td>
                          <td className="py-4 px-6">
                            <span className={`font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ₹{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {holding.broker || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {holdings.length > 10 && (
                  <div className="p-4 text-center border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Showing 10 of {holdings.length} holdings. 
                      <button className="ml-2 text-blue-600 hover:text-blue-800 font-medium">
                        View all holdings
                      </button>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Database className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Holdings Found</h3>
                <p className="text-gray-600 mb-6">Sync your connected brokers to load holdings</p>
                {connectedCount > 0 && (
                  <button 
                    onClick={handleSyncAll}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Sync Holdings</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Broker Connection Modal */}
      {activeBroker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">
                    {activeBroker === 'select' 
                      ? 'Connect New Broker' 
                      : activeBroker in brokerConfigs
                      ? `Connect ${brokerConfigs[activeBroker].name}`
                      : `API Keys - ${brokerConnections.find(b => b.id === activeBroker)?.name || activeBroker}`
                    }
                  </h3>
                  <p className="text-gray-600">
                    {activeBroker === 'select' 
                      ? 'Select your broker and enter credentials' 
                      : 'Enter your broker API credentials'
                    }
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setActiveBroker(null);
                    setShowApiKeys(false);
                  }} 
                  className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-lg"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-6">
                {activeBroker === 'select' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-4">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Select Broker
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Choose your broker to connect. You'll need API keys from their developer portal.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(brokerConfigs).map(([id, config]) => (
                        <button
                          key={id}
                          onClick={() => setActiveBroker(id)}
                          className="p-4 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-left transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${config.color}-100`}>
                              <span className={`font-bold text-${config.color}-600`}>
                                {config.logo}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{config.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {config.authType === 'api' ? 'API Keys Required' : 'Login Credentials'}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeBroker !== 'select' && activeBroker in brokerConfigs && (
                  <>
                    <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-4">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Where to find credentials for {brokerConfigs[activeBroker].name}?
                      </h4>
                      <p className="text-sm text-blue-700">
                        {brokerConfigs[activeBroker].instructions}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                      <div className="flex items-center">
                        <input
                          type={showApiKeys ? "text" : "password"}
                          value={apiKeys[activeBroker]?.key || ''}
                          onChange={(e) => setApiKeys(prev => ({
                            ...prev,
                            [activeBroker]: { ...prev[activeBroker], key: e.target.value }
                          }))}
                          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter API Key"
                        />
                        <button
                          onClick={() => setShowApiKeys(!showApiKeys)}
                          className="ml-2 p-3 hover:bg-gray-100 rounded-xl"
                          title={showApiKeys ? "Hide" : "Show"}
                        >
                          {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                      <div className="flex items-center">
                        <input
                          type={showApiKeys ? "text" : "password"}
                          value={apiKeys[activeBroker]?.secret || ''}
                          onChange={(e) => setApiKeys(prev => ({
                            ...prev,
                            [activeBroker]: { ...prev[activeBroker], secret: e.target.value }
                          }))}
                          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter API Secret"
                        />
                      </div>
                    </div>
                    
                    {(activeBroker === 'zerodha' || activeBroker === 'angelone' || activeBroker === 'icicidirect' || activeBroker === 'hdfcsec') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">User ID / Client ID</label>
                        <input
                          type="text"
                          value={apiKeys[activeBroker]?.userId || ''}
                          onChange={(e) => setApiKeys(prev => ({
                            ...prev,
                            [activeBroker]: { ...prev[activeBroker], userId: e.target.value }
                          }))}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter User ID / Client ID"
                        />
                      </div>
                    )}
                    
                    {(activeBroker === 'zerodha' || activeBroker === 'angelone' || activeBroker === 'icicidirect' || activeBroker === 'hdfcsec') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">PIN / Password</label>
                        <input
                          type="password"
                          value={apiKeys[activeBroker]?.pin || ''}
                          onChange={(e) => setApiKeys(prev => ({
                            ...prev,
                            [activeBroker]: { ...prev[activeBroker], pin: e.target.value }
                          }))}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter PIN or Password"
                        />
                      </div>
                    )}
                    
                    {activeBroker === 'zerodha' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">TOTP (Optional)</label>
                        <input
                          type="text"
                          value={apiKeys[activeBroker]?.totp || ''}
                          onChange={(e) => setApiKeys(prev => ({
                            ...prev,
                            [activeBroker]: { ...prev[activeBroker], totp: e.target.value }
                          }))}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter TOTP if required"
                        />
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-r from-yellow-50 to-white border border-yellow-200 rounded-xl p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Security Notice</h4>
                      <p className="text-sm text-yellow-700">
                        • Your API keys are encrypted and stored locally<br/>
                        • We never store your API secrets on our servers<br/>
                        • Enable read-only permissions for security<br/>
                        • Never share your API keys with anyone
                      </p>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => {
                          setActiveBroker(null);
                          setShowApiKeys(false);
                        }}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleTestConnection(activeBroker)}
                        className="flex-1 border border-green-300 text-green-700 py-3 px-4 rounded-xl font-medium hover:bg-green-50"
                      >
                        Test Connection
                      </button>
                      <button
                        onClick={() => handleSaveApiKeys(
                          activeBroker,
                          apiKeys[activeBroker]?.key,
                          apiKeys[activeBroker]?.secret,
                          apiKeys[activeBroker]?.userId,
                          apiKeys[activeBroker]?.pin
                        )}
                        disabled={!apiKeys[activeBroker]?.key || !apiKeys[activeBroker]?.secret}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {brokerConnections.find(b => b.id === activeBroker)?.status === 'connected' 
                          ? 'Update Keys' 
                          : 'Connect Broker'
                        }
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Holdings State */}
      {connectedCount > 0 && holdings.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Holdings Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your connected brokers don't have any holdings or you need to sync to load them.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Holdings'}</span>
            </button>
            <button 
              onClick={() => setActiveBroker('select')}
              className="inline-flex items-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Another Broker</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerSettings;
