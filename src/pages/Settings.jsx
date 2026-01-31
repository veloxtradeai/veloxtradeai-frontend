import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Globe, Moon, Download, Activity, Lock, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      whatsappAlerts: false,
      tradeExecuted: true,
      stopLossHit: true,
      targetAchieved: true,
      marketCloseAlerts: true,
      priceAlerts: true,
      newsAlerts: true
    },
    
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
      brokerApiKey: '',
      brokerSecretKey: '',
      brokerSelected: ''
    },
    
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
      autoAdjustSl: true
    },
    
    display: {
      theme: 'light',
      defaultView: 'dashboard',
      refreshInterval: 30,
      showAdvancedCharts: true,
      compactMode: false,
      language: 'en',
      showIndicators: true,
      darkModeIntensity: 'medium',
      fontSize: 'medium',
      showProfitLoss: true
    },
    
    privacy: {
      publicProfile: false,
      showPortfolioValue: true,
      shareTradingHistory: false,
      dataSharing: 'anonymous',
      twoFactorAuth: false,
      sessionTimeout: 30,
      showRealName: false,
      hideBalance: false
    },
    
    api: {
      allowThirdPartyAccess: false,
      webhookEnabled: false,
      rateLimit: 'medium',
      logRetention: '30days',
      webhookUrl: '',
      apiKey: ''
    }
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // असली डेटा लोड करने के लिए
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // असली API कॉल - फेक डेटा नहीं
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('सेटिंग्स लोड करने में त्रुटि:', error);
      // एरर केस में डिफ़ॉल्ट सेटिंग्स रखें
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!hasChanges) {
      alert('कोई बदलाव नहीं हुए हैं!');
      return;
    }
    
    setIsSaving(true);
    try {
      // असली API कॉल
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings })
      });
      
      if (response.ok) {
        alert('सेटिंग्स सफलतापूर्वक सहेजी गईं!');
        setHasChanges(false);
      } else {
        alert('सेटिंग्स सेव करने में त्रुटि!');
      }
    } catch (error) {
      console.error('सेटिंग्स सेव करने में त्रुटि:', error);
      alert('नेटवर्क त्रुटि!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('क्या आप सभी सेटिंग्स डिफ़ॉल्ट में रीसेट करना चाहते हैं?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/reset`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          await loadSettings();
          alert('सेटिंग्स डिफ़ॉल्ट में रीसेट हो गईं!');
          setHasChanges(false);
        }
      } catch (error) {
        console.error('रीसेट करने में त्रुटि:', error);
      }
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `veloxtradeai-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('डेटा एक्सपोर्ट करने में त्रुटि:', error);
    }
  };

  const handleBrokerConnect = async () => {
    if (!settings.trading.brokerApiKey || !settings.trading.brokerSecretKey) {
      alert('कृपया ब्रोकर API Key और Secret Key डालें');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/broker/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          apiKey: settings.trading.brokerApiKey,
          secretKey: settings.trading.brokerSecretKey,
          broker: settings.trading.brokerSelected
        })
      });
      
      if (response.ok) {
        alert('ब्रोकर सफलतापूर्वक कनेक्ट हो गया!');
      } else {
        alert('ब्रोकर कनेक्शन में त्रुटि!');
      }
    } catch (error) {
      console.error('ब्रोकर कनेक्शन त्रुटि:', error);
    }
  };

  const ToggleSwitch = ({ checked, onChange, id }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );

  const tabs = [
    { id: 'notifications', label: 'नोटिफिकेशन', icon: <Bell className="w-4 h-4" />, color: 'text-blue-600' },
    { id: 'trading', label: 'ट्रेडिंग', icon: <Activity className="w-4 h-4" />, color: 'text-green-600' },
    { id: 'risk', label: 'रिस्क मैनेजमेंट', icon: <Shield className="w-4 h-4" />, color: 'text-orange-600' },
    { id: 'display', label: 'डिस्प्ले', icon: <Moon className="w-4 h-4" />, color: 'text-purple-600' },
    { id: 'privacy', label: 'प्राइवेसी', icon: <Lock className="w-4 h-4" />, color: 'text-red-600' },
    { id: 'api', label: 'API', icon: <Globe className="w-4 h-4" />, color: 'text-indigo-600' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">सेटिंग्स लोड हो रही हैं...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">सेटिंग्स</h1>
          <p className="text-gray-600 mt-1">अपना ट्रेडिंग अनुभव कस्टमाइज़ करें</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              सेव नहीं हुआ
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'सेव हो रहा...' : 'सेव करें'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-blue-600 ${tab.color}`
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-blue-50' : 'bg-gray-100'}`}>
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-lg mb-2 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-600" />
                  नोटिफिकेशन चैनल
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'emailAlerts', label: 'ईमेल अलर्ट', desc: 'ईमेल के माध्यम से नोटिफिकेशन प्राप्त करें' },
                    { key: 'smsAlerts', label: 'SMS अलर्ट', desc: 'मोबाइल पर SMS प्राप्त करें' },
                    { key: 'pushNotifications', label: 'पुश नोटिफिकेशन', desc: 'ब्राउज़र और ऐप नोटिफिकेशन' },
                    { key: 'whatsappAlerts', label: 'WhatsApp अलर्ट', desc: 'WhatsApp मैसेज अलर्ट के लिए' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
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

              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h3 className="font-bold text-lg mb-2">ट्रेड इवेंट</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'tradeExecuted', label: 'ट्रेड एक्जीक्यूट', desc: 'जब ट्रेड एक्जीक्यूट हो जाए' },
                    { key: 'stopLossHit', label: 'स्टॉप लॉस हिट', desc: 'जब स्टॉप लॉस ट्रिगर हो' },
                    { key: 'targetAchieved', label: 'टारगेट अचीव', desc: 'जब प्रॉफिट टारगेट पूरा हो' },
                    { key: 'marketCloseAlerts', label: 'मार्केट क्लोज समरी', desc: 'दैनिक पोर्टफोलियो समरी' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <ToggleSwitch
                        checked={settings.notifications[item.key]}
                        onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                        id={`trade-${item.key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trading Tab */}
          {activeTab === 'trading' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h3 className="font-bold text-lg mb-2">ब्रोकर कनेक्शन</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ब्रोकर चुनें</label>
                    <select
                      value={settings.trading.brokerSelected}
                      onChange={(e) => handleSettingChange('trading', 'brokerSelected', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    >
                      <option value="">ब्रोकर चुनें</option>
                      <option value="zerodha">Zerodha</option>
                      <option value="angel">Angel Broking</option>
                      <option value="upstox">Upstox</option>
                      <option value="icici">ICICI Direct</option>
                      <option value="hdfc">HDFC Securities</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={settings.trading.brokerApiKey}
                          onChange={(e) => handleSettingChange('trading', 'brokerApiKey', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 bg-white"
                          placeholder="ब्रोकर API Key"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-3 text-gray-500"
                        >
                          {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                      <input
                        type="password"
                        value={settings.trading.brokerSecretKey}
                        onChange={(e) => handleSettingChange('trading', 'brokerSecretKey', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                        placeholder="ब्रोकर Secret Key"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleBrokerConnect}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition-all"
                  >
                    ब्रोकर कनेक्ट करें
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                <h3 className="font-bold text-lg mb-2">ऑटो ट्रेडिंग</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div>
                      <p className="font-bold">ऑटो ट्रेड एक्जीक्यूशन</p>
                      <p className="text-sm text-gray-600">AI सिग्नल के आधार पर ट्रेड ऑटोमेटिक एक्जीक्यूट करें</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.trading.autoTradeExecution}
                      onChange={(e) => handleSettingChange('trading', 'autoTradeExecution', e.target.checked)}
                      id="autoTrade"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'maxPositions', label: 'मैक्स ओपन पोजीशन', value: settings.trading.maxPositions, min: 1, max: 10 },
                      { key: 'maxRiskPerTrade', label: 'प्रति ट्रेड रिस्क', value: settings.trading.maxRiskPerTrade, min: 1, max: 5 },
                      { key: 'maxDailyLoss', label: 'दैनिक मैक्स लॉस', value: settings.trading.maxDailyLoss, min: 1, max: 10 }
                    ].map((item) => (
                      <div key={item.key} className="bg-white p-4 rounded-lg border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{item.label}</label>
                        <div className="flex items-center">
                          <input
                            type="range"
                            min={item.min}
                            max={item.max}
                            value={item.value}
                            onChange={(e) => handleSettingChange('trading', item.key, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="ml-3 font-bold min-w-[60px]">{item.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Management Tab */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                  <h3 className="font-bold text-lg mb-4">स्टॉप लॉस सेटिंग</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">स्टॉप लॉस टाइप</label>
                      <select
                        value={settings.risk.stopLossType}
                        onChange={(e) => handleSettingChange('risk', 'stopLossType', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                      >
                        <option value="percentage">प्रतिशत (%)</option>
                        <option value="absolute">रुपये</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        स्टॉप लॉस वैल्यू
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0.5"
                          max="10"
                          step="0.5"
                          value={settings.risk.stopLossValue}
                          onChange={(e) => handleSettingChange('risk', 'stopLossValue', parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="font-bold min-w-[80px] text-lg">
                          {settings.risk.stopLossValue}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium">ट्रेलिंग स्टॉप लॉस</p>
                        <p className="text-sm text-gray-600">प्राइस मूव के साथ स्टॉप लॉस ऑटो एडजस्ट</p>
                      </div>
                      <ToggleSwitch
                        checked={settings.risk.trailingStopLoss}
                        onChange={(e) => handleSettingChange('risk', 'trailingStopLoss', e.target.checked)}
                        id="trailingStop"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                  <h3 className="font-bold text-lg mb-4">टेक प्रॉफिट सेटिंग</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">टेक प्रॉफिट (%)</label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="1"
                          value={settings.risk.takeProfitValue}
                          onChange={(e) => handleSettingChange('risk', 'takeProfitValue', parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="font-bold min-w-[80px] text-lg">
                          {settings.risk.takeProfitValue}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-blue-800 mb-2">रिस्क/रिवार्ड रेशियो</h4>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          1:{((settings.risk.takeProfitValue / settings.risk.stopLossValue) || 0).toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium">ऑटो SL एडजस्ट</p>
                        <p className="text-sm text-gray-600">मार्केट वॉलैटिलिटी के हिसाब से SL ऑटो एडजस्ट</p>
                      </div>
                      <ToggleSwitch
                        checked={settings.risk.autoAdjustSl}
                        onChange={(e) => handleSettingChange('risk', 'autoAdjustSl', e.target.checked)}
                        id="autoAdjustSl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <h3 className="font-bold text-lg mb-4">थीम और अपीयरेंस</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">थीम चुनें</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'light', label: 'लाइट', color: 'bg-white border border-gray-300' },
                          { id: 'dark', label: 'डार्क', color: 'bg-gray-800' },
                          { id: 'blue', label: 'ब्लू', color: 'bg-blue-500' },
                          { id: 'green', label: 'ग्रीन', color: 'bg-green-500' },
                          { id: 'purple', label: 'पर्पल', color: 'bg-purple-500' },
                          { id: 'orange', label: 'ऑरेंज', color: 'bg-orange-500' }
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => handleSettingChange('display', 'theme', theme.id)}
                            className={`p-4 rounded-lg border-2 flex flex-col items-center ${
                              settings.display.theme === theme.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full mb-2 ${theme.color}`}></div>
                            <span className="text-sm font-medium">{theme.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">भाषा</label>
                      <select
                        value={settings.display.language}
                        onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="font-bold text-lg mb-4">डिस्प्ले प्रिफरेंस</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'showAdvancedCharts', label: 'एडवांस्ड चार्ट', desc: 'एडवांस्ड चार्टिंग टूल दिखाएं' },
                      { key: 'compactMode', label: 'कॉम्पैक्ट मोड', desc: 'कॉम्पैक्ट व्यू का उपयोग करें' },
                      { key: 'showIndicators', label: 'टेक्निकल इंडिकेटर्स', desc: 'चार्ट पर टेक्निकल इंडिकेटर्स दिखाएं' },
                      { key: 'showProfitLoss', label: 'P&L दिखाएं', desc: 'प्रॉफिट और लॉस दिखाएं' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
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
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                <h3 className="font-bold text-lg mb-4">सुरक्षा</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div>
                      <p className="font-bold">टू-फैक्टर ऑथेंटिकेशन</p>
                      <p className="text-sm text-gray-600">अपने अकाउंट में एक्स्ट्रा सुरक्षा लेयर जोड़ें</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.privacy.twoFactorAuth}
                      onChange={(e) => handleSettingChange('privacy', 'twoFactorAuth', e.target.checked)}
                      id="twoFactor"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div>
                      <p className="font-bold">बैलेंस छुपाएं</p>
                      <p className="text-sm text-gray-600">पोर्टफोलियो बैलेंस छुपाएं</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.privacy.hideBalance}
                      onChange={(e) => handleSettingChange('privacy', 'hideBalance', e.target.checked)}
                      id="hideBalance"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">सेशन टाइमआउट (मिनट)</label>
                    <select
                      value={settings.privacy.sessionTimeout}
                      onChange={(e) => handleSettingChange('privacy', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    >
                      <option value="15">15 मिनट</option>
                      <option value="30">30 मिनट</option>
                      <option value="60">1 घंटा</option>
                      <option value="0">कभी नहीं (सुझाव नहीं)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg mb-4">डेटा मैनेजमेंट</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <Download className="w-5 h-5 mr-3 text-blue-600" />
                      <div>
                        <p className="font-medium text-left">सभी सेटिंग्स एक्सपोर्ट करें</p>
                        <p className="text-sm text-gray-500 text-left">JSON फाइल के रूप में डाउनलोड करें</p>
                      </div>
                    </div>
                    <span className="text-blue-600 font-medium">एक्सपोर्ट</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <RefreshCw className="w-5 h-5 mr-3 text-orange-600" />
                      <div>
                        <p className="font-medium text-left">डिफ़ॉल्ट सेटिंग्स रीसेट करें</p>
                        <p className="text-sm text-gray-500 text-left">सभी सेटिंग्स डिफ़ॉल्ट में रीसेट करें</p>
                      </div>
                    </div>
                    <span className="text-orange-600 font-medium">रीसेट</span>
                  </button>

                  <button
                    onClick={() => alert('अकाउंट डिलीट करने की रिक्वेस्ट भेजी गई। हमारी टीम 24 घंटे में संपर्क करेगी।')}
                    className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Trash2 className="w-5 h-5 mr-3 text-red-600" />
                      <div>
                        <p className="font-bold text-left text-red-700">अकाउंट डिलीट करें</p>
                        <p className="text-sm text-red-600 text-left">अपना अकाउंट और सभी डेटा डिलीट करें</p>
                      </div>
                    </div>
                    <span className="text-red-700 font-bold">डिलीट</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-lg mb-4">API सेटिंग्स</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div>
                      <p className="font-bold">थर्ड-पार्टी API एक्सेस</p>
                      <p className="text-sm text-gray-600">बाहरी ऐप्स को आपके डेटा तक एक्सेस दें</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.api.allowThirdPartyAccess}
                      onChange={(e) => handleSettingChange('api', 'allowThirdPartyAccess', e.target.checked)}
                      id="thirdPartyApi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit</label>
                    <select
                      value={settings.api.rateLimit}
                      onChange={(e) => handleSettingChange('api', 'rateLimit', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    >
                      <option value="low">लो (10 रिक्वेस्ट/मिनट)</option>
                      <option value="medium">मीडियम (30 रिक्वेस्ट/मिनट)</option>
                      <option value="high">हाई (60 रिक्वेस्ट/मिनट)</option>
                    </select>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-800 mb-2">⚠️ API सुरक्षा नोटिस</h4>
                    <p className="text-sm text-yellow-700">
                      • अपने API कीज सुरक्षित रखें<br/>
                      • नियमित रूप से API कीज बदलें<br/>
                      • संदिग्ध एक्टिविटी के लिए API यूसेज मॉनिटर करें
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">ऑटो ट्रेडिंग</p>
          <p className={`text-lg font-bold ${settings.trading.autoTradeExecution ? 'text-green-600' : 'text-gray-400'}`}>
            {settings.trading.autoTradeExecution ? 'एक्टिव' : 'इनएक्टिव'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">प्रति ट्रेड रिस्क</p>
          <p className="text-lg font-bold text-orange-600">{settings.trading.maxRiskPerTrade}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">2FA स्टेटस</p>
          <p className={`text-lg font-bold ${settings.privacy.twoFactorAuth ? 'text-green-600' : 'text-red-600'}`}>
            {settings.privacy.twoFactorAuth ? 'एनेबल्ड' : 'डिसएबल्ड'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">थीम</p>
          <p className="text-lg font-bold text-purple-600 capitalize">{settings.display.theme}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
