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
  Server
} from 'lucide-react';
import { useBroker } from '../hooks/useBroker';

const BrokerSettings = () => {
  const { brokers, holdings, syncHoldings, loading, error } = useBroker();
  const [activeBroker, setActiveBroker] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [selectedHoldings, setSelectedHoldings] = useState([]);
  const [apiKeys, setApiKeys] = useState({
    zerodha: { key: '', secret: '' },
    upstox: { key: '', secret: '' },
    groww: { key: '', secret: '' },
    angelone: { key: '', secret: '' }
  });

  // Initialize with real data from hook or empty state
  const [brokerConnections, setBrokerConnections] = useState([]);
  
  // Load real connections from hook
  useEffect(() => {
    if (brokers && brokers.length > 0) {
      setBrokerConnections(brokers.map(broker => ({
        id: broker.id,
        name: broker.name,
        status: broker.isConnected ? 'connected' : 'disconnected',
        connectedSince: broker.connectedSince || null,
        lastSync: broker.lastSync || null,
        holdings: broker.holdingsCount || 0,
        balance: broker.availableBalance || 0,
        equity: broker.equityValue || 0,
        profitLoss: broker.profitLoss || '0',
        todayTrades: broker.todayTrades || 0,
        accountType: broker.accountType || 'Regular'
      })));
    } else {
      // No brokers connected - show empty state
      setBrokerConnections([]);
    }
  }, [brokers]);

  // Initialize connection status
  useEffect(() => {
    const status = {};
    brokerConnections.forEach(broker => {
      status[broker.id] = {
        isChecking: false,
        lastChecked: null
      };
    });
    setConnectionStatus(status);
  }, [brokerConnections]);

  const handleSync = async (brokerId) => {
    if (!brokerId) return;
    
    setIsSyncing(true);
    try {
      // Call real sync function
      await syncHoldings(brokerId);
      
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
      // Sync all connected brokers
      for (const broker of connectedBrokers) {
        try {
          await syncHoldings(broker.id);
          // Update each broker's sync time
          setBrokerConnections(prev => prev.map(b => 
            b.id === broker.id 
              ? { 
                  ...b, 
                  lastSync: new Date().toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) 
                }
              : b
          ));
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

  const handleConnectBroker = (brokerType) => {
    // This would normally open OAuth or API key form
    setActiveBroker(brokerType);
  };

  const handleDisconnect = (brokerId) => {
    if (window.confirm('Are you sure you want to disconnect this broker?\n\nYou will need to reconnect with API keys to access holdings.')) {
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
        [brokerId]: { key: '', secret: '' }
      }));
      
      alert('Broker disconnected successfully!');
    }
  };

  const handleSaveApiKeys = (brokerId, apiKey, apiSecret) => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      alert('Please enter both API Key and API Secret');
      return;
    }

    // Save API keys
    setApiKeys(prev => ({
      ...prev,
      [brokerId]: { key: apiKey, secret: apiSecret }
    }));

    // Update broker connection status
    setBrokerConnections(prev => {
      const existingBroker = prev.find(b => b.id === brokerId);
      if (existingBroker) {
        return prev.map(broker => 
          broker.id === brokerId 
            ? { 
                ...broker, 
                status: 'connected',
                connectedSince: new Date().toISOString().split('T')[0],
                lastSync: 'Just now'
              }
            : broker
        );
      } else {
        // Add new broker
        return [...prev, {
          id: brokerId,
          name: brokerId.charAt(0).toUpperCase() + brokerId.slice(1),
          status: 'connected',
          connectedSince: new Date().toISOString().split('T')[0],
          lastSync: 'Just now',
          holdings: 0,
          balance: 0,
          equity: 0,
          profitLoss: '0',
          todayTrades: 0,
          accountType: 'Regular'
        }];
      }
    });

    setActiveBroker(null);
    setShowApiKeys(false);
    alert('Broker connected successfully! Please sync to load holdings.');
  };

  const handleTestConnection = async (brokerId) => {
    const broker = brokerConnections.find(b => b.id === brokerId);
    if (!broker) return;

    setConnectionStatus(prev => ({
      ...prev,
      [brokerId]: { ...prev[brokerId], isChecking: true }
    }));

    // Simulate connection test
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2; // 80% success rate
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
    }, 1500);
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

  // Calculate totals from real data
  const connectedCount = brokerConnections.filter(b => b.status === 'connected').length;
  const totalHoldings = holdings.length;
  const totalBalance = brokerConnections.reduce((sum, broker) => sum + (broker.balance || 0), 0);
  const totalEquity = brokerConnections.reduce((sum, broker) => sum + (broker.equity || 0), 0);

  // Calculate portfolio stats from real holdings
  const totalInvested = holdings.reduce((sum, h) => sum + (h.investedAmount || 0), 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalPnl = holdings.reduce((sum, h) => sum + (h.pnl || 0), 0);
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested * 100) : 0;

  // Get today's P&L (simplified)
  const todayPnl = holdings.reduce((sum, h) => sum + (h.todayPnl || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Broker Settings</h1>
          <p className="text-gray-600">Connect and manage your trading accounts</p>
        </div>
        <button 
          onClick={() => setActiveBroker('new')}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Broker</span>
        </button>
      </div>

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
                <Download className="w-6 h-6 text-purple-600" />
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
                <Upload className="w-6 h-6 text-orange-600" />
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
            onClick={() => setActiveBroker('new')}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Your First Broker</span>
          </button>
          <div className="mt-8 text-sm text-gray-500">
            <p className="mb-2">Supported brokers:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Zerodha', 'Upstox', 'Groww', 'Angel One', 'ICICI Direct', 'HDFC Securities'].map((broker) => (
                <span key={broker} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                  {broker}
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
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
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
                onClick={() => setActiveBroker('new')}
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
                                broker.profitLoss?.startsWith('+') ? 'text-green-600' : 
                                broker.profitLoss?.startsWith('-') ? 'text-red-600' : 'text-gray-600'
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
                                <Eye className="w-4 h-4" />
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
                  <p className="text-2xl font-bold text-gray-900">₹{totalInvested.toLocaleString()}</p>
                  <span className="text-sm font-medium text-gray-500">
                    across {holdings.length} holdings
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-5">
                <p className="text-sm text-gray-600 mb-2">Current Value</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-gray-900">₹{totalCurrentValue.toLocaleString()}</p>
                  <span className={`text-sm font-medium ${
                    totalPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-5">
                <p className="text-sm text-gray-600 mb-2">Total P&L</p>
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold ${
                    totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totalPnl >= 0 ? '+' : ''}₹{Math.abs(totalPnl).toLocaleString()}
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
                    todayPnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {todayPnl >= 0 ? '+' : ''}₹{Math.abs(todayPnl).toLocaleString()}
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
                      const invested = holding.investedAmount || 0;
                      const currentValue = holding.currentValue || 0;
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
                          <td className="py-4 px-6">₹{invested.toLocaleString()}</td>
                          <td className="py-4 px-6">₹{currentValue.toLocaleString()}</td>
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

      {/* API Keys Modal */}
      {activeBroker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">
                    {activeBroker === 'new' 
                      ? 'Connect New Broker' 
                      : `API Keys - ${brokerConnections.find(b => b.id === activeBroker)?.name || activeBroker}`
                    }
                  </h3>
                  <p className="text-gray-600">
                    {activeBroker === 'new' 
                      ? 'Enter your broker API credentials' 
                      : 'Update your API credentials'
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
                {activeBroker === 'new' && (
                  <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Select Broker
                    </h4>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {['zerodha', 'upstox', 'groww', 'angelone'].map((broker) => (
                        <button
                          key={broker}
                          onClick={() => setActiveBroker(broker)}
                          className="p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left"
                        >
                          <div className="font-medium capitalize">{broker}</div>
                          <div className="text-xs text-gray-500 mt-1">API Key Required</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeBroker !== 'new' && (
                  <>
                    <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-4">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Where to find API keys?
                      </h4>
                      <p className="text-sm text-blue-700">
                        1. Log in to your broker's website<br/>
                        2. Navigate to API/Developer settings<br/>
                        3. Generate new API keys with read permissions<br/>
                        4. Copy and paste below
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
                          apiKeys[activeBroker]?.secret
                        )}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium"
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
              onClick={() => setActiveBroker('new')}
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