import React, { useState, useEffect } from 'react';
import { 
  Link, 
  Unlink, 
  RefreshCw, 
  Download, 
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Plus,
  Info,
  Database,
  Server,
  Settings,
  Wallet,
  TrendingUp,
  Wifi,
  WifiOff,
  Shield,
  Key,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://veloxtradeai-api.velox-trade-ai.workers.dev';

const BrokerSettings = () => {
  const [brokers, setBrokers] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBroker, setActiveBroker] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  
  // API keys state
  const [apiKeys, setApiKeys] = useState({
    zerodha: { api_key: '', api_secret: '', user_id: '', pin: '' },
    upstox: { api_key: '', api_secret: '' },
    groww: { api_key: '', api_secret: '' },
    angelone: { api_key: '', api_secret: '', user_id: '', pin: '' },
    icicidirect: { user_id: '', password: '', pin: '' },
    hdfcsec: { user_id: '', password: '', pin: '' }
  });

  const [brokerConnections, setBrokerConnections] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvestment: 0,
    currentValue: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
    todayPnl: 0
  });

  // Get user data
  const getUserId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      return userData.user_id || null;
    } catch {
      return null;
    }
  };

  const getUserToken = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      return userData.token || '';
    } catch {
      return '';
    }
  };

  // Load brokers from backend - REAL DATA ONLY
  useEffect(() => {
    loadBrokersAndHoldings();
  }, []);

  const loadBrokersAndHoldings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const userId = getUserId();
      const token = getUserToken();
      
      if (!userId || !token) {
        throw new Error('User not authenticated. Please login again.');
      }

      // 1. Fetch broker connections from backend
      const brokersRes = await fetch(`${API_BASE_URL}/api/brokers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!brokersRes.ok) {
        if (brokersRes.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Backend error: ${brokersRes.status}`);
      }

      const brokersData = await brokersRes.json();
      
      if (brokersData.success) {
        const brokerList = brokersData.data || brokersData.brokers || [];
        setBrokers(brokerList);
        
        // Transform to UI format
        const connections = brokerList.map(broker => ({
          id: broker.id || broker.broker_id,
          name: broker.broker_name || broker.name,
          status: broker.is_active ? 'connected' : 'disconnected',
          connectedSince: broker.created_at ? 
            new Date(broker.created_at).toLocaleDateString('en-IN') : 'N/A',
          lastSync: broker.last_sync ? 
            new Date(broker.last_sync).toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'Never',
          holdings: broker.holdings_count || 0,
          balance: broker.available_balance || 0,
          equity: broker.equity_value || 0,
          profitLoss: broker.total_pnl || 0,
          accountType: broker.account_type || 'Regular',
          isActive: broker.is_active || false,
          connectionHealth: broker.connection_status || 'unknown'
        }));
        
        setBrokerConnections(connections);

        // 2. Try to fetch holdings if any broker is connected
        const connectedBrokers = connections.filter(b => b.status === 'connected');
        if (connectedBrokers.length > 0) {
          try {
            const holdingsRes = await fetch(`${API_BASE_URL}/api/holdings`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (holdingsRes.ok) {
              const holdingsData = await holdingsRes.json();
              
              if (holdingsData.success) {
                const holdingsList = holdingsData.data || holdingsData.holdings || [];
                setHoldings(holdingsList);
                
                // Calculate portfolio stats from REAL data
                const stats = calculatePortfolioStats(holdingsList);
                setPortfolioStats(stats);
              }
            }
          } catch (holdingsError) {
            console.warn('Could not fetch holdings:', holdingsError);
            // Continue without holdings - this is optional
          }
        }
      } else {
        throw new Error(brokersData.message || 'Failed to load broker data');
      }
      
    } catch (error) {
      console.error('Failed to load broker data:', error);
      setError(error.message || 'Failed to connect to backend. Please check your connection.');
      
      // NO MOCK DATA - Set empty arrays
      setBrokers([]);
      setHoldings([]);
      setBrokerConnections([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const calculatePortfolioStats = (holdingsList) => {
    if (!holdingsList || holdingsList.length === 0) {
      return {
        totalInvestment: 0,
        currentValue: 0,
        totalPnl: 0,
        totalPnlPercent: 0,
        todayPnl: 0
      };
    }

    const totalInvestment = holdingsList.reduce((sum, h) => 
      sum + (h.invested_amount || h.average_price * h.quantity || 0), 0);
    
    const totalCurrentValue = holdingsList.reduce((sum, h) => 
      sum + (h.current_value || h.last_price * h.quantity || 0), 0);
    
    const totalPnl = holdingsList.reduce((sum, h) => sum + (h.pnl || 0), 0);
    const totalPnlPercent = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;
    
    return {
      totalInvestment,
      currentValue: totalCurrentValue,
      totalPnl,
      totalPnlPercent,
      todayPnl: holdingsList.reduce((sum, h) => sum + (h.today_pnl || 0), 0)
    };
  };

  const syncHoldings = async (brokerId) => {
    setIsSyncing(true);
    try {
      const token = getUserToken();
      
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Sync failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update last sync time
        setBrokerConnections(prev => prev.map(broker => 
          broker.id === brokerId 
            ? { 
                ...broker, 
                lastSync: new Date().toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })
              }
            : broker
        ));
        
        // Refresh data
        await loadBrokersAndHoldings(false);
        
        return { success: true, message: 'Holdings synced successfully' };
      } else {
        throw new Error(data.message || 'Sync failed');
      }
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
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectBroker = async (brokerType, credentials) => {
    setLoading(true);
    
    try {
      const token = getUserToken();
      
      const response = await fetch(`${API_BASE_URL}/api/brokers/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          broker_name: brokerType,
          ...credentials
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear API keys
        setApiKeys(prev => ({
          ...prev,
          [brokerType]: brokerType.includes('direct') || brokerType.includes('hdfc') 
            ? { user_id: '', password: '', pin: '' }
            : { api_key: '', api_secret: '', user_id: '', pin: '' }
        }));
        
        setActiveBroker(null);
        await loadBrokersAndHoldings(false);
      } else {
        throw new Error(data.message || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (brokerId) => {
    if (window.confirm('Are you sure you want to disconnect this broker?')) {
      try {
        const token = getUserToken();
        
        const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/disconnect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          await loadBrokersAndHoldings(false);
        }
      } catch (error) {
        console.error('Disconnect failed:', error);
      }
    }
  };

  const handleTestConnection = async (brokerId) => {
    const broker = brokerConnections.find(b => b.id === brokerId);
    if (!broker) return;

    setConnectionStatus(prev => ({
      ...prev,
      [brokerId]: { ...prev[brokerId], isChecking: true }
    }));

    try {
      const token = getUserToken();
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/test`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        setConnectionStatus(prev => ({
          ...prev,
          [brokerId]: { 
            ...prev[brokerId], 
            isChecking: false,
            status: data.connected ? 'success' : 'failed',
            message: data.message
          }
        }));
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [brokerId]: { 
          ...prev[brokerId], 
          isChecking: false,
          status: 'failed',
          message: error.message
        }
      }));
    }
  };

  // Broker configuration
  const brokerConfigs = {
    zerodha: {
      name: 'Zerodha',
      logo: 'Z',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      fields: ['api_key', 'api_secret', 'user_id', 'pin'],
      instructions: 'Get API keys from Zerodha Console'
    },
    upstox: {
      name: 'Upstox',
      logo: 'U',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      fields: ['api_key', 'api_secret'],
      instructions: 'Get API keys from Upstox Developer Portal'
    },
    groww: {
      name: 'Groww',
      logo: 'G',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      fields: ['api_key', 'api_secret'],
      instructions: 'API keys available in Groww Settings'
    },
    angelone: {
      name: 'Angel One',
      logo: 'A',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400',
      fields: ['api_key', 'api_secret', 'user_id', 'pin'],
      instructions: 'Generate API keys from Angel One Developer'
    },
    icicidirect: {
      name: 'ICICI Direct',
      logo: 'I',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      fields: ['user_id', 'password', 'pin'],
      instructions: 'Use your ICICI Direct login credentials'
    },
    hdfcsec: {
      name: 'HDFC Securities',
      logo: 'H',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-500/10',
      textColor: 'text-indigo-400',
      fields: ['user_id', 'password', 'pin'],
      instructions: 'Use your HDFC Securities login credentials'
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Broker Settings</h1>
              <p className="text-gray-400">Loading broker connections...</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Connecting to backend...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const connectedCount = brokerConnections.filter(b => b.status === 'connected').length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Broker Settings
            </h1>
            <p className="text-gray-400">Connect and manage your trading accounts</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => loadBrokersAndHoldings()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <button 
              onClick={() => setActiveBroker('select')}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Connect New Broker
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Backend URL: {API_BASE_URL}
                </p>
              </div>
              <button 
                onClick={() => loadBrokersAndHoldings()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {connectedCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Connected Brokers</p>
                  <p className="text-2xl font-bold mt-1">{connectedCount}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Server className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {brokerConnections.length - connectedCount} available to connect
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Holdings</p>
                  <p className="text-2xl font-bold mt-1">{holdings.length}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Database className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">stocks across all brokers</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{brokerConnections.reduce((sum, b) => sum + b.balance, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Wallet className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">across all accounts</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Equity</p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{brokerConnections.reduce((sum, b) => sum + b.equity, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">current portfolio value</div>
            </div>
          </div>
        ) : (
          // Empty state
          <div className="mb-8 bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Unlink className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Brokers Connected</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Connect your trading account to view holdings, sync portfolio, and get AI-powered insights.
            </p>
            <button 
              onClick={() => setActiveBroker('select')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              Connect Your First Broker
            </button>
            
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-3">Supported brokers:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.values(brokerConfigs).map((broker) => (
                  <span key={broker.name} className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs">
                    {broker.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Broker Connections Table */}
        {brokerConnections.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Broker Connections</h2>
                  <p className="text-gray-400">Manage your broker connections and API keys</p>
                </div>
                
                <button 
                  onClick={() => window.open('https://developers.kite.trade/', '_blank')}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  <Info className="w-4 h-4" />
                  Connection Guide
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Broker</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Holdings</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Balance/Equity</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Last Sync</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brokerConnections.map((broker) => {
                    const isConnected = broker.status === 'connected';
                    const isHealthy = broker.connectionHealth === 'healthy';
                    
                    return (
                      <tr key={broker.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isConnected ? 'bg-blue-500/10' : 'bg-gray-800'
                            }`}>
                              {isConnected ? (
                                isHealthy ? (
                                  <Wifi className="w-5 h-5 text-green-400" />
                                ) : (
                                  <WifiOff className="w-5 h-5 text-yellow-400" />
                                )
                              ) : (
                                <span className="font-bold text-gray-600">
                                  {broker.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{broker.name}</p>
                                <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                                  {broker.accountType}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {isConnected ? `Connected since ${broker.connectedSince}` : 'Not connected'}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isConnected
                              ? isHealthy 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {isConnected ? (isHealthy ? 'Connected ✓' : 'Issues') : 'Disconnected'}
                          </span>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium">{broker.holdings} stocks</p>
                            {broker.profitLoss !== 0 && (
                              <p className={`text-sm ${broker.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                P&L: {broker.profitLoss >= 0 ? '+' : ''}₹{Math.abs(broker.profitLoss).toLocaleString()}
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
                            <p className={broker.lastSync !== 'Never' ? 'text-gray-300' : 'text-gray-500'}>
                              {broker.lastSync}
                            </p>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {isConnected ? (
                              <>
                                <button
                                  onClick={() => handleTestConnection(broker.id)}
                                  disabled={connectionStatus[broker.id]?.isChecking}
                                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Test Connection"
                                >
                                  {connectionStatus[broker.id]?.isChecking ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                  ) : (
                                    <Wifi className="w-4 h-4 text-blue-400" />
                                  )}
                                </button>
                                
                                <button
                                  onClick={() => handleSync(broker.id)}
                                  disabled={isSyncing}
                                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Sync Holdings"
                                >
                                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''} text-green-400`} />
                                </button>
                                
                                <button
                                  onClick={() => setActiveBroker(broker.id)}
                                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Manage API Keys"
                                >
                                  <Settings className="w-4 h-4 text-gray-400" />
                                </button>
                                
                                <button
                                  onClick={() => handleDisconnect(broker.id)}
                                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Disconnect"
                                >
                                  <Unlink className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setActiveBroker(broker.id)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-medium"
                              >
                                Connect
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Holdings Summary */}
        {holdings.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Portfolio Summary</h2>
                  <p className="text-gray-400">Combined holdings from all connected brokers</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {/* Export logic */}}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  
                  {connectedCount > 0 && (
                    <button 
                      onClick={() => {/* Sync all logic */}}
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : 'Sync All'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Holdings will be shown here */}
              <div className="text-center py-8 text-gray-500">
                Portfolio holdings will appear here after syncing
              </div>
            </div>
          </div>
        )}

        {/* Broker Connection Modal */}
        {activeBroker && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">
                      {activeBroker === 'select' 
                        ? 'Connect New Broker' 
                        : activeBroker in brokerConfigs
                        ? `Connect ${brokerConfigs[activeBroker].name}`
                        : 'Manage Broker'
                      }
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {activeBroker === 'select' 
                        ? 'Select your broker to connect' 
                        : 'Enter your broker credentials'
                      }
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveBroker(null);
                      setShowApiKeys(false);
                    }} 
                    className="text-gray-400 hover:text-white text-2xl p-2 hover:bg-gray-700 rounded-lg"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-6">
                  {activeBroker === 'select' ? (
                    <div className="space-y-3">
                      {Object.entries(brokerConfigs).map(([id, config]) => (
                        <button
                          key={id}
                          onClick={() => setActiveBroker(id)}
                          className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-left transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                                <span className={`font-bold ${config.textColor}`}>
                                  {config.logo}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{config.name}</div>
                                <div className="text-sm text-gray-500">
                                  {config.fields.includes('api_key') ? 'API Keys' : 'Credentials'}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : activeBroker in brokerConfigs && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-sm text-blue-400">
                          {brokerConfigs[activeBroker].instructions}
                        </p>
                      </div>
                      
                      {brokerConfigs[activeBroker].fields.includes('api_key') && (
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">API Key</label>
                          <div className="flex items-center">
                            <input
                              type={showApiKeys ? "text" : "password"}
                              value={apiKeys[activeBroker]?.api_key || ''}
                              onChange={(e) => setApiKeys(prev => ({
                                ...prev,
                                [activeBroker]: { ...prev[activeBroker], api_key: e.target.value }
                              }))}
                              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter API Key"
                            />
                            <button
                              onClick={() => setShowApiKeys(!showApiKeys)}
                              className="ml-2 p-3 hover:bg-gray-700 rounded-lg"
                            >
                              {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Other fields based on broker type */}
                      
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setActiveBroker(null)}
                          className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await handleConnectBroker(activeBroker, apiKeys[activeBroker]);
                              setActiveBroker(null);
                            } catch (error) {
                              console.error(error);
                            }
                          }}
                          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-medium"
                        >
                          Connect Broker
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerSettings;
