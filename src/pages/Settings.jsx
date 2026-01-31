import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Download, 
  Activity, 
  Lock, 
  RefreshCw, 
  Trash2, 
  Eye, 
  EyeOff,
  Palette,
  Target,
  TrendingUp,
  AlertCircle,
  Wifi,
  WifiOff,
  Database,
  Clock,
  User,
  Key,
  Zap,
  BarChart3,
  Smartphone,
  Monitor,
  Sun,
  Moon as MoonIcon,
  Sunrise,
  Check,
  X,
  ChevronRight,
  CreditCard,
  Shield as ShieldIcon,
  Users,
  FileText,
  Server,
  Cloud,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const Settings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [showApiKey, setShowApiKey] = useState(false);
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    latency: 0,
    lastCheck: null,
    version: 'unknown'
  });

  // Theme colors based on selected theme
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: 'emerald',
    themeMode: 'dark',
    accentColor: 'blue',
    fontSize: 'medium',
    borderRadius: 'rounded-lg'
  });

  // Main settings state
  const [settings, setSettings] = useState({
    // Notifications
    notifications: {
      emailAlerts: false,
      smsAlerts: false,
      pushNotifications: true,
      whatsappAlerts: false,
      tradeExecuted: true,
      stopLossHit: true,
      targetAchieved: true,
      marketCloseAlerts: true,
      priceAlerts: true,
      newsAlerts: false,
      signalAlerts: true,
      portfolioAlerts: true,
      brokerAlerts: true
    },
    
    // Trading
    trading: {
      autoTradeExecution: false,
      maxPositions: 5,
      maxRiskPerTrade: 2,
      maxDailyLoss: 5,
      defaultQuantity: 1,
      allowShortSelling: false,
      slippageTolerance: 0.5,
      enableHedgeMode: false,
      requireConfirmation: true,
      partialExit: true,
      trailSLAfterProfit: true,
      autoAdjustTargets: true,
      quickTrade: false,
      confirmExit: true
    },
    
    // Risk Management
    risk: {
      stopLossType: 'percentage',
      stopLossValue: 2,
      trailingStopLoss: true,
      trailingStopDistance: 1,
      takeProfitType: 'percentage',
      takeProfitValue: 4,
      riskRewardRatio: 2,
      maxPortfolioRisk: 10,
      volatilityAdjustment: true,
      autoAdjustSl: true,
      maxDrawdown: 15,
      positionSizing: 'fixed',
      riskPerTrade: 1
    },
    
    // Display & Theme
    display: {
      theme: 'dark',
      primaryColor: 'emerald',
      accentColor: 'blue',
      defaultView: 'dashboard',
      refreshInterval: 30,
      showAdvancedCharts: true,
      compactMode: false,
      language: 'en',
      showIndicators: true,
      darkModeIntensity: 'medium',
      chartType: 'candlestick',
      gridLines: true,
      animationSpeed: 'normal',
      fontSize: 'medium',
      density: 'comfortable',
      showProfitLoss: true,
      showHoldings: true,
      showWatchlist: true
    },
    
    // Privacy & Security
    privacy: {
      publicProfile: false,
      showPortfolioValue: true,
      shareTradingHistory: false,
      dataSharing: 'anonymous',
      twoFactorAuth: false,
      sessionTimeout: 30,
      showRealName: false,
      hideBalance: false,
      autoLogout: true,
      encryptData: true,
      activityLogs: true,
      ipWhitelist: []
    },
    
    // API & Integrations
    api: {
      allowThirdPartyAccess: false,
      webhookEnabled: false,
      rateLimit: 'medium',
      logRetention: '30days',
      apiKey: '',
      webhookUrl: '',
      autoSync: true,
      syncInterval: 5,
      realTimeUpdates: true,
      dataCompression: true,
      connectionRetry: 3
    },
    
    // Broker Settings
    broker: {
      connectedBrokers: [],
      autoSync: false,
      syncInterval: 5,
      orderConfirmation: true,
      quickOrder: false,
      defaultBroker: '',
      marginMultiplier: 1,
      orderValidity: 'day',
      productType: 'intraday',
      exchange: 'NSE'
    },
    
    // Subscription
    subscription: {
      plan: 'free_trial',
      trialDaysLeft: user?.trialDaysLeft || 7,
      autoRenew: false,
      billingCycle: 'monthly',
      paymentMethod: '',
      nextBillingDate: '',
      features: []
    },
    
    // Advanced
    advanced: {
      debugMode: false,
      performanceMode: 'balanced',
      cacheEnabled: true,
      cacheSize: 100,
      logLevel: 'error',
      autoUpdate: true,
      backupEnabled: true,
      backupInterval: 24,
      analytics: true,
      crashReports: false
    }
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    checkBackendStatus();
    
    // Set up periodic backend checks
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update theme when display settings change
  useEffect(() => {
    if (settings.display.theme) {
      setThemeSettings(prev => ({
        ...prev,
        themeMode: settings.display.theme,
        primaryColor: settings.display.primaryColor,
        accentColor: settings.display.accentColor
      }));
      
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', settings.display.theme);
      document.documentElement.setAttribute('data-primary', settings.display.primaryColor);
      document.documentElement.setAttribute('data-accent', settings.display.accentColor);
    }
  }, [settings.display.theme, settings.display.primaryColor, settings.display.accentColor]);

  // Load settings from backend
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const result = await api.settings.getSettings();
      
      if (result.success && result.settings) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      const startTime = Date.now();
      const result = await api.health.check();
      const latency = Date.now() - startTime;
      
      setBackendStatus({
        connected: result.success && result.status === 'online',
        latency,
        lastCheck: new Date().toISOString(),
        version: result.version || 'unknown',
        features: result.features || []
      });
    } catch (error) {
      setBackendStatus(prev => ({
        ...prev,
        connected: false,
        lastCheck: new Date().toISOString()
      }));
    }
  };

  // Handle setting changes
  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  // Handle nested setting changes
  const handleNestedChange = (category, subKey, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subKey]: {
          ...prev[category][subKey],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    if (!hasChanges) {
      alert('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      const result = await api.settings.saveSettings(settings);
      
      if (result.success) {
        setHasChanges(false);
        alert('Settings saved successfully');
      } else {
        alert(`Failed to save settings: ${result.message}`);
      }
    } catch (error) {
      alert('Error saving settings. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      try {
        const result = await api.settings.resetSettings();
        
        if (result.success) {
          await loadSettings();
          setHasChanges(false);
          alert('Settings reset to defaults');
        }
      } catch (error) {
        alert('Error resetting settings');
      }
    }
  };

  // Export settings
  const handleExport = async () => {
    try {
      const result = await api.settings.exportSettings();
      
      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportName = `veloxtradeai-settings-${new Date().toISOString().split('T')[0]}.json`;
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', exportName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      alert('Error exporting settings');
    }
  };

  // Test broker connection
  const testBrokerConnection = async () => {
    if (!settings.broker.defaultBroker) {
      alert('Please select a default broker first');
      return;
    }
    
    try {
      const result = await api.broker.testConnection(settings.broker.defaultBroker);
      
      if (result.success) {
        alert(`✅ ${settings.broker.defaultBroker} connection successful`);
      } else {
        alert(`❌ Connection failed: ${result.message}`);
      }
    } catch (error) {
      alert('Error testing connection');
    }
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, id, disabled = false }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-11 h-6 ${disabled ? 'bg-gray-700' : 'bg-gray-600'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${disabled ? 'peer-checked:bg-gray-500' : 'peer-checked:bg-emerald-600'}`}></div>
    </label>
  );

  // Tabs configuration
  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, color: 'text-blue-400' },
    { id: 'trading', label: 'Trading', icon: <Activity className="w-4 h-4" />, color: 'text-green-400' },
    { id: 'risk', label: 'Risk Management', icon: <Shield className="w-4 h-4" />, color: 'text-orange-400' },
    { id: 'display', label: 'Display', icon: <Palette className="w-4 h-4" />, color: 'text-purple-400' },
    { id: 'privacy', label: 'Privacy & Security', icon: <Lock className="w-4 h-4" />, color: 'text-red-400' },
    { id: 'broker', label: 'Broker', icon: <TrendingUp className="w-4 h-4" />, color: 'text-cyan-400' },
    { id: 'api', label: 'API & Integration', icon: <Globe className="w-4 h-4" />, color: 'text-indigo-400' },
    { id: 'advanced', label: 'Advanced', icon: <Cpu className="w-4 h-4" />, color: 'text-gray-400' }
  ];

  // Theme colors for selection
  const themeColors = [
    { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-500' },
    { id: 'blue', name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500' },
    { id: 'purple', name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500' },
    { id: 'orange', name: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500' },
    { id: 'red', name: 'Red', bg: 'bg-red-500', text: 'text-red-500' },
    { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500', text: 'text-cyan-500' }
  ];

  // Theme modes
  const themeModes = [
    { id: 'dark', name: 'Dark', icon: <MoonIcon className="w-5 h-5" /> },
    { id: 'light', name: 'Light', icon: <Sun className="w-5 h-5" /> },
    { id: 'auto', name: 'Auto', icon: <Sunrise className="w-5 h-5" /> }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-400 mt-1">Configure your VeloxTradeAI experience</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Backend Status */}
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-2 ${backendStatus.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {backendStatus.connected ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span>Backend Connected</span>
                    <span className="text-xs">({backendStatus.latency}ms)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>Backend Offline</span>
                  </>
                )}
              </div>
              
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all ${
                  hasChanges && !isSaving
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-400">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Plan</span>
                    <span className="font-medium text-emerald-400 capitalize">{settings.subscription.plan.replace('_', ' ')}</span>
                  </div>
                  
                  {settings.subscription.plan === 'free_trial' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Trial Days Left</span>
                      <span className="font-medium text-amber-400">{settings.subscription.trialDaysLeft}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tab Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30'
                        : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`${tab.color}`}>
                      {tab.icon}
                    </div>
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <ChevronRight className="w-4 h-4 ml-auto text-emerald-400" />
                    )}
                  </button>
                ))}
              </nav>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Settings</span>
                </button>
                
                <button
                  onClick={handleReset}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-700/50 transition-colors text-amber-400"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset to Defaults</span>
                </button>
              </div>
            </div>
            
            {/* System Status */}
            <div className="mt-4 bg-gray-800/50 rounded-xl border border-gray-700 p-4">
              <h3 className="font-medium mb-3 flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span>System Status</span>
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Backend</span>
                  <span className={`flex items-center space-x-1 ${backendStatus.connected ? 'text-emerald-400' : 'text-red-400'}`}>
                    {backendStatus.connected ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>{backendStatus.connected ? 'Online' : 'Offline'}</span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Latency</span>
                  <span className={backendStatus.latency < 100 ? 'text-emerald-400' : backendStatus.latency < 300 ? 'text-amber-400' : 'text-red-400'}>
                    {backendStatus.latency}ms
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Version</span>
                  <span className="text-gray-300">{backendStatus.version}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Check</span>
                  <span className="text-gray-300">
                    {backendStatus.lastCheck ? new Date(backendStatus.lastCheck).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              {/* Tab Content Header */}
              <div className="border-b border-gray-700 px-6 py-4">
                <div className="flex items-center space-x-2">
                  {tabs.find(t => t.id === activeTab)?.icon}
                  <h2 className="text-xl font-bold">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                </div>
                <p className="text-gray-400 mt-1 text-sm">
                  {activeTab === 'notifications' && 'Configure how and when you receive notifications'}
                  {activeTab === 'trading' && 'Set up your trading preferences and automation'}
                  {activeTab === 'risk' && 'Manage your risk parameters and safety measures'}
                  {activeTab === 'display' && 'Customize the look and feel of the application'}
                  {activeTab === 'privacy' && 'Control your privacy and security settings'}
                  {activeTab === 'broker' && 'Configure broker connections and settings'}
                  {activeTab === 'api' && 'Manage API integrations and webhooks'}
                  {activeTab === 'advanced' && 'Advanced system settings and configurations'}
                </p>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Trade Notifications */}
                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                          <Activity className="w-5 h-5 text-blue-400" />
                          <span>Trade Events</span>
                        </h3>
                        <div className="space-y-3">
                          {[
                            { key: 'tradeExecuted', label: 'Trade Executed', desc: 'When a trade is successfully placed' },
                            { key: 'stopLossHit', label: 'Stop Loss Hit', desc: 'When stop loss is triggered' },
                            { key: 'targetAchieved', label: 'Target Achieved', desc: 'When profit target is reached' },
                            { key: 'signalAlerts', label: 'AI Signal Alerts', desc: 'New high-confidence AI signals' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                              <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                              </div>
                              <ToggleSwitch
                                checked={settings.notifications[item.key]}
                                onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                                id={`notif-${item.key}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Alert Channels */}
                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                          <Bell className="w-5 h-5 text-purple-400" />
                          <span>Alert Channels</span>
                        </h3>
                        <div className="space-y-3">
                          {[
                            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser and app notifications' },
                            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive notifications via email' },
                            { key: 'whatsappAlerts', label: 'WhatsApp Alerts', desc: 'WhatsApp messages (coming soon)' },
                            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Text message alerts (premium)' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                              <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                              </div>
                              <ToggleSwitch
                                checked={settings.notifications[item.key]}
                                onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                                id={`channel-${item.key}`}
                                disabled={item.key === 'whatsappAlerts' || item.key === 'smsAlerts'}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Market Notifications */}
                    <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                      <h3 className="font-bold text-lg mb-4">Market & Portfolio</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { key: 'marketCloseAlerts', label: 'Market Close', desc: 'Daily market close summary' },
                          { key: 'priceAlerts', label: 'Price Alerts', desc: 'Custom price level notifications' },
                          { key: 'portfolioAlerts', label: 'Portfolio Alerts', desc: 'Significant portfolio changes' },
                          { key: 'newsAlerts', label: 'News Alerts', desc: 'Important market news' },
                          { key: 'brokerAlerts', label: 'Broker Alerts', desc: 'Broker connection status' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-xs text-gray-400">{item.desc}</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.notifications[item.key]}
                              onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                              id={`market-${item.key}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TRADING TAB */}
                {activeTab === 'trading' && (
                  <div className="space-y-6">
                    {/* Auto Trading */}
                    <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 rounded-xl border border-emerald-800/30 p-5">
                      <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        <span>Auto Trading</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                          <div>
                            <p className="font-bold">Auto Trade Execution</p>
                            <p className="text-sm text-gray-400">Automatically execute trades based on AI signals</p>
                          </div>
                          <ToggleSwitch
                            checked={settings.trading.autoTradeExecution}
                            onChange={(e) => handleSettingChange('trading', 'autoTradeExecution', e.target.checked)}
                            id="autoTrade"
                          />
                        </div>
                        
                        {settings.trading.autoTradeExecution && (
                          <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-4">
                            <p className="font-medium text-amber-400 mb-2">⚠️ Auto Trading Enabled</p>
                            <p className="text-sm text-amber-300/80">
                              Trades will be executed automatically. Monitor your account regularly.
                              Make sure your risk settings are properly configured.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trading Limits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4">Position Limits</h3>
                        <div className="space-y-4">
                          {[
                            { key: 'maxPositions', label: 'Max Open Positions', value: settings.trading.maxPositions, min: 1, max: 20 },
                            { key: 'maxRiskPerTrade', label: 'Max Risk Per Trade (%)', value: settings.trading.maxRiskPerTrade, min: 0.5, max: 10, step: 0.5 },
                            { key: 'maxDailyLoss', label: 'Max Daily Loss (%)', value: settings.trading.maxDailyLoss, min: 1, max: 20 }
                          ].map((item) => (
                            <div key={item.key}>
                              <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium">{item.label}</label>
                                <span className="text-emerald-400 font-bold">{item.value}{item.key.includes('Risk') || item.key.includes('Loss') ? '%' : ''}</span>
                              </div>
                              <input
                                type="range"
                                min={item.min}
                                max={item.max}
                                step={item.step || 1}
                                value={item.value}
                                onChange={(e) => handleSettingChange('trading', item.key, parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                              />
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>{item.min}{item.key.includes('Risk') || item.key.includes('Loss') ? '%' : ''}</span>
                                <span>{item.max}{item.key.includes('Risk') || item.key.includes('Loss') ? '%' : ''}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4">Trading Preferences</h3>
                        <div className="space-y-3">
                          {[
                            { key: 'requireConfirmation', label: 'Require Confirmation', desc: 'Confirm each trade before execution' },
                            { key: 'partialExit', label: 'Partial Exit', desc: 'Allow partial position exits' },
                            { key: 'trailSLAfterProfit', label: 'Trail SL After Profit', desc: 'Automatically trail stop loss' },
                            { key: 'autoAdjustTargets', label: 'Auto Adjust Targets', desc: 'Adjust targets based on market' },
                            { key: 'allowShortSelling', label: 'Allow Short Selling', desc: 'Enable short selling trades' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                              <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                              </div>
                              <ToggleSwitch
                                checked={settings.trading[item.key]}
                                onChange={(e) => handleSettingChange('trading', item.key, e.target.checked)}
                                id={`trading-${item.key}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* RISK MANAGEMENT TAB */}
                {activeTab === 'risk' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Stop Loss Settings */}
                      <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/10 rounded-xl border border-orange-800/30 p-5">
                        <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-orange-400" />
                          <span>Stop Loss Settings</span>
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Stop Loss Type</label>
                            <select
                              value={settings.risk.stopLossType}
                              onChange={(e) => handleSettingChange('risk', 'stopLossType', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                            >
                              <option value="percentage">Percentage (%)</option>
                              <option value="absolute">Absolute (₹)</option>
                              <option value="atr">ATR Based</option>
                              <option value="support">Support/Resistance</option>
                            </select>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="text-sm font-medium">Stop Loss Value</label>
                              <span className="text-orange-400 font-bold">{settings.risk.stopLossValue}{settings.risk.stopLossType === 'percentage' ? '%' : '₹'}</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="10"
                              step="0.5"
                              value={settings.risk.stopLossValue}
                              onChange={(e) => handleSettingChange('risk', 'stopLossValue', parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Trailing Stop Loss</p>
                              <p className="text-sm text-gray-400">Automatically adjust stop loss as price moves</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.risk.trailingStopLoss}
                              onChange={(e) => handleSettingChange('risk', 'trailingStopLoss', e.target.checked)}
                              id="trailingSL"
                            />
                          </div>
                          
                          {settings.risk.trailingStopLoss && (
                            <div>
                              <label className="block text-sm font-medium mb-2">Trailing Distance (%)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={settings.risk.trailingStopDistance}
                                onChange={(e) => handleSettingChange('risk', 'trailingStopDistance', parseFloat(e.target.value))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                                min="0.5"
                                max="5"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Take Profit Settings */}
                      <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 rounded-xl border border-emerald-800/30 p-5">
                        <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                          <Target className="w-5 h-5 text-emerald-400" />
                          <span>Take Profit Settings</span>
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Take Profit Type</label>
                            <select
                              value={settings.risk.takeProfitType}
                              onChange={(e) => handleSettingChange('risk', 'takeProfitType', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                            >
                              <option value="percentage">Percentage (%)</option>
                              <option value="absolute">Absolute (₹)</option>
                              <option value="rr">Risk/Reward Ratio</option>
                            </select>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="text-sm font-medium">Take Profit Value</label>
                              <span className="text-emerald-400 font-bold">
                                {settings.risk.takeProfitValue}
                                {settings.risk.takeProfitType === 'percentage' ? '%' : 
                                 settings.risk.takeProfitType === 'absolute' ? '₹' : ':1'}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="20"
                              step={settings.risk.takeProfitType === 'rr' ? 0.5 : 1}
                              value={settings.risk.takeProfitValue}
                              onChange={(e) => handleSettingChange('risk', 'takeProfitValue', parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                            />
                          </div>
                          
                          {/* Risk/Reward Display */}
                          <div className="bg-gray-900/50 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Risk/Reward Ratio</h4>
                            <div className="flex items-center justify-between">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-400">
                                  1:{((settings.risk.takeProfitValue / settings.risk.stopLossValue) || 0).toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-400">Current Setup</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-amber-400">
                                  {settings.risk.riskRewardRatio}:1
                                </div>
                                <div className="text-xs text-gray-400">Target Ratio</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Auto Adjust SL</p>
                              <p className="text-sm text-gray-400">Automatically adjust stop loss based on volatility</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.risk.autoAdjustSl}
                              onChange={(e) => handleSettingChange('risk', 'autoAdjustSl', e.target.checked)}
                              id="autoAdjustSL"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Portfolio Risk */}
                    <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                      <h3 className="font-bold text-lg mb-4">Portfolio Risk Management</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Max Portfolio Risk (%)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={settings.risk.maxPortfolioRisk}
                            onChange={(e) => handleSettingChange('risk', 'maxPortfolioRisk', parseFloat(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            min="1"
                            max="30"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Max Drawdown (%)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={settings.risk.maxDrawdown}
                            onChange={(e) => handleSettingChange('risk', 'maxDrawdown', parseFloat(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            min="5"
                            max="50"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Risk Per Trade (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={settings.risk.riskPerTrade}
                            onChange={(e) => handleSettingChange('risk', 'riskPerTrade', parseFloat(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            min="0.1"
                            max="5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DISPLAY TAB */}
                {activeTab === 'display' && (
                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                      <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                        <Palette className="w-5 h-5 text-purple-400" />
                        <span>Theme & Appearance</span>
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Theme Mode */}
                        <div>
                          <label className="block text-sm font-medium mb-3">Theme Mode</label>
                          <div className="grid grid-cols-3 gap-3">
                            {themeModes.map((theme) => (
                              <button
                                key={theme.id}
                                onClick={() => handleSettingChange('display', 'theme', theme.id)}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                                  settings.display.theme === theme.id
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                                }`}
                              >
                                <div className={`mb-2 ${settings.display.theme === theme.id ? 'text-purple-400' : 'text-gray-400'}`}>
                                  {theme.icon}
                                </div>
                                <span className="text-sm font-medium">{theme.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Color Selection */}
                        <div>
                          <label className="block text-sm font-medium mb-3">Primary Color</label>
                          <div className="flex flex-wrap gap-2">
                            {themeColors.map((color) => (
                              <button
                                key={color.id}
                                onClick={() => handleSettingChange('display', 'primaryColor', color.id)}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${
                                  settings.display.primaryColor === color.id
                                    ? 'border-white'
                                    : 'border-transparent'
                                } ${color.bg}`}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* Accent Color */}
                        <div>
                          <label className="block text-sm font-medium mb-3">Accent Color</label>
                          <div className="flex flex-wrap gap-2">
                            {themeColors.map((color) => (
                              <button
                                key={color.id}
                                onClick={() => handleSettingChange('display', 'accentColor', color.id)}
                                className={`w-8 h-8 rounded-full border transition-all ${
                                  settings.display.accentColor === color.id
                                    ? 'border-2 border-white'
                                    : 'border border-gray-600'
                                } ${color.bg}`}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Display Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4">Display Preferences</h3>
                        <div className="space-y-3">
                          {[
                            { key: 'showAdvancedCharts', label: 'Advanced Charts', desc: 'Show advanced charting tools' },
                            { key: 'showIndicators', label: 'Technical Indicators', desc: 'Display technical indicators' },
                            { key: 'gridLines', label: 'Grid Lines', desc: 'Show grid lines on charts' },
                            { key: 'showProfitLoss', label: 'P&L Display', desc: 'Show profit/loss on dashboard' },
                            { key: 'showHoldings', label: 'Holdings Display', desc: 'Show holdings on dashboard' },
                            { key: 'compactMode', label: 'Compact Mode', desc: 'Use compact view for more data' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                              <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                              </div>
                              <ToggleSwitch
                                checked={settings.display[item.key]}
                                onChange={(e) => handleSettingChange('display', item.key, e.target.checked)}
                                id={`display-${item.key}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4">Language & Refresh</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Language</label>
                            <select
                              value={settings.display.language}
                              onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="en">English</option>
                              <option value="hi">हिंदी (Hindi)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Refresh Interval (seconds)</label>
                            <select
                              value={settings.display.refreshInterval}
                              onChange={(e) => handleSettingChange('display', 'refreshInterval', parseInt(e.target.value))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="10">10 seconds (Real-time)</option>
                              <option value="30">30 seconds</option>
                              <option value="60">1 minute</option>
                              <option value="300">5 minutes</option>
                              <option value="0">Manual</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Chart Type</label>
                            <select
                              value={settings.display.chartType}
                              onChange={(e) => handleSettingChange('display', 'chartType', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="candlestick">Candlestick</option>
                              <option value="line">Line</option>
                              <option value="area">Area</option>
                              <option value="heikinashi">Heikin Ashi</option>
                            </select>
                          </div>
                          
                          {settings.display.theme === 'dark' && (
                            <div>
                              <label className="block text-sm font-medium mb-2">Dark Mode Intensity</label>
                              <select
                                value={settings.display.darkModeIntensity}
                                onChange={(e) => handleSettingChange('display', 'darkModeIntensity', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                              >
                                <option value="soft">Soft</option>
                                <option value="medium">Medium</option>
                                <option value="deep">Deep</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PRIVACY & SECURITY TAB */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    {/* Security Features */}
                    <div className="bg-gradient-to-r from-red-900/20 to-red-800/10 rounded-xl border border-red-800/30 p-5">
                      <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                        <ShieldIcon className="w-5 h-5 text-red-400" />
                        <span>Security Features</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                          <div>
                            <p className="font-bold">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                          </div>
                          <ToggleSwitch
                            checked={settings.privacy.twoFactorAuth}
                            onChange={(e) => handleSettingChange('privacy', 'twoFactorAuth', e.target.checked)}
                            id="twoFactorAuth"
                          />
                        </div>
                        
                        {settings.privacy.twoFactorAuth && (
                          <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-lg p-4">
                            <p className="font-medium text-emerald-400 mb-2">✅ 2FA Enabled</p>
                            <p className="text-sm text-emerald-300/80">
                              Your account is protected with two-factor authentication.
                              You will need to enter a code from your authenticator app when logging in.
                            </p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Auto Logout</p>
                              <p className="text-sm text-gray-400">Automatically logout after inactivity</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.privacy.autoLogout}
                              onChange={(e) => handleSettingChange('privacy', 'autoLogout', e.target.checked)}
                              id="autoLogout"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Encrypt Data</p>
                              <p className="text-sm text-gray-400">Encrypt sensitive data locally</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.privacy.encryptData}
                              onChange={(e) => handleSettingChange('privacy', 'encryptData', e.target.checked)}
                              id="encryptData"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4">Privacy Settings</h3>
                        <div className="space-y-3">
                          {[
                            { key: 'publicProfile', label: 'Public Profile', desc: 'Allow others to view your profile' },
                            { key: 'showPortfolioValue', label: 'Show Portfolio Value', desc: 'Display portfolio value in profile' },
                            { key: 'shareTradingHistory', label: 'Share Trading History', desc: 'Share anonymized trading history' },
                            { key: 'showRealName', label: 'Show Real Name', desc: 'Display your real name' },
                            { key: 'hideBalance', label: 'Hide Balance', desc: 'Hide account balance from view' },
                            { key: 'activityLogs', label: 'Activity Logs', desc: 'Keep logs of account activity' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                              <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                              </div>
                              <ToggleSwitch
                                checked={settings.privacy[item.key]}
                                onChange={(e) => handleSettingChange('privacy', item.key, e.target.checked)}
                                id={`privacy-${item.key}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4">Data & Session</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                            <select
                              value={settings.privacy.sessionTimeout}
                              onChange={(e) => handleSettingChange('privacy', 'sessionTimeout', parseInt(e.target.value))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="15">15 minutes</option>
                              <option value="30">30 minutes</option>
                              <option value="60">1 hour</option>
                              <option value="120">2 hours</option>
                              <option value="0">Never (Not Recommended)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Data Sharing</label>
                            <select
                              value={settings.privacy.dataSharing}
                              onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="none">No Data Sharing</option>
                              <option value="anonymous">Anonymous Aggregated Data</option>
                              <option value="full">Full Data (Improve AI)</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                              {settings.privacy.dataSharing === 'none' && 'No data will be shared. Highest privacy.'}
                              {settings.privacy.dataSharing === 'anonymous' && 'Only anonymous, aggregated data for service improvement.'}
                              {settings.privacy.dataSharing === 'full' && 'Your data helps improve AI algorithms. Thank you!'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BROKER TAB */}
                {activeTab === 'broker' && (
                  <div className="space-y-6">
                    {/* Broker Connection */}
                    <div className="bg-gradient-to-r from-cyan-900/20 to-cyan-800/10 rounded-xl border border-cyan-800/30 p-5">
                      <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                        <span>Broker Connection</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Default Broker</label>
                          <select
                            value={settings.broker.defaultBroker}
                            onChange={(e) => handleSettingChange('broker', 'defaultBroker', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">Select Broker</option>
                            <option value="zerodha">Zerodha</option>
                            <option value="angel">Angel Broking</option>
                            <option value="upstox">Upstox</option>
                            <option value="groww">Groww</option>
                            <option value="icici">ICICI Direct</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                          <div>
                            <p className="font-medium">Auto Sync Holdings</p>
                            <p className="text-sm text-gray-400">Automatically sync holdings from broker</p>
                          </div>
                          <ToggleSwitch
                            checked={settings.broker.autoSync}
                            onChange={(e) => handleSettingChange('broker', 'autoSync', e.target.checked)}
                            id="autoSync"
                          />
                        </div>
                        
                        {settings.broker.autoSync && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Sync Interval (minutes)</label>
                            <input
                              type="number"
                              value={settings.broker.syncInterval}
                              onChange={(e) => handleSettingChange('broker', 'syncInterval', parseInt(e.target.value))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                              min="1"
                              max="60"
                            />
                          </div>
                        )}
                        
                        {settings.broker.defaultBroker && (
                          <button
                            onClick={testBrokerConnection}
                            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Test {settings.broker.defaultBroker.charAt(0).toUpperCase() + settings.broker.defaultBroker.slice(1)} Connection
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4">Order Settings</h3>
                        <div className="space-y-3">
                          {[
                            { key: 'orderConfirmation', label: 'Order Confirmation', desc: 'Confirm before placing orders' },
                            { key: 'quickOrder', label: 'Quick Order', desc: 'Enable one-click trading' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                              <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                              </div>
                              <ToggleSwitch
                                checked={settings.broker[item.key]}
                                onChange={(e) => handleSettingChange('broker', item.key, e.target.checked)}
                                id={`broker-${item.key}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4">Trading Parameters</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Exchange</label>
                            <select
                              value={settings.broker.exchange}
                              onChange={(e) => handleSettingChange('broker', 'exchange', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="NSE">NSE</option>
                              <option value="BSE">BSE</option>
                              <option value="NFO">NFO (Options)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Product Type</label>
                            <select
                              value={settings.broker.productType}
                              onChange={(e) => handleSettingChange('broker', 'productType', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="intraday">Intraday</option>
                              <option value="delivery">Delivery</option>
                              <option value="cnc">CNC</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Margin Multiplier</label>
                            <input
                              type="number"
                              step="0.1"
                              value={settings.broker.marginMultiplier}
                              onChange={(e) => handleSettingChange('broker', 'marginMultiplier', parseFloat(e.target.value))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                              min="1"
                              max="5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* API & INTEGRATION TAB */}
                {activeTab === 'api' && (
                  <div className="space-y-6">
                    {/* API Settings */}
                    <div className="bg-gradient-to-r from-indigo-900/20 to-indigo-800/10 rounded-xl border border-indigo-800/30 p-5">
                      <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-indigo-400" />
                        <span>API & Integration Settings</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Third-Party API Access</p>
                              <p className="text-sm text-gray-400">Allow external apps to access your data</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.api.allowThirdPartyAccess}
                              onChange={(e) => handleSettingChange('api', 'allowThirdPartyAccess', e.target.checked)}
                              id="thirdPartyApi"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Webhook Notifications</p>
                              <p className="text-sm text-gray-400">Send trade notifications to webhook URL</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.api.webhookEnabled}
                              onChange={(e) => handleSettingChange('api', 'webhookEnabled', e.target.checked)}
                              id="webhook"
                            />
                          </div>
                        </div>
                        
                        {settings.api.webhookEnabled && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Webhook URL</label>
                            <div className="relative">
                              <input
                                type={showApiKey ? 'text' : 'password'}
                                value={settings.api.webhookUrl}
                                onChange={(e) => handleSettingChange('api', 'webhookUrl', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm pr-10"
                                placeholder="https://your-webhook-url.com"
                              />
                              <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                              >
                                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">API Rate Limit</label>
                            <select
                              value={settings.api.rateLimit}
                              onChange={(e) => handleSettingChange('api', 'rateLimit', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="low">Low (10 req/min)</option>
                              <option value="medium">Medium (30 req/min)</option>
                              <option value="high">High (60 req/min)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Log Retention</label>
                            <select
                              value={settings.api.logRetention}
                              onChange={(e) => handleSettingChange('api', 'logRetention', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="7days">7 Days</option>
                              <option value="30days">30 Days</option>
                              <option value="90days">90 Days</option>
                              <option value="1year">1 Year</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                          <div>
                            <p className="font-medium">Real-time Updates</p>
                            <p className="text-sm text-gray-400">Enable real-time WebSocket updates</p>
                          </div>
                          <ToggleSwitch
                            checked={settings.api.realTimeUpdates}
                            onChange={(e) => handleSettingChange('api', 'realTimeUpdates', e.target.checked)}
                            id="realTimeUpdates"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Connection Settings */}
                    <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                      <h3 className="font-bold text-lg mb-4">Connection Settings</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Auto Sync</label>
                          <ToggleSwitch
                            checked={settings.api.autoSync}
                            onChange={(e) => handleSettingChange('api', 'autoSync', e.target.checked)}
                            id="apiAutoSync"
                          />
                          <p className="text-xs text-gray-400 mt-1">Automatically sync data</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Sync Interval (min)</label>
                          <input
                            type="number"
                            value={settings.api.syncInterval}
                            onChange={(e) => handleSettingChange('api', 'syncInterval', parseInt(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            min="1"
                            max="60"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Connection Retry</label>
                          <input
                            type="number"
                            value={settings.api.connectionRetry}
                            onChange={(e) => handleSettingChange('api', 'connectionRetry', parseInt(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            min="1"
                            max="10"
                          />
                          <p className="text-xs text-gray-400 mt-1">Max retry attempts</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-amber-900/20 border border-amber-800/30 rounded-lg">
                        <h4 className="font-medium text-amber-400 mb-2">⚠️ API Security Notice</h4>
                        <ul className="text-sm text-amber-300/80 space-y-1">
                          <li>• Keep your API keys secure and never share them publicly</li>
                          <li>• Regularly rotate your API keys for better security</li>
                          <li>• Monitor API usage logs for suspicious activities</li>
                          <li>• Use IP whitelisting if available for added security</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* ADVANCED TAB */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    {/* Performance Settings */}
                    <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                      <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                        <Cpu className="w-5 h-5 text-gray-400" />
                        <span>Performance Settings</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Performance Mode</label>
                          <select
                            value={settings.advanced.performanceMode}
                            onChange={(e) => handleSettingChange('advanced', 'performanceMode', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="power_saver">Power Saver</option>
                            <option value="balanced">Balanced</option>
                            <option value="performance">Performance</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Cache Enabled</p>
                              <p className="text-sm text-gray-400">Enable data caching for faster loading</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.advanced.cacheEnabled}
                              onChange={(e) => handleSettingChange('advanced', 'cacheEnabled', e.target.checked)}
                              id="cacheEnabled"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Auto Update</p>
                              <p className="text-sm text-gray-400">Automatically check for updates</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.advanced.autoUpdate}
                              onChange={(e) => handleSettingChange('advanced', 'autoUpdate', e.target.checked)}
                              id="autoUpdate"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Cache Size (MB)</label>
                            <input
                              type="number"
                              value={settings.advanced.cacheSize}
                              onChange={(e) => handleSettingChange('advanced', 'cacheSize', parseInt(e.target.value))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                              min="10"
                              max="1000"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Backup Interval (hours)</label>
                            <input
                              type="number"
                              value={settings.advanced.backupInterval}
                              onChange={(e) => handleSettingChange('advanced', 'backupInterval', parseInt(e.target.value))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                              min="1"
                              max="168"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Debug & Logging */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4">Debug & Logging</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Debug Mode</p>
                              <p className="text-sm text-gray-400">Enable debug logging (for developers)</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.advanced.debugMode}
                              onChange={(e) => handleSettingChange('advanced', 'debugMode', e.target.checked)}
                              id="debugMode"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Log Level</label>
                            <select
                              value={settings.advanced.logLevel}
                              onChange={(e) => handleSettingChange('advanced', 'logLevel', e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="error">Error</option>
                              <option value="warn">Warning</option>
                              <option value="info">Info</option>
                              <option value="debug">Debug</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Analytics</p>
                              <p className="text-sm text-gray-400">Send anonymous usage analytics</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.advanced.analytics}
                              onChange={(e) => handleSettingChange('advanced', 'analytics', e.target.checked)}
                              id="analytics"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Crash Reports</p>
                              <p className="text-sm text-gray-400">Send crash reports to improve stability</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.advanced.crashReports}
                              onChange={(e) => handleSettingChange('advanced', 'crashReports', e.target.checked)}
                              id="crashReports"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
                        <h3 className="font-bold text-lg mb-4">Backup & Restore</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <div>
                              <p className="font-medium">Backup Enabled</p>
                              <p className="text-sm text-gray-400">Automatically backup settings and data</p>
                            </div>
                            <ToggleSwitch
                              checked={settings.advanced.backupEnabled}
                              onChange={(e) => handleSettingChange('advanced', 'backupEnabled', e.target.checked)}
                              id="backupEnabled"
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <button
                              onClick={handleExport}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span>Export All Data</span>
                            </button>
                            
                            <button
                              onClick={handleReset}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-amber-700/30 hover:bg-amber-700/40 text-amber-400 rounded-lg transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Reset to Factory Defaults</span>
                            </button>
                            
                            <button
                              onClick={() => alert('This will delete all your data. Are you sure?')}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-700/30 hover:bg-red-700/40 text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete All Data</span>
                            </button>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400">
                              <strong>Note:</strong> Backup files are stored locally in your browser. 
                              For complete data safety, regularly export your data.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Save Button (Bottom) */}
            {hasChanges && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium shadow-lg transition-all flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save All Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
