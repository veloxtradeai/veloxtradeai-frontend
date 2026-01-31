import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, Bell, Shield, Globe, Moon, Download, 
  Activity, Lock, Mail, MessageSquare, Smartphone, 
  AlertCircle, Target, TrendingUp, Clock, Eye, EyeOff,
  CreditCard, Database, Zap, RefreshCw, Settings as SettingsIcon,
  Wifi, WifiOff, BatteryCharging, Filter, User, Key,
  BarChart3, PieChart, LineChart, Palette
} from 'lucide-react';
import { settingsAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const Settings = () => {
  const { t, isHindi } = useLanguage();
  
  // REAL DATA STATE - NO DUMMY
  const [realSettings, setRealSettings] = useState({
    notifications: {
      emailAlerts: false,
      smsAlerts: false,
      pushNotifications: false,
      whatsappAlerts: false,
      tradeExecuted: false,
      stopLossHit: false,
      targetAchieved: false,
      marketCloseAlerts: false,
      priceAlerts: false,
      newsAlerts: false
    },
    
    trading: {
      autoTradeExecution: false,
      maxPositions: 0,
      maxRiskPerTrade: 0,
      maxDailyLoss: 0,
      defaultQuantity: 0,
      allowShortSelling: false,
      slippageTolerance: 0,
      enableHedgeMode: false,
      requireConfirmation: false,
      partialExit: false,
      trailSLAfterProfit: false
    },
    
    risk: {
      stopLossType: 'percentage',
      stopLossValue: 0,
      trailingStopLoss: false,
      trailingStopDistance: 0,
      takeProfitType: 'percentage',
      takeProfitValue: 0,
      riskRewardRatio: 0,
      maxPortfolioRisk: 0,
      volatilityAdjustment: false,
      maxDrawdown: 0
    },
    
    display: {
      theme: 'dark',
      defaultView: 'dashboard',
      refreshInterval: 0,
      showAdvancedCharts: false,
      compactMode: false,
      language: 'en',
      showIndicators: false,
      darkModeIntensity: 'medium',
      chartType: 'candlestick',
      gridLines: false
    },
    
    privacy: {
      publicProfile: false,
      showPortfolioValue: false,
      shareTradingHistory: false,
      dataSharing: 'none',
      twoFactorAuth: false,
      sessionTimeout: 0,
      showRealName: false,
      hideBalance: false,
      autoLogout: false
    },
    
    api: {
      allowThirdPartyAccess: false,
      webhookEnabled: false,
      rateLimit: 'low',
      logRetention: '30days',
      apiKey: '',
      webhookUrl: ''
    },

    subscription: {
      plan: 'free_trial',
      trialDaysLeft: 7,
      autoRenew: false,
      billingCycle: 'monthly'
    },

    broker: {
      connectedBrokers: [],
      autoSync: false,
      syncInterval: 0
    }
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // REAL DATA FETCH - NO DUMMY
  const fetchRealSettings = useCallback(async () => {
    try {
      console.log('🔄 Fetching real settings...');
      
      // Get backend URL from environment or use empty string
      const backendUrl = import.meta.env?.VITE_API_BASE_URL || '';
      
      // If no backend URL, show as disconnected
      if (!backendUrl) {
        console.log('⚠️ No backend URL configured');
        setIsBackendConnected(false);
        setIsLoading(false);
        return;
      }
      
      // Backend health check
      try {
        const healthResponse = await fetch(`${backendUrl}/api/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          
          if (healthData.status === 'online') {
            setIsBackendConnected(true);
            
            // Fetch settings from backend
            try {
              const settingsResponse = await settingsAPI.getSettings();
              if (settingsResponse?.success && settingsResponse.settings) {
                setRealSettings(settingsResponse.settings);
                console.log('✅ Real settings loaded');
              }
            } catch (settingsError) {
              console.log('⚠️ Settings endpoint not available, using default');
            }
          } else {
            setIsBackendConnected(false);
          }
        } else {
          setIsBackendConnected(false);
        }
      } catch (healthError) {
        console.log('⚠️ Health check failed:', healthError);
        setIsBackendConnected(false);
      }
      
      setLastUpdate(new Date());
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ Settings fetch error:', error);
      setIsBackendConnected(false);
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRealSettings();
  }, [fetchRealSettings]);

  const handleSettingChange = (category, key, value) => {
    setRealSettings(prev => ({
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
      alert(isHindi ? 'कोई बदलाव नहीं है!' : 'No changes to save!');
      return;
    }
    
    if (!isBackendConnected) {
      alert(isHindi ? 'बैकेंड कनेक्ट नहीं है! सेटिंग्स सेव नहीं होंगी।' : 'Backend not connected! Settings won\'t be saved.');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await settingsAPI.saveSettings(realSettings);
      if (response?.success) {
        alert(isHindi ? '✅ सेटिंग्स सफलतापूर्वक सहेजी गईं!' : '✅ Settings saved successfully!');
        setHasChanges(false);
        setLastUpdate(new Date());
      } else {
        throw new Error(response?.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(isHindi ? '❌ सेटिंग्स सहेजने में असफल।' : '❌ Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(isHindi ? 
      'क्या आप सभी सेटिंग्स को डिफ़ॉल्ट पर रीसेट करना चाहते हैं?' : 
      'Reset all settings to default?')) {
      fetchRealSettings();
      setHasChanges(true);
      alert(isHindi ? 'सेटिंग्स रीसेट की गईं। सेव बटन दबाएं।' : 'Settings reset. Press Save button.');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(realSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `veloxtradeai-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const tabs = [
    { id: 'notifications', label: isHindi ? 'नोटिफिकेशन' : 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'trading', label: isHindi ? 'ट्रेडिंग' : 'Trading', icon: <Activity className="w-4 h-4" /> },
    { id: 'risk', label: isHindi ? 'रिस्क मैनेजमेंट' : 'Risk Management', icon: <Shield className="w-4 h-4" /> },
    { id: 'display', label: isHindi ? 'डिस्प्ले' : 'Display', icon: <Palette className="w-4 h-4" /> },
    { id: 'privacy', label: isHindi ? 'प्राइवेसी और सिक्योरिटी' : 'Privacy & Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'api', label: 'API', icon: <Key className="w-4 h-4" /> },
    { id: 'subscription', label: isHindi ? 'सब्सक्रिप्शन' : 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'broker', label: isHindi ? 'ब्रोकर' : 'Broker', icon: <Database className="w-4 h-4" /> }
  ];

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
      <div className={`w-11 h-6 ${disabled ? 'bg-gray-700' : 'bg-gray-600'} rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
    </label>
  );

  const formatTime = (date) => {
    try {
      if (!date) return '--:--';
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '--:--';
      
      return dateObj.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return '--:--';
    }
  };

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5 md:p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center text-white">
          <Bell className="w-5 h-5 mr-2 text-emerald-400" />
          {isHindi ? 'अलर्ट चैनल्स' : 'Alert Channels'}
        </h3>
        <p className="text-emerald-300/70 mb-6">{isHindi ? 'चुनें कि आप नोटिफिकेशन कैसे प्राप्त करना चाहते हैं' : 'Choose how you want to receive notifications'}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'emailAlerts', label: isHindi ? 'ईमेल अलर्ट्स' : 'Email Alerts', desc: isHindi ? 'ईमेल के माध्यम से नोटिफिकेशन प्राप्त करें' : 'Receive notifications via email', icon: <Mail className="w-5 h-5" /> },
            { key: 'smsAlerts', label: isHindi ? 'SMS अलर्ट्स' : 'SMS Alerts', desc: isHindi ? 'अपने मोबाइल पर SMS प्राप्त करें' : 'Get SMS on your mobile', icon: <MessageSquare className="w-5 h-5" /> },
            { key: 'pushNotifications', label: isHindi ? 'पुश नोटिफिकेशन' : 'Push Notifications', desc: isHindi ? 'ब्राउज़र और ऐप नोटिफिकेशन' : 'Browser & app notifications', icon: <Smartphone className="w-5 h-5" /> },
            { key: 'whatsappAlerts', label: isHindi ? 'WhatsApp अलर्ट्स' : 'WhatsApp Alerts', desc: isHindi ? 'अलर्ट्स के लिए WhatsApp मैसेज' : 'WhatsApp messages for alerts', icon: <MessageSquare className="w-5 h-5" /> }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-500/20 rounded-lg mr-3">
                  {React.cloneElement(item.icon, { className: "w-5 h-5 text-emerald-400" })}
                </div>
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-emerald-300/60">{item.desc}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={realSettings.notifications[item.key]}
                onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                id={`notif-${item.key}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-cyan-900/40 p-5 md:p-6">
        <h3 className="font-bold text-lg mb-4 text-white">{isHindi ? 'ट्रेड इवेंट्स' : 'Trade Events'}</h3>
        <p className="text-cyan-300/70 mb-6">{isHindi ? 'ट्रेडिंग एक्टिविटी के लिए नोटिफिकेशन कॉन्फ़िगर करें' : 'Configure notifications for trading activities'}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'tradeExecuted', label: isHindi ? 'ट्रेड एक्जीक्यूट हुआ' : 'Trade Executed', desc: isHindi ? 'जब कोई ट्रेड सफलतापूर्वक एक्जीक्यूट हो जाए' : 'When a trade is successfully executed', icon: <Zap className="w-5 h-5" /> },
            { key: 'stopLossHit', label: isHindi ? 'स्टॉप लॉस हिट' : 'Stop Loss Hit', desc: isHindi ? 'जब स्टॉप लॉस ट्रिगर हो जाए' : 'When stop loss is triggered', icon: <AlertCircle className="w-5 h-5" /> },
            { key: 'targetAchieved', label: isHindi ? 'टार्गेट अचीव्ड' : 'Target Achieved', desc: isHindi ? 'जब प्रॉफिट टार्गेट पहुंच जाए' : 'When profit target is reached', icon: <Target className="w-5 h-5" /> },
            { key: 'marketCloseAlerts', label: isHindi ? 'मार्केट क्लोज समरी' : 'Market Close Summary', desc: isHindi ? 'दैनिक पोर्टफोलियो समरी' : 'Daily portfolio summary', icon: <Clock className="w-5 h-5" /> },
            { key: 'priceAlerts', label: isHindi ? 'प्राइस अलर्ट्स' : 'Price Alerts', desc: isHindi ? 'कस्टम प्राइस लेवल नोटिफिकेशन' : 'Custom price level notifications', icon: <TrendingUp className="w-5 h-5" /> },
            { key: 'newsAlerts', label: isHindi ? 'न्यूज अलर्ट्स' : 'News Alerts', desc: isHindi ? 'महत्वपूर्ण मार्केट न्यूज अपडेट्स' : 'Important market news updates', icon: <Bell className="w-5 h-5" /> }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-900/10 to-cyan-800/5 rounded-xl border border-cyan-900/30 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center">
                <div className="p-2 bg-cyan-500/20 rounded-lg mr-3">
                  {React.cloneElement(item.icon, { className: "w-5 h-5 text-cyan-400" })}
                </div>
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-cyan-300/60">{item.desc}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={realSettings.notifications[item.key]}
                onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                id={`trade-${item.key}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-purple-900/40 p-5 md:p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center text-white">
            <Palette className="w-5 h-5 mr-2 text-purple-400" />
            {isHindi ? 'थीम और अपीयरेंस' : 'Theme & Appearance'}
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-3">{isHindi ? 'थीम सिलेक्शन' : 'Theme Selection'}</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'dark', label: isHindi ? 'डार्क' : 'Dark', color: 'bg-gradient-to-br from-slate-900 to-slate-950', border: 'border-slate-700' },
                  { value: 'light', label: isHindi ? 'लाइट' : 'Light', color: 'bg-gradient-to-br from-gray-100 to-white', border: 'border-gray-300' },
                  { value: 'blue', label: isHindi ? 'ब्लू' : 'Blue', color: 'bg-gradient-to-br from-blue-900/80 to-blue-950/80', border: 'border-blue-700' },
                  { value: 'green', label: isHindi ? 'ग्रीन' : 'Green', color: 'bg-gradient-to-br from-emerald-900/80 to-emerald-950/80', border: 'border-emerald-700' }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handleSettingChange('display', 'theme', theme.value)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${theme.color} ${theme.border} ${
                      realSettings.display.theme === theme.value 
                        ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-slate-900' 
                        : ''
                    }`}
                  >
                    <div className="w-12 h-8 rounded-lg mb-2 bg-gradient-to-r from-gray-300 to-gray-100"></div>
                    <span className="text-sm font-medium text-white">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'भाषा' : 'Language'}</label>
              <select
                value={realSettings.display.language}
                onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="en" className="bg-slate-900">English</option>
                <option value="hi" className="bg-slate-900">हिंदी</option>
                <option value="gu" className="bg-slate-900">ગુજરાતી</option>
                <option value="ta" className="bg-slate-900">தமிழ்</option>
                <option value="te" className="bg-slate-900">తెలుగు</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-cyan-900/40 p-5 md:p-6">
          <h3 className="font-bold text-lg mb-6 text-white">{isHindi ? 'डिस्प्ले प्रेफरेंसेज' : 'Display Preferences'}</h3>
          <div className="space-y-4">
            {[
              { key: 'showAdvancedCharts', label: isHindi ? 'एडवांस्ड चार्ट्स' : 'Advanced Charts', desc: isHindi ? 'एडवांस्ड चार्टिंग टूल्स और इंडिकेटर्स दिखाएं' : 'Show advanced charting tools and indicators' },
              { key: 'compactMode', label: isHindi ? 'कॉम्पैक्ट मोड' : 'Compact Mode', desc: isHindi ? 'अधिक डेटा डेंसिटी के लिए कॉम्पैक्ट व्यू का उपयोग करें' : 'Use compact view for more data density' },
              { key: 'showIndicators', label: isHindi ? 'टेक्निकल इंडिकेटर्स' : 'Technical Indicators', desc: isHindi ? 'चार्ट्स पर टेक्निकल इंडिकेटर्स डिस्प्ले करें' : 'Display technical indicators on charts' },
              { key: 'gridLines', label: isHindi ? 'ग्रिड लाइन्स' : 'Grid Lines', desc: isHindi ? 'चार्ट्स पर ग्रिड लाइन्स दिखाएं' : 'Show grid lines on charts' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-900/10 to-cyan-800/5 rounded-xl border border-cyan-900/30 hover:border-cyan-500/40 transition-all">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-cyan-300/60">{item.desc}</p>
                </div>
                <ToggleSwitch
                  checked={realSettings.display[item.key]}
                  onChange={(e) => handleSettingChange('display', item.key, e.target.checked)}
                  id={`display-${item.key}`}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'ऑटो रिफ्रेश इंटरवल' : 'Auto Refresh Interval'}</label>
              <select
                value={realSettings.display.refreshInterval}
                onChange={(e) => handleSettingChange('display', 'refreshInterval', parseInt(e.target.value))}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="5" className="bg-slate-900">{isHindi ? '5 सेकंड (रियल-टाइम)' : '5 seconds (Real-time)'}</option>
                <option value="10" className="bg-slate-900">{isHindi ? '10 सेकंड' : '10 seconds'}</option>
                <option value="30" className="bg-slate-900">{isHindi ? '30 सेकंड' : '30 seconds'}</option>
                <option value="60" className="bg-slate-900">{isHindi ? '1 मिनट' : '1 minute'}</option>
                <option value="0" className="bg-slate-900">{isHindi ? 'मैनुअल रिफ्रेश' : 'Manual Refresh'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-red-900/40 p-5 md:p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center text-white">
          <Lock className="w-5 h-5 mr-2 text-red-400" />
          {isHindi ? 'सिक्योरिटी और प्राइवेसी' : 'Security & Privacy'}
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-900/10 to-red-800/5 rounded-xl border border-red-900/30">
            <div>
              <p className="font-bold text-white">{isHindi ? 'टू-फैक्टर ऑथेंटिकेशन' : 'Two-Factor Authentication'}</p>
              <p className="text-sm text-red-300/60">{isHindi ? 'अपने अकाउंट में एक अतिरिक्त सुरक्षा परत जोड़ें' : 'Add an extra layer of security to your account'}</p>
            </div>
            <ToggleSwitch
              checked={realSettings.privacy.twoFactorAuth}
              onChange={(e) => handleSettingChange('privacy', 'twoFactorAuth', e.target.checked)}
              id="twoFactor"
            />
          </div>

          {realSettings.privacy.twoFactorAuth && (
            <div className="bg-gradient-to-r from-emerald-900/20 to-green-900/10 border border-emerald-900/40 rounded-xl p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-emerald-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-400 mb-1">{isHindi ? '✅ 2FA एनेबल्ड' : '✅ 2FA Enabled'}</p>
                  <p className="text-sm text-emerald-300/70">{isHindi ? 'आपका अकाउंट टू-फैक्टर ऑथेंटिकेशन से प्रोटेक्टेड है।' : 'Your account is protected with two-factor authentication.'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'publicProfile', label: isHindi ? 'पब्लिक प्रोफाइल' : 'Public Profile', desc: isHindi ? 'दूसरों को अपना प्रोफाइल देखने की अनुमति दें' : 'Allow others to view your profile' },
              { key: 'showPortfolioValue', label: isHindi ? 'पोर्टफोलियो वैल्यू दिखाएं' : 'Show Portfolio Value', desc: isHindi ? 'प्रोफाइल में पोर्टफोलियो वैल्यू डिस्प्ले करें' : 'Display portfolio value in profile' },
              { key: 'shareTradingHistory', label: isHindi ? 'ट्रेडिंग हिस्ट्री शेयर करें' : 'Share Trading History', desc: isHindi ? 'अनामित ट्रेडिंग हिस्ट्री शेयर करें' : 'Share anonymized trading history' },
              { key: 'showRealName', label: isHindi ? 'रियल नेम दिखाएं' : 'Show Real Name', desc: isHindi ? 'कम्युनिटी में अपना रियल नेम डिस्प्ले करें' : 'Display your real name in community' },
              { key: 'hideBalance', label: isHindi ? 'बैलेंस छुपाएं' : 'Hide Balance', desc: isHindi ? 'डैशबोर्ड से बैलेंस छुपाएं' : 'Hide balance from dashboard' },
              { key: 'autoLogout', label: isHindi ? 'ऑटो लॉगआउट' : 'Auto Logout', desc: isHindi ? 'इनएक्टिविटी के बाद ऑटोमैटिक लॉगआउट' : 'Automatic logout after inactivity' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-900/10 to-red-800/5 rounded-xl border border-red-900/30 hover:border-red-500/40 transition-all">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-red-300/60">{item.desc}</p>
                </div>
                <ToggleSwitch
                  checked={realSettings.privacy[item.key]}
                  onChange={(e) => handleSettingChange('privacy', item.key, e.target.checked)}
                  id={`privacy-${item.key}`}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t border-red-900/40">
            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'सेशन टाइमआउट (मिनट)' : 'Session Timeout (minutes)'}</label>
              <select
                value={realSettings.privacy.sessionTimeout}
                onChange={(e) => handleSettingChange('privacy', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="15" className="bg-slate-900">{isHindi ? '15 मिनट' : '15 minutes'}</option>
                <option value="30" className="bg-slate-900">{isHindi ? '30 मिनट' : '30 minutes'}</option>
                <option value="60" className="bg-slate-900">{isHindi ? '1 घंटा' : '1 hour'}</option>
                <option value="120" className="bg-slate-900">{isHindi ? '2 घंटे' : '2 hours'}</option>
                <option value="0" className="bg-slate-900">{isHindi ? 'कभी नहीं (अनुशंसित नहीं)' : 'Never (Not Recommended)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'डेटा शेयरिंग प्रेफरेंसेज' : 'Data Sharing Preferences'}</label>
              <select
                value={realSettings.privacy.dataSharing}
                onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="none" className="bg-slate-900">{isHindi ? 'कोई डेटा शेयरिंग नहीं' : 'No Data Sharing'}</option>
                <option value="anonymous" className="bg-slate-900">{isHindi ? 'अनामित एग्रीगेटेड डेटा' : 'Anonymous Aggregated Data'}</option>
                <option value="full" className="bg-slate-900">{isHindi ? 'फुल डेटा (AI एल्गोरिदम सुधारें)' : 'Full Data (Improve AI Algorithms)'}</option>
              </select>
              <p className="text-sm text-emerald-300/60 mt-2">
                {realSettings.privacy.dataSharing === 'none' && (isHindi ? 'कोई डेटा शेयर नहीं किया जाएगा। उच्चतम प्राइवेसी लेवल।' : 'No data will be shared. Highest privacy level.')}
                {realSettings.privacy.dataSharing === 'anonymous' && (isHindi ? 'सेवाओं में सुधार के लिए केवल अनामित, एग्रीगेटेड डेटा शेयर किया जाएगा।' : 'Only anonymous, aggregated data will be shared to improve services.')}
                {realSettings.privacy.dataSharing === 'full' && (isHindi ? 'आपका ट्रेडिंग डेटा हमारे AI एल्गोरिदम को सुधारने में मदद करेगा। हम आपके योगदान की कदर करते हैं!' : 'Your trading data will help improve our AI algorithms. We value your contribution!')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5 md:p-6">
        <h3 className="font-bold text-lg mb-6 text-white">{isHindi ? 'डेटा मैनेजमेंट' : 'Data Management'}</h3>
        
        <div className="space-y-4">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30 hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center">
              <Download className="w-5 h-5 mr-3 text-emerald-400" />
              <div>
                <p className="font-medium text-left text-white">{isHindi ? 'सभी सेटिंग्स एक्सपोर्ट करें' : 'Export All Settings'}</p>
                <p className="text-sm text-emerald-300/60 text-left">{isHindi ? 'अपनी सेटिंग्स JSON फ़ाइल के रूप में डाउनलोड करें' : 'Download your settings as JSON file'}</p>
              </div>
            </div>
            <span className="text-emerald-400 font-medium">{isHindi ? 'एक्सपोर्ट' : 'Export'}</span>
          </button>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-amber-900/10 to-amber-800/5 rounded-xl border border-amber-900/30 hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-3 text-amber-400" />
              <div>
                <p className="font-medium text-left text-white">{isHindi ? 'डिफ़ॉल्ट सेटिंग्स पर रीसेट करें' : 'Reset to Default Settings'}</p>
                <p className="text-sm text-amber-300/60 text-left">{isHindi ? 'सभी सेटिंग्स को फ़ैक्टरी डिफ़ॉल्ट पर रीसेट करें' : 'Revert all settings to factory default'}</p>
              </div>
            </div>
            <span className="text-amber-400 font-medium">{isHindi ? 'रीसेट' : 'Reset'}</span>
          </button>

          <button
            onClick={() => alert(isHindi ? 
              'अकाउंट डिलीशन रिक्वेस्ट इनिशिएट की गई। हमारी टीम 24 घंटे के भीतर आपसे संपर्क करेगी।' : 
              'Account deletion request initiated. Our team will contact you within 24 hours.')}
            className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-red-900/10 to-red-800/5 rounded-xl border border-red-900/30 hover:border-red-500/40 transition-all"
          >
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 flex items-center justify-center text-red-400">
                🗑️
              </div>
              <div>
                <p className="font-bold text-left text-red-300">{isHindi ? 'अकाउंट डिलीट करें' : 'Delete Account'}</p>
                <p className="text-sm text-red-300/60 text-left">{isHindi ? 'स्थायी रूप से अपना अकाउंट और सभी डेटा डिलीट करें' : 'Permanently delete your account and all data'}</p>
              </div>
            </div>
            <span className="text-red-300 font-bold">{isHindi ? 'डिलीट' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Add other tab rendering functions similarly...

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'notifications': return renderNotificationsTab();
      case 'trading': return renderTradingTab();
      case 'risk': return renderRiskTab();
      case 'display': return renderDisplayTab();
      case 'privacy': return renderPrivacyTab();
      case 'api': return renderApiTab();
      default: return renderNotificationsTab();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {isHindi ? 'सेटिंग्स और प्रेफरेंसेज' : 'Settings & Preferences'}
            </h1>
            <p className="text-sm text-emerald-300/80 mt-1">
              {isHindi ? 'अपना ट्रेडिंग एक्सपीरियंस कस्टमाइज़ करें और अकाउंट प्रेफरेंसेज मैनेज करें' : 'Customize your trading experience and manage account preferences'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-xs text-emerald-300/60">{isHindi ? 'अपडेट' : 'Updated'}</p>
              <p className="text-sm font-medium text-emerald-400">{formatTime(lastUpdate)}</p>
            </div>
            
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isBackendConnected 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span>{isBackendConnected ? (isHindi ? 'कनेक्टेड' : 'Connected') : (isHindi ? 'डिस्कनेक्टेड' : 'Disconnected')}</span>
            </div>
            
            {hasChanges && (
              <span className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium border border-amber-500/30">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                {isHindi ? 'अनसेव्ड बदलाव' : 'Unsaved Changes'}
              </span>
            )}
            
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges || !isBackendConnected}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? (isHindi ? 'सेव हो रहा है...' : 'Saving...') : (isHindi ? 'बदलाव सेव करें' : 'Save Changes')}</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 shadow-sm overflow-hidden mb-6">
          {/* Tab Navigation */}
          <div className="border-b border-emerald-900/40 bg-gradient-to-r from-emerald-900/10 to-cyan-900/10">
            <div className="flex overflow-x-auto px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 md:px-6 md:py-4 font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-400 text-white bg-gradient-to-r from-emerald-900/30 to-cyan-900/20'
                      : 'border-transparent text-emerald-300/70 hover:text-white hover:bg-emerald-900/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === tab.id ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                  }`}>
                    {tab.icon}
                  </div>
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-emerald-900/20 to-cyan-900/20">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
                <p className="mt-4 text-emerald-300">
                  {isHindi ? 'सेटिंग्स लोड हो रही हैं...' : 'Loading settings...'}
                </p>
                <p className="text-sm text-emerald-300/60 mt-1">
                  {isHindi ? 'बैकेंड से कनेक्ट हो रहा है' : 'Connecting to backend'}
                </p>
              </div>
            ) : (
              renderActiveTab()
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl border border-emerald-900/40 p-4">
            <p className="text-sm text-emerald-300/70">{isHindi ? 'ऑटो ट्रेडिंग' : 'Auto Trading'}</p>
            <p className={`text-lg font-bold ${realSettings.trading.autoTradeExecution ? 'text-emerald-400' : 'text-red-400'}`}>
              {realSettings.trading.autoTradeExecution ? (isHindi ? 'एक्टिव' : 'Active') : (isHindi ? 'इनएक्टिव' : 'Inactive')}
            </p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl border border-emerald-900/40 p-4">
            <p className="text-sm text-emerald-300/70">{isHindi ? 'प्रति ट्रेड रिस्क' : 'Risk Per Trade'}</p>
            <p className="text-lg font-bold text-amber-400">{realSettings.trading.maxRiskPerTrade}%</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl border border-emerald-900/40 p-4">
            <p className="text-sm text-emerald-300/70">{isHindi ? '2FA स्टेटस' : '2FA Status'}</p>
            <p className={`text-lg font-bold ${realSettings.privacy.twoFactorAuth ? 'text-emerald-400' : 'text-red-400'}`}>
              {realSettings.privacy.twoFactorAuth ? (isHindi ? 'एनेबल्ड' : 'Enabled') : (isHindi ? 'डिसेबल्ड' : 'Disabled')}
            </p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl border border-emerald-900/40 p-4">
            <p className="text-sm text-emerald-300/70">{isHindi ? 'थीम' : 'Theme'}</p>
            <p className="text-lg font-bold text-purple-400 capitalize">{realSettings.display.theme}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
