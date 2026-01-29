import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Server,
  Database,
  Wallet,
  TrendingUp,
  Unlink,
  Plus,
  AlertCircle,
  CheckCircle,
  Settings,
  X,
  Eye,
  EyeOff,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.veloxtradeai.com';

const BrokerSettings = () => {
  const { t, isHindi } = useLanguage();
  const { user, token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeBroker, setActiveBroker] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  
  const [brokerConnections, setBrokerConnections] = useState([]);
  const [apiKeys, setApiKeys] = useState({
    groww: { key: '', secret: '', userId: '' },
    zerodha: { key: '', secret: '', userId: '', pin: '' },
    upstox: { key: '', secret: '', userId: '' },
    angelone: { key: '', secret: '', userId: '', pin: '' }
  });

  // Broker configurations
  const brokerConfigs = {
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
  };

  // Check backend health
  const checkBackendHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setIsBackendConnected(true);
        return true;
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
    }
    setIsBackendConnected(false);
    return false;
  }, []);

  // Load brokers from backend
  const loadBrokers = useCallback(async () => {
    if (!user || !token) return;
    
    setLoading(true);
    try {
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        setError(isHindi ? 
          'बैकेंड सर्वर उपलब्ध नहीं है। कृपया बाद में प्रयास करें।' : 
          'Backend server not available. Please try again later.'
        );
        return;
      }

      // Fetch broker connections
      const response = await fetch(`${API_BASE_URL}/api/v1/brokers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBrokerConnections(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading brokers:', error);
      setError(isHindi ? 
        'डेटा लोड करने में त्रुटि। कृपया कनेक्शन चेक करें।' : 
        'Error loading data. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  }, [user, token, checkBackendHealth, isHindi]);

  // Connect broker
  const handleConnectBroker = async (brokerType, credentials) => {
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
        loadBrokers();
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
  };

  // Disconnect broker
  const handleDisconnectBroker = async (brokerId) => {
    if (!user || !token) return;
    
    if (!window.confirm(isHindi ? 
      'क्या आप वाकई इस ब्रोकर को डिस्कनेक्ट करना चाहते हैं?' : 
      'Are you sure you want to disconnect this broker?'
    )) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/brokers/${brokerId}/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove from connections
        setBrokerConnections(prev => prev.filter(broker => broker.id !== brokerId));
        alert(isHindi ? '✅ ब्रोकर डिस्कनेक्ट हो गया!' : '✅ Broker disconnected successfully!');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      alert(isHindi ? '❌ डिस्कनेक्ट करने में त्रुटि' : '❌ Error disconnecting broker');
    }
  };

  // Test connection
  const handleTestConnection = async (brokerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/brokers/${brokerId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        alert(isHindi ? '✅ कनेक्शन सफल!' : '✅ Connection successful!');
      } else {
        alert(isHindi ? '❌ कनेक्शन फेल' : '❌ Connection failed');
      }
    } catch (error) {
      alert(isHindi ? '❌ कनेक्शन टेस्ट फेल' : '❌ Connection test failed');
    }
  };

  // Initial load
  useEffect(() => {
    loadBrokers();
  }, [loadBrokers]);

  // If backend is not connected, show error
  if (!isBackendConnected && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center h-96">
          <WifiOff className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            {isHindi ? 'बैकेंड कनेक्शन नहीं' : 'Backend Not Connected'}
          </h2>
          <p className="text-gray-400 text-center mb-6">
            {isHindi ? 
              'हमारे सर्वर से कनेक्शन नहीं हो पा रहा है। कृपया बाद में प्रयास करें।' : 
              'Unable to connect to our servers. Please try again later.'
            }
          </p>
          <button
            onClick={checkBackendHealth}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
          >
            {isHindi ? 'फिर से कोशिश करें' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {isHindi ? 'ब्रोकर सेटिंग्स' : 'Broker Settings'}
            </h1>
            <p className="text-gray-400">
              {isHindi ? 'अपने ट्रेडिंग अकाउंट्स को कनेक्ट और मैनेज करें' : 'Connect and manage your trading accounts'}
            </p>
          </div>
          
          <button
            onClick={() => setActiveBroker('select')}
            className="flex items-center space-x-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isHindi ? 'नया ब्रोकर कनेक्ट करें' : 'Connect New Broker'}</span>
          </button>
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
            <div className="text-sm text-gray-400">
              {brokerConnections.length} {isHindi ? 'ब्रोकर कनेक्टेड' : 'brokers connected'}
            </div>
          </div>
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

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">
              {isHindi ? 'लोड हो रहा है...' : 'Loading...'}
            </p>
          </div>
        </div>
      ) : (
        /* Broker Connections */
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">
              {isHindi ? 'ब्रोकर कनेक्शन्स' : 'Broker Connections'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isHindi ? 
                'आपके सभी कनेक्टेड ट्रेडिंग अकाउंट्स' : 
                'All your connected trading accounts'
              }
            </p>
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
                {isHindi ? 'पहला ब्रोकर कनेक्ट करें' : 'Connect First Broker'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Broker</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Last Sync</th>
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
                              {broker.broker_name?.charAt(0) || 'B'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{broker.broker_name}</p>
                            <p className="text-sm text-gray-400">{broker.account_type || 'Regular'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          broker.is_active 
                            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700' 
                            : 'bg-gray-700 text-gray-400 border border-gray-600'
                        }`}>
                          {broker.is_active ? 'Connected' : 'Disconnected'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-400">
                          {broker.last_sync ? 
                            new Date(broker.last_sync).toLocaleString() : 
                            (isHindi ? 'कभी नहीं' : 'Never')
                          }
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleTestConnection(broker.id)}
                            className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg"
                            title={isHindi ? 'टेस्ट कनेक्शन' : 'Test Connection'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveBroker(broker.id)}
                            className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg"
                            title={isHindi ? 'सेटिंग्स' : 'Settings'}
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDisconnectBroker(broker.id)}
                            className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg"
                            title={isHindi ? 'डिस्कनेक्ट' : 'Disconnect'}
                          >
                            <Unlink className="w-4 h-4" />
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
      )}

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
                      className="p-4 border border-gray-700 rounded-lg hover:border-emerald-500 hover:bg-gray-800 text-left transition-all"
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
                          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-l-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                          placeholder="Enter API Key"
                        />
                        <button
                          onClick={() => setShowApiKeys(!showApiKeys)}
                          className="bg-gray-800 border border-gray-700 border-l-0 rounded-r-lg px-4 hover:bg-gray-700"
                        >
                          {showApiKeys ? 
                            <EyeOff className="w-4 h-4 text-gray-400" /> : 
                            <Eye className="w-4 h-4 text-gray-400" />
                          }
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
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                        placeholder="Enter API Secret"
                      />
                    </div>

                    {(activeBroker === 'zerodha' || activeBroker === 'angelone') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          User ID
                        </label>
                        <input
                          type="text"
                          value={apiKeys[activeBroker]?.userId || ''}
                          onChange={(e) => setApiKeys(prev => ({
                            ...prev,
                            [activeBroker]: { ...prev[activeBroker], userId: e.target.value }
                          }))}
                          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                          placeholder="Enter User ID"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setActiveBroker(null)}
                      className="flex-1 border border-gray-700 text-gray-300 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConnectBroker(activeBroker, apiKeys[activeBroker])}
                      disabled={!apiKeys[activeBroker]?.key || !apiKeys[activeBroker]?.secret}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isHindi ? 'कनेक्ट करें' : 'Connect'}
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
