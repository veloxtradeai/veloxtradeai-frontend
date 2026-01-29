import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  RefreshCw, 
  Download, 
  Server,
  Database,
  Wallet,
  TrendingUp,
  Unlink,
  Plus,
  Info,
  AlertCircle,
  CheckCircle,
  Settings,
  X,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

// API Configuration - Use environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.veloxtradeai.com';

const BrokerSettings = () => {
  const { t, isHindi, language } = useLanguage();
  const { user, token } = useAuth();
  
  const [brokers, setBrokers] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBroker, setActiveBroker] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState(null);
  
  const [apiKeys, setApiKeys] = useState({
    groww: { key: '', secret: '', userId: '' },
    zerodha: { key: '', secret: '', userId: '', pin: '' },
    upstox: { key: '', secret: '', userId: '' },
    angelone: { key: '', secret: '', userId: '', pin: '' },
    icicidirect: { key: '', secret: '', userId: '', pin: '' }
  });

  const [brokerConnections, setBrokerConnections] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvestment: 0,
    currentValue: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
    todayPnl: 0
  });

  // Safe currency formatter
  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, []);

  // Safe number formatter
  const safeToFixed = useCallback((value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(value)) return '0.00';
    return Number(value).toFixed(decimals);
  }, []);

  // Load real data from backend
  const loadBrokersAndHoldings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔗 Loading broker connections from:', API_BASE_URL);
      
      // Check if user is authenticated
      if (!user || !token) {
        throw new Error('User not authenticated');
      }

      // Check backend health
      try {
        const healthRes = await fetch(`${API_BASE_URL}/api/v1/health`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!healthRes.ok) {
          throw new Error('Backend not responding');
        }
        setIsBackendConnected(true);
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        setIsBackendConnected(false);
        throw new Error(isHindi ? 'बैकेंड सर्वर उपलब्ध नहीं है' : 'Backend server not available');
      }

      // Fetch broker connections
      const brokersRes = await fetch(`${API_BASE_URL}/api/v1/brokers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (brokersRes.ok) {
        const brokersData = await brokersRes.json();
        if (brokersData.success) {
          const connections = brokersData.data.map(broker => ({
            id: broker.id || broker.broker_name?.toLowerCase(),
            name: broker.broker_name || 'Unknown',
            status: broker.is_active ? 'connected' : 'disconnected',
            connectedSince: broker.connected_at || null,
            lastSync: broker.last_sync || null,
            holdings: broker.holdings_count || 0,
            balance: broker.available_cash || 0,
            equity: broker.equity_value || 0,
            profitLoss: broker.total_pnl || '0',
            accountType: broker.account_type || 'Regular'
          }));
          
          setBrokerConnections(connections);
          setBrokers(brokersData.data);
        }
      }

      // Fetch holdings
      const holdingsRes = await fetch(`${API_BASE_URL}/api/v1/holdings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (holdingsRes.ok) {
        const holdingsData = await holdingsRes.json();
        if (holdingsData.success) {
          setHoldings(holdingsData.data || holdingsData.holdings || []);
          
          // Calculate portfolio stats
          const holdingsList = holdingsData.data || holdingsData.holdings || [];
          const totalInvestment = holdingsList.reduce((sum, h) => sum + (h.average_price * h.quantity), 0);
          const currentValue = holdingsList.reduce((sum, h) => sum + (h.last_price * h.quantity), 0);
          const totalPnl = currentValue - totalInvestment;
          const totalPnlPercent = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;
          
          setPortfolioStats({
            totalInvestment,
            currentValue,
            totalPnl,
            totalPnlPercent,
            todayPnl: holdingsList.reduce((sum, h) => sum + (h.day_pnl || 0), 0)
          });
        }
      }

    } catch (error) {
      console.error('❌ Failed to load data:', error);
      setError(isHindi ? 
        'डेटा लोड करने में त्रुटि। कृपया कनेक्शन चेक करें।' : 
        'Error loading data. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  }, [user, token, isHindi]);

  // Load data on component mount
  useEffect(() => {
    if (user && token) {
      loadBrokersAndHoldings();
    }
  }, [user, token, loadBrokersAndHoldings]);

  // Sync holdings function
  const syncHoldings = useCallback(async (brokerId) => {
    if (!user || !token) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/brokers/${brokerId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Refresh data
          loadBrokersAndHoldings();
          return { success: true, message: 'Sync successful' };
        }
      }
      throw new Error('Sync failed');
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [user, token, loadBrokersAndHoldings]);

  // Connect broker function
  const handleConnectBroker = useCallback(async (brokerType, credentials) => {
    if (!user || !token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/brokers/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          broker_name: brokerType,
          credentials: credentials
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh connections
        loadBrokersAndHoldings();
        setActiveBroker(null);
        setApiKeys(prev => ({
          ...prev,
          [brokerType]: { key: '', secret: '', userId: '', pin: '' }
        }));
        
        alert(isHindi ? '✅ ब्रोकर कनेक्ट हो गया!' : '✅ Broker connected successfully!');
      } else {
        throw new Error(data.message || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(isHindi ? 
        `❌ कनेक्शन फेल: ${error.message}` : 
        `❌ Connection failed: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  }, [user, token, loadBrokersAndHoldings, isHindi]);

  // Test connection function
  const handleTestConnection = useCallback(async (brokerId) => {
    if (!user || !token) return;
    
    const broker = brokerConnections.find(b => b.id === brokerId);
    if (!broker) return;

    setConnectionStatus(prev => ({
      ...prev,
      [brokerId]: { ...prev[brokerId], isChecking: true }
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/brokers/${brokerId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      const isSuccess = data?.success || false;
      const result = {
        broker: broker.name,
        success: isSuccess,
        message: data?.message || (isSuccess ? 'Connection successful' : 'Connection failed'),
        timestamp: new Date().toLocaleTimeString('en-IN')
      };

      setConnectionTestResult(result);
      setConnectionStatus(prev => ({
        ...prev,
        [brokerId]: {
          ...prev[brokerId],
          isChecking: false,
          status: isSuccess ? 'success' : 'failed'
        }
      }));

      alert(isSuccess ? 
        `✅ ${broker.name} connection successful!` : 
        `❌ ${broker.name} connection failed`
      );
    } catch (error) {
      console.error('Test connection error:', error);
      setConnectionTestResult({
        broker: broker.name,
        success: false,
        message: 'Network error',
        timestamp: new Date().toLocaleTimeString('en-IN')
      });
    }
  }, [brokerConnections, user, token]);

  // Broker configurations
  const brokerConfigs = useMemo(() => ({
    groww: {
      name: 'Groww',
      instructions: isHindi ? 
        'Groww Settings में API keys उपलब्ध हैं' : 
        'API keys available in Groww Settings'
    },
    zerodha: {
      name: 'Zerodha',
      instructions: isHindi ? 
        'Zerodha Console से API keys generate करें' : 
        'Generate API keys from Zerodha Console'
    },
    upstox: {
      name: 'Upstox',
      instructions: isHindi ? 
        'Upstox Developer Portal से API keys लें' : 
        'Get API keys from Upstox Developer Portal'
    },
    angelone: {
      name: 'Angel One',
      instructions: isHindi ? 
        'Angel One Developer से API keys generate करें' : 
        'Generate API keys from Angel One Developer'
    }
  }), [isHindi]);

  // If loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-4 md:p-6">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
            <p className="text-emerald-300">
              {isHindi ? 'ब्रोकर डेटा लोड हो रहा है...' : 'Loading broker data...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {isHindi ? 'ब्रोकर सेटिंग्स' : 'Broker Settings'}
        </h1>
        <p className="text-gray-400">
          {isHindi ? 'अपने ट्रेडिंग अकाउंट्स को कनेक्ट और मैनेज करें' : 'Connect and manage your trading accounts'}
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isBackendConnected ? (
              <>
                <Wifi className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400">Backend Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-400" />
                <span className="text-red-400">Backend Disconnected</span>
              </>
            )}
          </div>
          <button
            onClick={() => setActiveBroker('select')}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isHindi ? 'नया ब्रोकर' : 'New Broker'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-700 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Broker Connections */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">
            {isHindi ? 'ब्रोकर कनेक्शन्स' : 'Broker Connections'}
          </h2>
        </div>

        {brokerConnections.length === 0 ? (
          <div className="p-8 text-center">
            <Unlink className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {isHindi ? 'कोई ब्रोकर कनेक्ट नहीं' : 'No Brokers Connected'}
            </h3>
            <p className="text-gray-400 mb-6">
              {isHindi ? 
                'अपना पहला ट्रेडिंग अकाउंट कनेक्ट करें' : 
                'Connect your first trading account'
              }
            </p>
            <button
              onClick={() => setActiveBroker('select')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            >
              {isHindi ? 'ब्रोकर कनेक्ट करें' : 'Connect Broker'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Broker</th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Holdings</th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Balance</th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brokerConnections.map((broker) => (
                  <tr key={broker.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-900/30 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-emerald-400">
                            {broker.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{broker.name}</p>
                          <p className="text-sm text-gray-400">{broker.accountType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        broker.status === 'connected' 
                          ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700' 
                          : 'bg-gray-700 text-gray-400 border border-gray-600'
                      }`}>
                        {broker.status === 'connected' ? 'Connected' : 'Disconnected'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-white">{broker.holdings} holdings</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-white">{formatCurrency(broker.balance)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => syncHoldings(broker.id)}
                          disabled={isSyncing}
                          className="p-2 text-emerald-400 hover:bg-emerald-900/30 rounded-lg"
                          title="Sync"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveBroker(broker.id)}
                          className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg"
                          title="Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTestConnection(broker.id)}
                          className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg"
                          title="Test Connection"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broker Connection Modal */}
      {activeBroker && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {activeBroker === 'select' 
                    ? (isHindi ? 'नया ब्रोकर कनेक्ट करें' : 'Connect New Broker') 
                    : `Connect ${brokerConfigs[activeBroker]?.name || activeBroker}`
                  }
                </h3>
                <button
                  onClick={() => {
                    setActiveBroker(null);
                    setShowApiKeys(false);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {activeBroker === 'select' ? (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(brokerConfigs).map(([id, config]) => (
                    <button
                      key={id}
                      onClick={() => setActiveBroker(id)}
                      className="p-4 border border-gray-700 rounded-lg hover:border-emerald-500 hover:bg-gray-800 text-left"
                    >
                      <div className="font-medium text-white">{config.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{config.instructions}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key
                      </label>
                      <div className="flex">
                        <input
                          type={showApiKeys ? "text" : "password"}
                          value={apiKeys[activeBroker]?.key || ''}
                          onChange={(e) => setApiKeys(prev => ({
                            ...prev,
                            [activeBroker]: { ...prev[activeBroker], key: e.target.value }
                          }))}
                          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-l-lg px-4 py-3"
                          placeholder="Enter API Key"
                        />
                        <button
                          onClick={() => setShowApiKeys(!showApiKeys)}
                          className="bg-gray-800 border border-gray-700 border-l-0 rounded-r-lg px-4 hover:bg-gray-700"
                        >
                          {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Secret
                      </label>
                      <input
                        type="password"
                        value={apiKeys[activeBroker]?.secret || ''}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          [activeBroker]: { ...prev[activeBroker], secret: e.target.value }
                        }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3"
                        placeholder="Enter API Secret"
                      />
                    </div>

                    {(activeBroker === 'zerodha' || activeBroker === 'angelone') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          User ID / PIN
                        </label>
                        <input
                          type="text"
                          value={apiKeys[activeBroker]?.userId || ''}
                          onChange={(e) => setApiKeys(prev => ({
                            ...prev,
                            [activeBroker]: { ...prev[activeBroker], userId: e.target.value }
                          }))}
                          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3"
                          placeholder="Enter User ID"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setActiveBroker(null)}
                      className="flex-1 border border-gray-700 text-gray-300 py-3 rounded-lg hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConnectBroker(activeBroker, apiKeys[activeBroker])}
                      disabled={!apiKeys[activeBroker]?.key || !apiKeys[activeBroker]?.secret}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg disabled:opacity-50"
                    >
                      Connect
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerSettings;
