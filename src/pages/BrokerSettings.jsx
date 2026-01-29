import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  TrendingDown,
  X,
  ChevronDown,
  ChevronUp,
  BarChart3,
  DollarSign,
  Target,
  Clock,
  Wifi,
  WifiOff,
  Lock,
  Globe,
  ShieldCheck,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

// API Configuration - REAL URL चाहिए
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://your-backend-api.com';

const BrokerSettings = () => {
  const { t, isHindi, language } = useLanguage();
  const { user, token } = useAuth();
  
  const [brokers, setBrokers] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBroker, setActiveBroker] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [selectedHoldings, setSelectedHoldings] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState(null);
  
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

  // FIXED: Safer formatCurrency
  const formatCurrency = useCallback((amount) => {
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
  }, []);

  // FIXED: Safer safeToFixed
  const safeToFixed = useCallback((value, decimals = 2) => {
    if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
      return '0.00';
    }
    return Number(value).toFixed(decimals);
  }, []);

  // Check backend health FIRST
  const checkBackendHealth = useCallback(async () => {
    try {
      console.log('🔄 Checking backend health...');
      const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Backend health check passed:', healthData);
        setIsBackendConnected(true);
        return true;
      } else {
        console.error('❌ Backend health check failed');
        setIsBackendConnected(false);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend health check error:', error);
      setIsBackendConnected(false);
      return false;
    }
  }, []);

  // REAL DATA FETCH - NO DUMMY
  const loadBrokersAndHoldings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔗 Loading broker connections...');
      
      // Check backend connection first
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        throw new Error('Backend connection failed');
      }
      
      const userId = user?.id || 'default-user';
      
      // 1. Fetch broker connections from API
      const brokersRes = await fetch(`${API_BASE_URL}/api/brokers?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (brokersRes.ok) {
        const brokersData = await brokersRes.json();
        
        if (brokersData?.success) {
          setBrokers(brokersData.brokers || []);
          
          const connections = (brokersData.brokers || []).map(broker => ({
            id: broker.id || broker.broker_name?.toLowerCase() || 'unknown',
            name: broker.broker_name || 'Unknown',
            status: broker.is_active ? 'connected' : 'disconnected',
            connectedSince: broker.connected_at ? new Date(broker.connected_at).toLocaleDateString('en-IN') : null,
            lastSync: broker.last_sync || null,
            holdings: broker.holdings_count || 0,
            balance: broker.balance || 0,
            equity: broker.equity || 0,
            profitLoss: broker.profit_loss || '0',
            todayTrades: broker.today_trades || 0,
            accountType: broker.account_type || 'Regular',
            apiKey: broker.api_key ? `${broker.api_key.substring(0, 8)}...` : '',
            apiSecret: broker.api_secret ? '********' : ''
          }));
          
          setBrokerConnections(connections);
          console.log('✅ Broker connections loaded:', connections.length);
        }
      } else {
        console.log('⚠️ No broker connections found');
      }

      // 2. Fetch holdings from API (if we have brokers)
      if (brokerConnections.length > 0) {
        try {
          const holdingsRes = await fetch(`${API_BASE_URL}/api/holdings?user_id=${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (holdingsRes.ok) {
            const holdingsData = await holdingsRes.json();
            
            if (holdingsData?.success) {
              const holdingsList = holdingsData.holdings || holdingsData.data || [];
              setHoldings(holdingsList);
              
              // Calculate portfolio stats
              const totalInvestment = holdingsList.reduce((sum, h) => sum + (h.invested_amount || 0), 0);
              const totalCurrentValue = holdingsList.reduce((sum, h) => sum + (h.current_value || 0), 0);
              const totalPnl = holdingsList.reduce((sum, h) => sum + (h.pnl || 0), 0);
              const totalPnlPercent = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;
              
              setPortfolioStats({
                totalInvestment,
                currentValue: totalCurrentValue,
                totalPnl,
                totalPnlPercent,
                todayPnl: holdingsList.reduce((sum, h) => sum + (h.today_pnl || 0), 0)
              });
              
              console.log('✅ Holdings data loaded:', holdingsList.length);
            }
          }
        } catch (holdingsError) {
          console.log('⚠️ Holdings endpoint not available');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to load broker data:', error);
      setError(isHindi ? 'बैकेंड कनेक्शन में समस्या। कृपया कनेक्शन चेक करें।' : 'Failed to connect to backend. Please check your connection.');
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [user, token, checkBackendHealth, isHindi]);

  // Load brokers on component mount
  useEffect(() => {
    loadBrokersAndHoldings();
    
    // Auto-refresh every 2 minutes ONLY if backend is connected
    let interval;
    if (isBackendConnected) {
      interval = setInterval(() => {
        loadBrokersAndHoldings();
      }, 120000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadBrokersAndHoldings, isBackendConnected]);

  // Sync holdings function
  const syncHoldings = useCallback(async (brokerId) => {
    setIsSyncing(true);
    try {
      const userId = user?.id;
      const broker = brokerConnections.find(b => b.id === brokerId);
      
      if (!broker) {
        throw new Error('Broker not found');
      }
      
      // Call sync API
      const syncRes = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (syncRes.ok) {
        const result = await syncRes.json();
        
        // Update broker connection with new data
        setBrokerConnections(prev => prev.map(b => 
          b.id === brokerId 
            ? { 
                ...b, 
                lastSync: new Date().toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                }),
                holdings: result.holdings_count || b.holdings,
                balance: result.balance || b.balance,
                equity: result.equity || b.equity
              }
            : b
        ));
        
        return { success: true, message: 'Holdings synced successfully' };
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [brokerConnections, user, token]);

  // Handle sync button click
  const handleSync = useCallback(async (brokerId) => {
    if (!brokerId) return;
    
    setIsSyncing(true);
    try {
      await syncHoldings(brokerId);
      
      const brokerName = brokerConnections.find(b => b.id === brokerId)?.name;
      alert(isHindi ? `✅ ${brokerName} होल्डिंग्स सिंक हुईं!` : `✅ ${brokerName} holdings synced successfully!`);
      
      // Refresh data
      loadBrokersAndHoldings();
    } catch (error) {
      console.error('Sync failed:', error);
      alert(isHindi ? `❌ सिंक फेल: ${error.message || 'कृपया कनेक्शन चेक करें'}` : `❌ Sync failed: ${error.message || 'Please check your connection'}`);
    } finally {
      setIsSyncing(false);
    }
  }, [syncHoldings, brokerConnections, loadBrokersAndHoldings, isHindi]);

  const handleSyncAll = useCallback(async () => {
    const connectedBrokers = brokerConnections.filter(b => b.status === 'connected');
    if (connectedBrokers.length === 0) {
      alert(isHindi ? 'कोई कनेक्टेड ब्रोकर नहीं है!' : 'No connected brokers to sync!');
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
      
      alert(isHindi ? `✅ ${connectedBrokers.length} ब्रोकर सिंक हुए!` : `✅ ${connectedBrokers.length} broker(s) synced successfully!`);
      loadBrokersAndHoldings();
    } catch (error) {
      console.error('Sync all failed:', error);
      alert(isHindi ? '❌ कुछ ब्रोकर सिंक नहीं हुए' : '❌ Some brokers failed to sync');
    } finally {
      setIsSyncing(false);
    }
  }, [brokerConnections, syncHoldings, loadBrokersAndHoldings, isHindi]);

  // Handle broker connection
  const handleConnectBroker = useCallback(async (brokerType, apiKey, apiSecret, userId, pin) => {
    setLoading(true);
    
    try {
      const currentUserId = user?.id;
      
      const response = await fetch(`${API_BASE_URL}/api/brokers/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      
      if (data?.success) {
        const newBroker = {
          id: data.broker_id || brokerType,
          name: brokerType.charAt(0).toUpperCase() + brokerType.slice(1),
          status: 'connected',
          connectedSince: new Date().toISOString().split('T')[0],
          lastSync: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
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
        alert(isHindi ? '✅ ब्रोकर कनेक्ट हो गया!' : '✅ Broker connected successfully!');
      } else {
        throw new Error(data?.message || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert(isHindi ? `❌ कनेक्शन फेल: ${error.message || 'कृपया API keys चेक करें'}` : `❌ Connection failed: ${error.message || 'Please check your API keys'}`);
    } finally {
      setLoading(false);
    }
  }, [user, token, isHindi]);

  const handleSaveApiKeys = (brokerId, apiKey, apiSecret, userId = '', pin = '') => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      alert(isHindi ? 'कृपया API Key और API Secret दोनों डालें' : 'Please enter both API Key and API Secret');
      return;
    }

    handleConnectBroker(brokerId, apiKey, apiSecret, userId, pin);
  };

  const handleDisconnect = useCallback(async (brokerId) => {
    if (window.confirm(isHindi ? 'क्या आप वाकई इस ब्रोकर को डिस्कनेक्ट करना चाहते हैं?\n\nहोल्डिंग्स एक्सेस के लिए आपको API keys से फिर से कनेक्ट करना होगा।' : 'Are you sure you want to disconnect this broker?\n\nYou will need to reconnect with API keys to access holdings.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/disconnect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: user?.id })
        });
        
        if (response.ok) {
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
          
          alert(isHindi ? 'ब्रोकर डिस्कनेक्ट हो गया!' : 'Broker disconnected successfully!');
        } else {
          throw new Error('Disconnect failed');
        }
      } catch (error) {
        console.error('Disconnect failed:', error);
        alert(isHindi ? '❌ डिस्कनेक्ट फेल' : '❌ Disconnect failed');
      }
    }
  }, [user, token, isHindi]);

  const handleTestConnection = useCallback(async (brokerId) => {
    const broker = brokerConnections.find(b => b.id === brokerId);
    if (!broker) return;

    setConnectionStatus(prev => ({
      ...prev,
      [brokerId]: { ...prev[brokerId], isChecking: true }
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/brokers/${brokerId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          user_id: user?.id,
          broker_name: broker.name 
        })
      });
      
      const data = await response.json();
      
      const isSuccess = data?.success || false;
      
      setConnectionStatus(prev => ({
        ...prev,
        [brokerId]: { 
          ...prev[brokerId], 
          isChecking: false,
          lastChecked: new Date().toISOString(),
          status: isSuccess ? 'success' : 'failed',
          message: data?.message || ''
        }
      }));

      setConnectionTestResult({
        broker: broker.name,
        success: isSuccess,
        message: data?.message || (isSuccess ? 'Connection successful' : 'Connection failed'),
        timestamp: new Date().toLocaleTimeString('en-IN')
      });

      if (isSuccess) {
        alert(isHindi ? `✅ ${broker.name} कनेक्शन सफल!` : `✅ Connection to ${broker.name} successful!`);
      } else {
        alert(isHindi ? `❌ ${broker.name} कनेक्शन फेल। कृपया API keys चेक करें।` : `❌ Connection to ${broker.name} failed. Please check API keys.`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [brokerId]: { 
          ...prev[brokerId], 
          isChecking: false,
          lastChecked: new Date().toISOString(),
          status: 'failed',
          message: error.message
        }
      }));
      
      setConnectionTestResult({
        broker: broker.name,
        success: false,
        message: error.message || 'Network error',
        timestamp: new Date().toLocaleTimeString('en-IN')
      });
      
      alert(isHindi ? `❌ कनेक्शन टेस्ट फेल: ${error.message}` : `❌ Connection test failed: ${error.message}`);
    }
  }, [brokerConnections, user, token, isHindi]);

  const handleExportHoldings = () => {
    if (holdings.length === 0) {
      alert(isHindi ? 'एक्सपोर्ट करने के लिए कोई होल्डिंग्स नहीं!' : 'No holdings to export!');
      return;
    }
    
    const data = selectedHoldings.length > 0 ? selectedHoldings : holdings;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Stock,Quantity,Avg Price,Current Price,Invested,Current Value,P&L,P&L%,Broker\n"
      + data.map(h => 
          `${h.symbol || ''},${h.quantity || 0},${h.avgPrice || h.entry_price || 0},${h.currentPrice || h.current_price || 0},${h.investedAmount || h.invested_amount || 0},${h.currentValue || h.current_value || 0},${h.pnl || 0},${h.pnlPercent || h.pnl_percent || 0}%,${h.broker || 'Unknown'}`
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
  const brokerConfigs = useMemo(() => ({
    zerodha: {
      name: 'Zerodha',
      logo: 'Z',
      color: 'blue',
      authType: 'api',
      fields: ['api_key', 'api_secret', 'user_id', 'pin', 'totp'],
      instructions: isHindi ? 'Zerodha Console से read permissions के साथ API keys generate करें' : 'Generate API keys from Zerodha Console with read permissions'
    },
    upstox: {
      name: 'Upstox',
      logo: 'U',
      color: 'purple',
      authType: 'api',
      fields: ['api_key', 'api_secret'],
      instructions: isHindi ? 'Upstox Developer Portal से API keys लें' : 'Get API keys from Upstox Developer Portal'
    },
    groww: {
      name: 'Groww',
      logo: 'G',
      color: 'green',
      authType: 'api',
      fields: ['api_key', 'api_secret', 'user_id'],
      instructions: isHindi ? 'Groww Settings में API keys उपलब्ध हैं' : 'API keys available in Groww Settings'
    },
    angelone: {
      name: 'Angel One',
      logo: 'A',
      color: 'orange',
      authType: 'api',
      fields: ['api_key', 'api_secret', 'user_id', 'pin'],
      instructions: isHindi ? 'Angel One Developer से API keys generate करें' : 'Generate API keys from Angel One Developer'
    },
    icicidirect: {
      name: 'ICICI Direct',
      logo: 'I',
      color: 'red',
      authType: 'credentials',
      fields: ['user_id', 'password', 'pin'],
      instructions: isHindi ? 'अपने ICICI Direct login credentials का use करें' : 'Use your ICICI Direct login credentials'
    },
    hdfcsec: {
      name: 'HDFC Securities',
      logo: 'H',
      color: 'blue',
      authType: 'credentials',
      fields: ['user_id', 'password', 'pin'],
      instructions: isHindi ? 'अपने HDFC Securities login credentials का use करें' : 'Use your HDFC Securities login credentials'
    }
  }), [isHindi]);

  // Connection status display
  const connectionStatusDisplay = useMemo(() => {
    if (isBackendConnected) {
      return {
        text: isHindi ? 'बैकेंड कनेक्टेड' : 'Backend Connected',
        icon: <Wifi className="w-5 h-5 text-emerald-400" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/30',
        dotColor: 'bg-emerald-400'
      };
    }
    return {
      text: isHindi ? 'बैकेंड डिस्कनेक्टेड' : 'Backend Disconnected',
      icon: <WifiOff className="w-5 h-5 text-red-400" />,
      color: 'text-red-400',
      bg: 'bg-red-500/30',
      dotColor: 'bg-red-400'
    };
  }, [isBackendConnected, isHindi]);

  // FIXED: Show loading ONLY on initial load, not on refresh
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {isHindi ? 'ब्रोकर सेटिंग्स' : 'Broker Settings'}
            </h1>
            <p className="text-sm text-emerald-300/80 mt-1">
              {isHindi ? 'ब्रोकर कनेक्शन लोड हो रहे हैं...' : 'Loading broker connections...'}
            </p>
          </div>
        </div>
        
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="relative mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-xl opacity-20"></div>
              <div className="relative">
                <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
              </div>
            </div>
            <p className="text-emerald-300">
              {isHindi ? 'ब्रोकर डेटा लोड हो रहा है...' : 'Loading broker data...'}
            </p>
            <p className="text-sm text-emerald-300/60 mt-1">
              {isHindi ? 'बैकेंड से कनेक्ट हो रहा है' : 'Connecting to backend...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {isHindi ? 'ब्रोकर सेटिंग्स' : 'Broker Settings'}
            </h1>
            <p className="text-sm text-emerald-300/80 mt-1">
              {isHindi ? 'अपने ट्रेडिंग अकाउंट्स को कनेक्ट और मैनेज करें' : 'Connect and manage your trading accounts'}
            </p>
          </div>
          
          <button 
            onClick={() => setActiveBroker('select')}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 hover:border-emerald-400/50 text-emerald-300 font-medium transition-all mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isHindi ? 'नया ब्रोकर कनेक्ट करें' : 'Connect New Broker'}</span>
          </button>
        </div>

        {/* CONNECTION STATUS */}
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 border border-emerald-900/40 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full ${connectionStatusDisplay.bg} ${isBackendConnected ? 'animate-ping' : ''}`}></div>
                {connectionStatusDisplay.icon}
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {connectionStatusDisplay.text}
                </h3>
                <p className="text-xs text-emerald-300/70">
                  {isHindi ? 'API:' : 'API:'} {API_BASE_URL}
                </p>
              </div>
            </div>
            
            {connectionTestResult && (
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                connectionTestResult.success 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${connectionTestResult.success ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                  <span>{connectionTestResult.broker}: {connectionTestResult.success ? 'Connected' : 'Failed'}</span>
                </div>
              </div>
            )}
            
            <div className="text-xs text-emerald-300/50">
              v3.0 • {language === 'hi' ? 'हिंदी' : 'English'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-900/40 rounded-2xl p-4">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm text-red-300/70 mt-1">
                {isHindi ? 'बैकेंड चेक करें:' : 'Backend URL:'} {API_BASE_URL}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - Show only if connected */}
      {connectedCount > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300/70">{isHindi ? 'कनेक्टेड ब्रोकर' : 'Connected Brokers'}</p>
                <p className="text-2xl font-bold text-white">{connectedCount}</p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Server className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 text-xs text-emerald-300/60">
              {brokerConnections.filter(b => b.status === 'disconnected').length} {isHindi ? 'कनेक्ट किए जा सकते हैं' : 'available to connect'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-cyan-900/40 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-300/70">{isHindi ? 'कुल होल्डिंग्स' : 'Total Holdings'}</p>
                <p className="text-2xl font-bold text-white">{totalHoldings}</p>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Database className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="mt-3 text-xs text-cyan-300/60">
              {isHindi ? 'सभी ब्रोकरों में' : 'stocks across all brokers'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-purple-900/40 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300/70">{isHindi ? 'उपलब्ध बैलेंस' : 'Available Balance'}</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Wallet className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-3 text-xs text-purple-300/60">
              {isHindi ? 'सभी अकाउंट्स में' : 'across all accounts'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-amber-900/40 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-300/70">{isHindi ? 'कुल इक्विटी' : 'Total Equity'}</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalEquity)}</p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="mt-3 text-xs text-amber-300/60">
              {isHindi ? 'वर्तमान पोर्टफोलियो वैल्यू' : 'current portfolio value'}
            </div>
          </div>
        </div>
      ) : (
        // Empty state when no brokers connected
        <div className="mb-8 bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border-2 border-dashed border-emerald-900/40 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-900/20 to-cyan-900/10 rounded-full flex items-center justify-center mb-6 border border-emerald-900/40">
            <Unlink className="w-10 h-10 text-emerald-400/60" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{isHindi ? 'कोई ब्रोकर कनेक्ट नहीं है' : 'No Brokers Connected'}</h3>
          <p className="text-emerald-300/70 mb-6 max-w-md mx-auto">
            {isHindi ? 'अपना ट्रेडिंग अकाउंट कनेक्ट करें और होल्डिंग्स देखें, पोर्टफोलियो सिंक करें, और AI-powered इनसाइट्स पाएं।' : 'Connect your trading account to view holdings, sync portfolio, and get AI-powered insights.'}
          </p>
          <button 
            onClick={() => setActiveBroker('select')}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isHindi ? 'पहला ब्रोकर कनेक्ट करें' : 'Connect Your First Broker'}</span>
          </button>
          <div className="mt-8 text-sm text-emerald-300/50">
            <p className="mb-2">{isHindi ? 'सपोर्टेड ब्रोकर:' : 'Supported brokers:'}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.values(brokerConfigs).map((broker) => (
                <span key={broker.name} className="px-3 py-1 bg-emerald-900/30 text-emerald-300 rounded-lg text-xs border border-emerald-900/40">
                  {broker.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Broker Connections Table - Only show if we have brokers */}
      {brokerConnections.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 overflow-hidden mb-8">
          <div className="p-6 border-b border-emerald-900/40">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{isHindi ? 'ब्रोकर कनेक्शन्स' : 'Broker Connections'}</h2>
                <p className="text-sm text-emerald-300/70">{isHindi ? 'अपने ब्रोकर कनेक्शन्स और API keys मैनेज करें' : 'Manage your broker connections and API keys'}</p>
              </div>
              {connectedCount > 0 && (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => window.open('https://developers.kite.trade/', '_blank')}
                    className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center"
                  >
                    <Info className="w-4 h-4 mr-1" />
                    {isHindi ? 'कनेक्शन गाइड' : 'Connection Guide'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {connectedCount === 0 ? (
            // No connected brokers
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-emerald-900/20 rounded-full flex items-center justify-center mb-4 border border-emerald-900/40">
                <Unlink className="w-8 h-8 text-emerald-400/60" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{isHindi ? 'कोई एक्टिव कनेक्शन नहीं' : 'No Active Connections'}</h3>
              <p className="text-emerald-300/70 mb-6">{isHindi ? 'अपनी होल्डिंग्स सिंक करने के लिए ब्रोकर कनेक्ट करें' : 'Connect a broker to start syncing your holdings'}</p>
              <button 
                onClick={() => setActiveBroker('select')}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>{isHindi ? 'ब्रोकर कनेक्ट करें' : 'Connect Broker'}</span>
              </button>
            </div>
          ) : (
            // Connected brokers table
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10">
                    <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'ब्रोकर' : 'Broker'}</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'स्टेटस' : 'Status'}</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'होल्डिंग्स' : 'Holdings'}</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'बैलेंस/इक्विटी' : 'Balance/Equity'}</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'आखिरी सिंक' : 'Last Sync'}</th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'एक्शन' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {brokerConnections.map((broker) => (
                    <tr key={broker.id} className="border-b border-emerald-900/20 hover:bg-emerald-900/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            broker.status === 'connected' ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                          } border ${broker.status === 'connected' ? 'border-emerald-500/30' : 'border-slate-600/50'}`}>
                            <span className={`font-bold ${
                              broker.status === 'connected' ? 'text-emerald-400' : 'text-slate-400'
                            }`}>
                              {broker.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-white">{broker.name}</p>
                              <span className="text-xs px-2 py-1 bg-slate-700/50 text-emerald-300 rounded border border-emerald-900/40">
                                {broker.accountType}
                              </span>
                            </div>
                            <p className="text-sm text-emerald-300/60">
                              {broker.status === 'connected' 
                                ? broker.connectedSince 
                                  ? (isHindi ? `कनेक्ट: ${broker.connectedSince}` : `Connected: ${broker.connectedSince}`)
                                  : (isHindi ? 'कनेक्टेड' : 'Connected')
                                : (isHindi ? 'कनेक्ट नहीं' : 'Not connected')
                              }
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            broker.status === 'connected'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                          }`}>
                            {broker.status === 'connected' ? (isHindi ? 'कनेक्टेड' : 'Connected') : (isHindi ? 'डिस्कनेक्टेड' : 'Disconnected')}
                          </span>
                          {connectionStatus[broker.id]?.isChecking && (
                            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-white">{broker.holdings} {isHindi ? 'स्टॉक्स' : 'stocks'}</p>
                          {broker.status === 'connected' && broker.profitLoss !== '0' && (
                            <p className="text-sm text-emerald-300/60">
                              P&L: <span className={
                                broker.profitLoss?.includes('+') ? 'text-emerald-400' : 
                                broker.profitLoss?.includes('-') ? 'text-red-400' : 'text-slate-400'
                              }>
                                {broker.profitLoss}
                              </span>
                            </p>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-white">{formatCurrency(broker.balance)}</p>
                          <p className="text-sm text-emerald-300/60">{formatCurrency(broker.equity)} {isHindi ? 'इक्विटी' : 'equity'}</p>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div>
                          <p className={broker.lastSync ? 'text-white' : 'text-emerald-300/60'}>
                            {broker.lastSync || (isHindi ? 'कभी नहीं' : 'Never')}
                          </p>
                          {broker.status === 'connected' && broker.todayTrades > 0 && (
                            <p className="text-xs text-cyan-400">{broker.todayTrades} {isHindi ? 'ट्रेड्स आज' : 'trades today'}</p>
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
                                className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 rounded-lg transition-colors border border-emerald-900/40"
                                title={isHindi ? 'होल्डिंग्स सिंक करें' : 'Sync Holdings'}
                              >
                                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                              </button>
                              <button
                                onClick={() => setActiveBroker(broker.id)}
                                className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30 rounded-lg transition-colors border border-cyan-900/40"
                                title={isHindi ? 'API keys मैनेज करें' : 'Manage API Keys'}
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleTestConnection(broker.id)}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded-lg transition-colors border border-green-900/40"
                                title={isHindi ? 'कनेक्शन टेस्ट करें' : 'Test Connection'}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDisconnect(broker.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors border border-red-900/40"
                                title={isHindi ? 'डिस्कनेक्ट करें' : 'Disconnect'}
                              >
                                <Unlink className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setActiveBroker(broker.id)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:border-emerald-400/50 font-medium"
                            >
                              {isHindi ? 'कनेक्ट' : 'Connect'}
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

          <div className="p-6 border-t border-emerald-900/40">
            <div className="flex items-center justify-between">
              <p className="text-sm text-emerald-300/70">
                {connectedCount === 0 
                  ? (isHindi ? 'कोई ब्रोकर कनेक्ट नहीं' : 'No brokers connected') 
                  : (isHindi ? 
                    `कुल: ${brokerConnections.length} ब्रोकर • ${connectedCount} कनेक्टेड • ${brokerConnections.length - connectedCount} डिस्कनेक्टेड` :
                    `Total: ${brokerConnections.length} brokers • ${connectedCount} connected • ${brokerConnections.length - connectedCount} disconnected`
                    )
                }
              </p>
              <div className="flex items-center space-x-3">
                {connectedCount > 0 && (
                  <button 
                    onClick={handleSyncAll}
                    disabled={isSyncing}
                    className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isHindi ? 'सभी ब्रोकर सिंक करें' : 'Sync All Brokers'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings Summary - Only show if we have holdings */}
      {holdings.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 overflow-hidden mb-8">
          <div className="p-6 border-b border-emerald-900/40">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{isHindi ? 'पोर्टफोलियो सारांश' : 'Portfolio Summary'}</h2>
                <p className="text-sm text-emerald-300/70">{isHindi ? 'सभी कनेक्टेड ब्रोकरों से संयुक्त होल्डिंग्स' : 'Combined holdings from all connected brokers'}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleExportHoldings}
                  className="flex items-center space-x-2 px-4 py-2 border border-emerald-900/40 text-emerald-300 rounded-lg hover:border-emerald-500/60 hover:bg-emerald-900/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{isHindi ? 'CSV एक्सपोर्ट' : 'Export CSV'}</span>
                </button>
                {connectedCount > 0 && (
                  <button 
                    onClick={handleSyncAll}
                    disabled={isSyncing}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:border-emerald-400/50 disabled:opacity-50 transition-all"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? (isHindi ? 'सिंक हो रहा...' : 'Syncing...') : (isHindi ? 'सभी सिंक करें' : 'Sync All')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl border border-emerald-900/40 p-5">
                <p className="text-sm text-emerald-300/70 mb-2">{isHindi ? 'कुल निवेश' : 'Total Investments'}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-white">{formatCurrency(portfolioStats.totalInvestment)}</p>
                  <span className="text-sm font-medium text-emerald-300/60">
                    {isHindi ? `${holdings.length} होल्डिंग्स में` : `across ${holdings.length} holdings`}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl border border-cyan-900/40 p-5">
                <p className="text-sm text-cyan-300/70 mb-2">{isHindi ? 'वर्तमान वैल्यू' : 'Current Value'}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-white">{formatCurrency(portfolioStats.currentValue)}</p>
                  <span className={`text-sm font-medium ${
                    portfolioStats.totalPnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {portfolioStats.totalPnlPercent >= 0 ? '+' : ''}{safeToFixed(portfolioStats.totalPnlPercent)}%
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl border border-purple-900/40 p-5">
                <p className="text-sm text-purple-300/70 mb-2">{isHindi ? 'कुल P&L' : 'Total P&L'}</p>
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold ${
                    portfolioStats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {portfolioStats.totalPnl >= 0 ? '+' : ''}{formatCurrency(Math.abs(portfolioStats.totalPnl))}
                  </p>
                  <span className="text-sm font-medium text-purple-300/60">
                    {isHindi ? 'समग्र' : 'overall'}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl border border-amber-900/40 p-5">
                <p className="text-sm text-amber-300/70 mb-2">{isHindi ? 'दिन का P&L' : 'Day P&L'}</p>
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold ${
                    portfolioStats.todayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {portfolioStats.todayPnl >= 0 ? '+' : ''}{formatCurrency(Math.abs(portfolioStats.todayPnl))}
                  </p>
                  <span className="text-sm font-medium text-amber-300/60">
                    {isHindi ? 'आज' : 'today'}
                  </span>
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            {holdings.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-emerald-900/40">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10">
                      <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'स्टॉक' : 'Stock'}</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'क्वांटिटी' : 'Quantity'}</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'औसत प्राइस' : 'Avg Price'}</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'करंट' : 'Current'}</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'निवेश' : 'Invested'}</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'वर्तमान वैल्यू' : 'Current Value'}</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">P&L</th>
                      <th className="py-3 px-6 text-left text-sm font-medium text-emerald-400">{isHindi ? 'ब्रोकर' : 'Broker'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.slice(0, 10).map((holding, index) => {
                      const pnl = holding.pnl || 0;
                      const pnlPercent = holding.pnlPercent || holding.pnl_percent || 0;
                      
                      return (
                        <tr key={index} className="border-b border-emerald-900/20 hover:bg-emerald-900/10 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-white">{holding.symbol}</p>
                              <p className="text-sm text-emerald-300/60">{holding.name || 'NSE'}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-white">{holding.quantity || 0}</span>
                          </td>
                          <td className="py-4 px-6 text-white">₹{safeToFixed(holding.avgPrice || holding.entry_price || 0)}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <span className="text-white">₹{safeToFixed(holding.currentPrice || holding.current_price || 0)}</span>
                              {holding.currentPrice > holding.avgPrice ? (
                                <ChevronUp className="ml-2 w-4 h-4 text-emerald-400" />
                              ) : holding.currentPrice < holding.avgPrice ? (
                                <ChevronDown className="ml-2 w-4 h-4 text-red-400" />
                              ) : null}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-white">{formatCurrency(holding.investedAmount || holding.invested_amount)}</td>
                          <td className="py-4 px-6 text-white">{formatCurrency(holding.currentValue || holding.current_value)}</td>
                          <td className="py-4 px-6">
                            <span className={`font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              ₹{safeToFixed(pnl)} ({safeToFixed(pnlPercent)}%)
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 bg-emerald-900/30 text-emerald-300 rounded text-xs font-medium border border-emerald-900/40">
                              {holding.broker || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {holdings.length > 10 && (
                  <div className="p-4 text-center border-t border-emerald-900/40">
                    <p className="text-sm text-emerald-300/70">
                      {isHindi ? `${holdings.length} में से 10 होल्डिंग्स दिख रही हैं।` : `Showing 10 of ${holdings.length} holdings.`}
                      <button className="ml-2 text-emerald-400 hover:text-emerald-300 font-medium">
                        {isHindi ? 'सभी होल्डिंग्स देखें' : 'View all holdings'}
                      </button>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-emerald-900/20 rounded-full flex items-center justify-center mb-4 border border-emerald-900/40">
                  <Database className="w-8 h-8 text-emerald-400/60" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{isHindi ? 'कोई होल्डिंग्स नहीं मिली' : 'No Holdings Found'}</h3>
                <p className="text-emerald-300/70 mb-6">{isHindi ? 'होल्डिंग्स लोड करने के लिए अपने ब्रोकर्स को सिंक करें' : 'Sync your connected brokers to load holdings'}</p>
                {connectedCount > 0 && (
                  <button 
                    onClick={handleSyncAll}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400/50 font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{isHindi ? 'होल्डिंग्स सिंक करें' : 'Sync Holdings'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Broker Connection Modal */}
      {activeBroker && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-emerald-900/40 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="border-b border-emerald-900/40 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {activeBroker === 'select' 
                      ? (isHindi ? 'नया ब्रोकर कनेक्ट करें' : 'Connect New Broker') 
                      : activeBroker in brokerConfigs
                      ? (isHindi ? `${brokerConfigs[activeBroker].name} कनेक्ट करें` : `Connect ${brokerConfigs[activeBroker].name}`)
                      : (isHindi ? `API Keys - ${brokerConnections.find(b => b.id === activeBroker)?.name || activeBroker}` : `API Keys - ${brokerConnections.find(b => b.id === activeBroker)?.name || activeBroker}`)
                    }
                  </h3>
                  <p className="text-sm text-emerald-300/70">
                    {activeBroker === 'select' 
                      ? (isHindi ? 'अपना ब्रोकर चुनें और credentials डालें' : 'Select your broker and enter credentials') 
                      : (isHindi ? 'अपने ब्रोकर API credentials डालें' : 'Enter your broker API credentials')
                    }
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setActiveBroker(null);
                    setShowApiKeys(false);
                  }} 
                  className="text-emerald-400 hover:text-emerald-300 p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {activeBroker === 'select' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 border border-emerald-900/40 rounded-xl p-4">
                    <h4 className="font-medium text-emerald-400 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      {isHindi ? 'ब्रोकर चुनें' : 'Select Broker'}
                    </h4>
                    <p className="text-sm text-emerald-300/70">
                      {isHindi ? 'कनेक्ट करने के लिए अपना ब्रोकर चुनें। आपको उनके developer portal से API keys चाहिए होंगी।' : 'Choose your broker to connect. You\'ll need API keys from their developer portal.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(brokerConfigs).map(([id, config]) => (
                      <button
                        key={id}
                        onClick={() => setActiveBroker(id)}
                        className="p-4 border border-emerald-900/40 rounded-xl hover:border-emerald-500/60 hover:bg-emerald-900/10 text-left transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${config.color}-500/20 border border-${config.color}-500/30 group-hover:border-${config.color}-400/50`}>
                            <span className={`font-bold text-${config.color}-400`}>
                              {config.logo}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{config.name}</div>
                            <div className="text-xs text-emerald-300/70 mt-1">
                              {config.authType === 'api' ? (isHindi ? 'API Keys जरूरी' : 'API Keys Required') : (isHindi ? 'Login Credentials' : 'Login Credentials')}
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
                  <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 border border-emerald-900/40 rounded-xl p-4">
                    <h4 className="font-medium text-emerald-400 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {isHindi ? `${brokerConfigs[activeBroker].name} के लिए credentials कहां मिलेंगी?` : `Where to find credentials for ${brokerConfigs[activeBroker].name}?`}
                    </h4>
                    <p className="text-sm text-emerald-300/70">
                      {brokerConfigs[activeBroker].instructions}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-300/80 mb-2">{isHindi ? 'API Key' : 'API Key'}</label>
                    <div className="flex items-center">
                      <input
                        type={showApiKeys ? "text" : "password"}
                        value={apiKeys[activeBroker]?.key || ''}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          [activeBroker]: { ...prev[activeBroker], key: e.target.value }
                        }))}
                        className="flex-1 bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder={isHindi ? 'API Key डालें' : 'Enter API Key'}
                      />
                      <button
                        onClick={() => setShowApiKeys(!showApiKeys)}
                        className="ml-2 p-3 hover:bg-slate-800/50 rounded-xl transition-colors"
                        title={showApiKeys ? (isHindi ? 'छुपाएं' : 'Hide') : (isHindi ? 'दिखाएं' : 'Show')}
                      >
                        {showApiKeys ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-300/80 mb-2">{isHindi ? 'API Secret' : 'API Secret'}</label>
                    <div className="flex items-center">
                      <input
                        type={showApiKeys ? "text" : "password"}
                        value={apiKeys[activeBroker]?.secret || ''}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          [activeBroker]: { ...prev[activeBroker], secret: e.target.value }
                        }))}
                        className="flex-1 bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder={isHindi ? 'API Secret डालें' : 'Enter API Secret'}
                      />
                    </div>
                  </div>
                  
                  {(activeBroker === 'zerodha' || activeBroker === 'angelone' || activeBroker === 'icicidirect' || activeBroker === 'hdfcsec') && (
                    <div>
                      <label className="block text-sm font-medium text-emerald-300/80 mb-2">{isHindi ? 'User ID / Client ID' : 'User ID / Client ID'}</label>
                      <input
                        type="text"
                        value={apiKeys[activeBroker]?.userId || ''}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          [activeBroker]: { ...prev[activeBroker], userId: e.target.value }
                        }))}
                        className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder={isHindi ? 'User ID / Client ID डालें' : 'Enter User ID / Client ID'}
                      />
                    </div>
                  )}
                  
                  {(activeBroker === 'zerodha' || activeBroker === 'angelone' || activeBroker === 'icicidirect' || activeBroker === 'hdfcsec') && (
                    <div>
                      <label className="block text-sm font-medium text-emerald-300/80 mb-2">{isHindi ? 'PIN / Password' : 'PIN / Password'}</label>
                      <input
                        type="password"
                        value={apiKeys[activeBroker]?.pin || ''}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          [activeBroker]: { ...prev[activeBroker], pin: e.target.value }
                        }))}
                        className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder={isHindi ? 'PIN या Password डालें' : 'Enter PIN or Password'}
                      />
                    </div>
                  )}
                  
                  {activeBroker === 'zerodha' && (
                    <div>
                      <label className="block text-sm font-medium text-emerald-300/80 mb-2">TOTP ({isHindi ? 'ऑप्शनल' : 'Optional'})</label>
                      <input
                        type="text"
                        value={apiKeys[activeBroker]?.totp || ''}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          [activeBroker]: { ...prev[activeBroker], totp: e.target.value }
                        }))}
                        className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder={isHindi ? 'अगर जरूरी हो तो TOTP डालें' : 'Enter TOTP if required'}
                      />
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/10 border border-amber-900/40 rounded-xl p-4">
                    <h4 className="font-medium text-amber-400 mb-2">{isHindi ? 'सुरक्षा नोटिस' : 'Security Notice'}</h4>
                    <ul className="text-sm text-amber-300/70 space-y-1">
                      <li>• {isHindi ? 'आपकी API keys एन्क्रिप्टेड और स्थानीय रूप से स्टोर की जाती हैं' : 'Your API keys are encrypted and stored locally'}</li>
                      <li>• {isHindi ? 'हम आपके API secrets कभी भी अपने servers पर स्टोर नहीं करते' : 'We never store your API secrets on our servers'}</li>
                      <li>• {isHindi ? 'सुरक्षा के लिए read-only permissions enable करें' : 'Enable read-only permissions for security'}</li>
                      <li>• {isHindi ? 'अपनी API keys कभी किसी के साथ शेयर न करें' : 'Never share your API keys with anyone'}</li>
                    </ul>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setActiveBroker(null);
                        setShowApiKeys(false);
                      }}
                      className="flex-1 border border-emerald-900/40 text-emerald-300 py-3 px-4 rounded-xl font-medium hover:border-emerald-500/60 hover:bg-emerald-900/10 transition-all"
                    >
                      {isHindi ? 'कैंसिल' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => handleTestConnection(activeBroker)}
                      className="flex-1 border border-green-900/40 text-green-300 py-3 px-4 rounded-xl font-medium hover:border-green-500/60 hover:bg-green-900/10 transition-all"
                    >
                      {isHindi ? 'कनेक्शन टेस्ट' : 'Test Connection'}
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
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {brokerConnections.find(b => b.id === activeBroker)?.status === 'connected' 
                        ? (isHindi ? 'Keys अपडेट करें' : 'Update Keys') 
                        : (isHindi ? 'ब्रोकर कनेक्ट करें' : 'Connect Broker')
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Holdings State */}
      {connectedCount > 0 && holdings.length === 0 && (
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 border border-emerald-900/40">
            <Database className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{isHindi ? 'कोई होल्डिंग्स नहीं मिली' : 'No Holdings Found'}</h3>
          <p className="text-emerald-300/70 mb-6 max-w-md mx-auto">
            {isHindi ? 'आपके कनेक्टेड ब्रोकरों के पास कोई होल्डिंग्स नहीं हैं या आपको उन्हें लोड करने के लिए सिंक करने की जरूरत है।' : 'Your connected brokers don\'t have any holdings or you need to sync to load them.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400/50 font-medium disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isHindi ? 'सिंक हो रहा...' : 'Syncing...') : (isHindi ? 'होल्डिंग्स सिंक करें' : 'Sync Holdings')}</span>
            </button>
            <button 
              onClick={() => setActiveBroker('select')}
              className="inline-flex items-center space-x-2 border border-emerald-900/40 text-emerald-300 hover:border-emerald-500/60 hover:bg-emerald-900/10 px-6 py-3 rounded-xl font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isHindi ? 'एक और ब्रोकर कनेक्ट करें' : 'Connect Another Broker'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerSettings;
