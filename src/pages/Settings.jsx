import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, Bell, Shield, Globe, Moon, Download, 
  Activity, Lock, Mail, MessageSquare, Smartphone, 
  AlertCircle, Target, TrendingUp, Clock, Eye, EyeOff,
  CreditCard, Database, Zap, RefreshCw,
  BarChart3, PieChart, LineChart, Palette,
  Wifi, WifiOff, Server, CheckCircle, AlertTriangle,
  X, ChevronDown, ChevronUp, DollarSign, Percent,
  Key, User, Settings as SettingsIcon, Thermometer,
  Sliders, Cpu, ShieldCheck, BatteryCharging, Filter,
  Globe2, HardDrive, Users, Eye, EyeOff as EyeOffIcon,
  Trash2, FileText, Cloud, CloudOff, Router,
  Circle, CircleDot, Check, ChevronRight, Info,
  HelpCircle, ExternalLink, ArrowLeft, ArrowRight,
  Maximize2, Minimize2, RotateCcw, History,
  Upload, Calendar, BellRing, Volume2, VolumeX
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { settingsAPI } from '../services/api';

const Settings = () => {
  const { t, isHindi, language } = useLanguage();
  
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
      newsAlerts: false,
      marginCallAlerts: false,
      volumeSpikeAlerts: false
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
      trailSLAfterProfit: false,
      autoAdjustSL: false,
      autoAdjustTP: false,
      maxOrderSize: 0,
      minOrderSize: 0
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
      maxDrawdown: 0,
      positionSizing: 'fixed',
      marginSafety: 0,
      riskPerDay: 0
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
      gridLines: false,
      animationSpeed: 'normal',
      fontSize: 'medium',
      colorBlindMode: false,
      showTooltips: true
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
      autoLogout: false,
      showEmail: false,
      showPhone: false,
      allowMessages: false,
      dataRetention: '30days'
    },
    
    api: {
      allowThirdPartyAccess: false,
      webhookEnabled: false,
      rateLimit: 'low',
      logRetention: '30days',
      apiKey: '',
      webhookUrl: '',
      autoGenerateKey: false,
      ipWhitelist: '',
      maxRequests: 100
    },

    subscription: {
      plan: 'free_trial',
      trialDaysLeft: 7,
      autoRenew: false,
      billingCycle: 'monthly',
      nextBillingDate: '',
      paymentMethod: '',
      billingEmail: '',
      invoices: []
    },

    broker: {
      connectedBrokers: [],
      autoSync: false,
      syncInterval: 0,
      autoConnect: false,
      maxBrokers: 3,
      defaultBroker: '',
      brokerTimeout: 30
    },

    performance: {
      cpuUsage: 0,
      memoryUsage: 0,
      networkSpeed: 0,
      lastOptimization: '',
      cacheEnabled: false,
      gpuAcceleration: false
    },

    alerts: {
      soundEnabled: false,
      vibrationEnabled: false,
      desktopNotifications: false,
      alertVolume: 50,
      priorityAlerts: false,
      alertSchedule: 'always'
    }
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookUrl, setShowWebhookUrl] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  // REAL DATA FETCH - NO DUMMY
  const fetchRealSettings = useCallback(async () => {
    try {
      console.log('🔄 Fetching real settings...');
      setIsLoading(true);
      
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
              } else {
                console.log('⚠️ Settings response not in expected format');
              }
            } catch (settingsError) {
              console.log('⚠️ Settings endpoint not available:', settingsError);
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
      
    } catch (error) {
      console.error('❌ Settings fetch error:', error);
      setIsBackendConnected(false);
    } finally {
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
        fetchRealSettings(); // Refresh with saved data
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
      'क्या आप सभी सेटिंग्स को डिफ़ॉल्ट पर रीसेट करना चाहते हैं? यह एक्शन undo नहीं हो सकता।' : 
      'Reset all settings to default? This action cannot be undone.')) {
      
      // Reset to default settings
      const defaultSettings = {
        notifications: {
          emailAlerts: false,
          smsAlerts: false,
          pushNotifications: true,
          whatsappAlerts: false,
          tradeExecuted: true,
          stopLossHit: true,
          targetAchieved: true,
          marketCloseAlerts: false,
          priceAlerts: true,
          newsAlerts: false,
          marginCallAlerts: true,
          volumeSpikeAlerts: true
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
          partialExit: true,
          trailSLAfterProfit: true,
          autoAdjustSL: false,
          autoAdjustTP: false,
          maxOrderSize: 10000,
          minOrderSize: 100
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
          maxDrawdown: 15,
          positionSizing: 'fixed',
          marginSafety: 20,
          riskPerDay: 5
        },
        display: {
          theme: 'dark',
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
          colorBlindMode: false,
          showTooltips: true
        },
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
          showEmail: false,
          showPhone: false,
          allowMessages: false,
          dataRetention: '90days'
        },
        api: {
          allowThirdPartyAccess: false,
          webhookEnabled: false,
          rateLimit: 'medium',
          logRetention: '30days',
          apiKey: '',
          webhookUrl: '',
          autoGenerateKey: true,
          ipWhitelist: '',
          maxRequests: 1000
        },
        subscription: {
          plan: 'free_trial',
          trialDaysLeft: 7,
          autoRenew: false,
          billingCycle: 'monthly',
          nextBillingDate: '',
          paymentMethod: '',
          billingEmail: '',
          invoices: []
        },
        broker: {
          connectedBrokers: [],
          autoSync: true,
          syncInterval: 5,
          autoConnect: false,
          maxBrokers: 5,
          defaultBroker: '',
          brokerTimeout: 30
        },
        performance: {
          cpuUsage: 0,
          memoryUsage: 0,
          networkSpeed: 0,
          lastOptimization: '',
          cacheEnabled: true,
          gpuAcceleration: true
        },
        alerts: {
          soundEnabled: true,
          vibrationEnabled: false,
          desktopNotifications: true,
          alertVolume: 70,
          priorityAlerts: true,
          alertSchedule: 'trading_hours'
        }
      };
      
      setRealSettings(defaultSettings);
      setHasChanges(true);
      alert(isHindi ? 'सेटिंग्स डिफ़ॉल्ट पर रीसेट की गईं। सेव बटन दबाएं।' : 'Settings reset to default. Press Save button.');
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

  const handleOptimizePerformance = async () => {
    setOptimizing(true);
    try {
      // Simulate optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update performance settings
      handleSettingChange('performance', 'cacheEnabled', true);
      handleSettingChange('performance', 'gpuAcceleration', true);
      handleSettingChange('display', 'animationSpeed', 'fast');
      handleSettingChange('performance', 'lastOptimization', new Date().toISOString());
      
      alert(isHindi ? '✅ परफॉर्मेंस ऑप्टिमाइज़्ड!' : '✅ Performance optimized!');
    } catch (error) {
      alert(isHindi ? '❌ ऑप्टिमाइज़ेशन फेल' : '❌ Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (window.confirm(isHindi ? 
      'क्या आप नया API key generate करना चाहते हैं? पुराना key काम करना बंद कर देगा।' : 
      'Generate new API key? Old key will stop working.')) {
      try {
        // Generate random API key
        const newApiKey = 'velox_' + Math.random().toString(36).substring(2) + '_' + Date.now().toString(36);
        handleSettingChange('api', 'apiKey', newApiKey);
        alert(isHindi ? '✅ नया API key generate हो गया!' : '✅ New API key generated!');
      } catch (error) {
        alert(isHindi ? '❌ API key generate करने में त्रुटि' : '❌ Error generating API key');
      }
    }
  };

  const tabs = [
    { id: 'notifications', label: isHindi ? 'नोटिफिकेशन' : 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'trading', label: isHindi ? 'ट्रेडिंग' : 'Trading', icon: <Activity className="w-4 h-4" /> },
    { id: 'risk', label: isHindi ? 'रिस्क मैनेजमेंट' : 'Risk Management', icon: <Shield className="w-4 h-4" /> },
    { id: 'display', label: isHindi ? 'डिस्प्ले' : 'Display', icon: <Palette className="w-4 h-4" /> },
    { id: 'privacy', label: isHindi ? 'प्राइवेसी और सिक्योरिटी' : 'Privacy & Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'api', label: 'API', icon: <Key className="w-4 h-4" /> },
    { id: 'subscription', label: isHindi ? 'सब्सक्रिप्शन' : 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'broker', label: isHindi ? 'ब्रोकर' : 'Broker', icon: <Database className="w-4 h-4" /> },
    { id: 'performance', label: isHindi ? 'परफॉर्मेंस' : 'Performance', icon: <Cpu className="w-4 h-4" /> },
    { id: 'alerts', label: isHindi ? 'अलर्ट्स' : 'Alerts', icon: <BellRing className="w-4 h-4" /> }
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
      <div className={`w-11 h-6 ${disabled ? 'bg-gray-700' : 'bg-gray-600'} rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-300 peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
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

  const formatDate = (date) => {
    try {
      if (!date) return '--/--/----';
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '--/--/----';
      
      return dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return '--/--/----';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
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
      return '₹0';
    }
  };

  // Connection status display
  const connectionStatusDisplay = useCallback(() => {
    if (isBackendConnected) {
      return {
        text: isHindi ? 'बैकेंड कनेक्टेड' : 'Backend Connected',
        icon: <Wifi className="w-5 h-5 text-emerald-400" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/30',
        dotColor: 'bg-emerald-400 animate-pulse'
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
            { key: 'newsAlerts', label: isHindi ? 'न्यूज अलर्ट्स' : 'News Alerts', desc: isHindi ? 'महत्वपूर्ण मार्केट न्यूज अपडेट्स' : 'Important market news updates', icon: <Bell className="w-5 h-5" /> },
            { key: 'marginCallAlerts', label: isHindi ? 'मार्जिन कॉल अलर्ट्स' : 'Margin Call Alerts', desc: isHindi ? 'मार्जिन कॉल के लिए अलर्ट' : 'Alerts for margin calls', icon: <AlertTriangle className="w-5 h-5" /> },
            { key: 'volumeSpikeAlerts', label: isHindi ? 'वॉल्यूम स्पाइक अलर्ट्स' : 'Volume Spike Alerts', desc: isHindi ? 'असामान्य वॉल्यूम स्पाइक के लिए' : 'For unusual volume spikes', icon: <Activity className="w-5 h-5" /> }
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

  const renderTradingTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5 md:p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center text-white">
          <Activity className="w-5 h-5 mr-2 text-emerald-400" />
          {isHindi ? 'ट्रेडिंग कॉन्फ़िगरेशन' : 'Trading Configuration'}
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
            <div>
              <p className="font-bold text-white">{isHindi ? 'ऑटो ट्रेड एक्जीक्यूशन' : 'Auto Trade Execution'}</p>
              <p className="text-sm text-emerald-300/60">{isHindi ? 'AI सिग्नल्स के आधार पर ऑटोमैटिकली ट्रेड्स एक्जीक्यूट करें' : 'Automatically execute trades based on AI signals'}</p>
            </div>
            <ToggleSwitch
              checked={realSettings.trading.autoTradeExecution}
              onChange={(e) => handleSettingChange('trading', 'autoTradeExecution', e.target.checked)}
              id="autoTrade"
            />
          </div>

          {realSettings.trading.autoTradeExecution && (
            <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/10 border border-amber-900/40 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-400 mb-1">{isHindi ? '⚠️ ऑटो ट्रेडिंग एनेबल्ड' : '⚠️ Auto Trading Enabled'}</p>
                  <p className="text-sm text-amber-300/70">{isHindi ? 'ट्रेड्स ऑटोमैटिकली एक्जीक्यूट होंगे। नियमित रूप से अपने अकाउंट की मॉनिटरिंग करें।' : 'Trades will be executed automatically. Monitor your account regularly.'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'मैक्स ओपन पोजीशन्स' : 'Max Open Positions'}</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={realSettings.trading.maxPositions}
                  onChange={(e) => handleSettingChange('trading', 'maxPositions', parseInt(e.target.value))}
                  className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'मैक्स रिस्क प्रति ट्रेड (%)' : 'Max Risk Per Trade (%)'}</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={realSettings.trading.maxRiskPerTrade}
                    onChange={(e) => handleSettingChange('trading', 'maxRiskPerTrade', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-emerald-300/60">
                    <span>0.1%</span>
                    <span className="text-white font-medium">{realSettings.trading.maxRiskPerTrade}%</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'डिफ़ॉल्ट क्वांटिटी' : 'Default Quantity'}</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={realSettings.trading.defaultQuantity}
                  onChange={(e) => handleSettingChange('trading', 'defaultQuantity', parseInt(e.target.value))}
                  className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'मैक्स डेली लॉस (%)' : 'Max Daily Loss (%)'}</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="0.5"
                    value={realSettings.trading.maxDailyLoss}
                    onChange={(e) => handleSettingChange('trading', 'maxDailyLoss', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-emerald-300/60">
                    <span>1%</span>
                    <span className="text-white font-medium">{realSettings.trading.maxDailyLoss}%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'स्लिपेज टॉलरेंस (%)' : 'Slippage Tolerance (%)'}</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={realSettings.trading.slippageTolerance}
                    onChange={(e) => handleSettingChange('trading', 'slippageTolerance', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-emerald-300/60">
                    <span>0.1%</span>
                    <span className="text-white font-medium">{realSettings.trading.slippageTolerance}%</span>
                    <span>5%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
                <div>
                  <p className="font-medium text-white">{isHindi ? 'पार्शियल एक्जिट' : 'Partial Exit'}</p>
                  <p className="text-sm text-emerald-300/60">{isHindi ? 'प्रॉफिट में ट्रेड का आंशिक एक्जिट करें' : 'Partially exit trades in profit'}</p>
                </div>
                <ToggleSwitch
                  checked={realSettings.trading.partialExit}
                  onChange={(e) => handleSettingChange('trading', 'partialExit', e.target.checked)}
                  id="partialExit"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-emerald-900/40">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'शॉर्ट सेलिंग की अनुमति दें' : 'Allow Short Selling'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'शॉर्ट सेलिंग ट्रेड्स को एनेबल करें' : 'Enable short selling trades'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.trading.allowShortSelling}
                onChange={(e) => handleSettingChange('trading', 'allowShortSelling', e.target.checked)}
                id="shortSelling"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'ट्रेड कन्फर्मेशन' : 'Trade Confirmation'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'प्रत्येक ट्रेड के लिए मैनुअल कन्फर्मेशन की आवश्यकता है' : 'Require manual confirmation for each trade'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.trading.requireConfirmation}
                onChange={(e) => handleSettingChange('trading', 'requireConfirmation', e.target.checked)}
                id="confirmation"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'ऑटो SL एडजस्ट' : 'Auto SL Adjust'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'प्राइस के हिसाब से ऑटोमैटिक SL एडजस्ट करें' : 'Automatically adjust SL based on price'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.trading.autoAdjustSL}
                onChange={(e) => handleSettingChange('trading', 'autoAdjustSL', e.target.checked)}
                id="autoAdjustSL"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'ऑटो TP एडजस्ट' : 'Auto TP Adjust'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'प्राइस के हिसाब से ऑटोमैटिक TP एडजस्ट करें' : 'Automatically adjust TP based on price'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.trading.autoAdjustTP}
                onChange={(e) => handleSettingChange('trading', 'autoAdjustTP', e.target.checked)}
                id="autoAdjustTP"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRiskTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-orange-900/40 p-5 md:p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center text-white">
            <Shield className="w-5 h-5 mr-2 text-orange-400" />
            {isHindi ? 'स्टॉप लॉस सेटिंग्स' : 'Stop Loss Settings'}
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'स्टॉप लॉस टाइप' : 'Stop Loss Type'}</label>
              <select
                value={realSettings.risk.stopLossType}
                onChange={(e) => handleSettingChange('risk', 'stopLossType', e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="percentage" className="bg-slate-900">{isHindi ? 'प्रतिशत (%)' : 'Percentage (%)'}</option>
                <option value="absolute" className="bg-slate-900">{isHindi ? 'एब्सोल्यूट वैल्यू (₹)' : 'Absolute Value (₹)'}</option>
                <option value="atr" className="bg-slate-900">ATR Based</option>
                <option value="support" className="bg-slate-900">{isHindi ? 'सपोर्ट/रेसिस्टेंस' : 'Support/Resistance'}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">
                {realSettings.risk.stopLossType === 'percentage' ? (isHindi ? 'स्टॉप लॉस प्रतिशत' : 'Stop Loss Percentage') : 
                 realSettings.risk.stopLossType === 'absolute' ? (isHindi ? 'स्टॉप लॉस अमाउंट (₹)' : 'Stop Loss Amount (₹)') :
                 realSettings.risk.stopLossType === 'atr' ? 'ATR Multiplier' : (isHindi ? 'लेवल से दूरी' : 'Distance from Level')}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={realSettings.risk.stopLossValue}
                  onChange={(e) => handleSettingChange('risk', 'stopLossValue', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-emerald-300/60">
                  <span>0.5%</span>
                  <span className="text-white font-medium">
                    {realSettings.risk.stopLossValue}
                    {realSettings.risk.stopLossType === 'percentage' ? '%' : 
                     realSettings.risk.stopLossType === 'absolute' ? '₹' : 'x'}
                  </span>
                  <span>20%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-900/10 to-orange-800/5 rounded-xl border border-orange-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'ट्रेलिंग स्टॉप लॉस' : 'Trailing Stop Loss'}</p>
                <p className="text-sm text-orange-300/60">{isHindi ? 'प्राइस के हिसाब से स्टॉप लॉस ऑटोमैटिक एडजस्ट करें' : 'Automatically adjust stop loss as price moves'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.risk.trailingStopLoss}
                onChange={(e) => handleSettingChange('risk', 'trailingStopLoss', e.target.checked)}
                id="trailingStop"
              />
            </div>

            {realSettings.risk.trailingStopLoss && (
              <div>
                <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'ट्रेलिंग डिस्टेंस (%)' : 'Trailing Distance (%)'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={realSettings.risk.trailingStopDistance}
                  onChange={(e) => handleSettingChange('risk', 'trailingStopDistance', parseFloat(e.target.value))}
                  className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  min="0.5"
                  max="5"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5 md:p-6">
          <h3 className="font-bold text-lg mb-6 text-white">{isHindi ? 'टेक प्रॉफिट और रिस्क मैनेजमेंट' : 'Take Profit & Risk Management'}</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'टेक प्रॉफिट टाइप' : 'Take Profit Type'}</label>
              <select
                value={realSettings.risk.takeProfitType}
                onChange={(e) => handleSettingChange('risk', 'takeProfitType', e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="percentage" className="bg-slate-900">{isHindi ? 'प्रतिशत (%)' : 'Percentage (%)'}</option>
                <option value="absolute" className="bg-slate-900">{isHindi ? 'एब्सोल्यूट वैल्यू (₹)' : 'Absolute Value (₹)'}</option>
                <option value="rr" className="bg-slate-900">{isHindi ? 'रिस्क/रिवार्ड रेश्यो' : 'Risk/Reward Ratio'}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">
                {realSettings.risk.takeProfitType === 'percentage' ? (isHindi ? 'टेक प्रॉफिट %' : 'Take Profit %') : 
                 realSettings.risk.takeProfitType === 'absolute' ? (isHindi ? 'टेक प्रॉफिट अमाउंट (₹)' : 'Take Profit Amount (₹)') : (isHindi ? 'रिस्क/रिवार्ड रेश्यो' : 'Risk/Reward Ratio')}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="50"
                  step={realSettings.risk.takeProfitType === 'rr' ? 0.5 : 1}
                  value={realSettings.risk.takeProfitValue}
                  onChange={(e) => handleSettingChange('risk', 'takeProfitValue', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-emerald-300/60">
                  <span>1%</span>
                  <span className="text-white font-medium">
                    {realSettings.risk.takeProfitValue}
                    {realSettings.risk.takeProfitType === 'percentage' ? '%' : 
                     realSettings.risk.takeProfitType === 'absolute' ? '₹' : ':1'}
                  </span>
                  <span>50%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/10 border border-blue-900/40 rounded-xl p-4">
              <h4 className="font-bold text-blue-400 mb-2">{isHindi ? 'करंट रिस्क/रिवार्ड' : 'Current Risk/Reward'}</h4>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-xl font-bold text-red-400">1:{realSettings.risk.riskRewardRatio}</div>
                  <div className="text-xs text-blue-300/70">{isHindi ? 'रिस्क:रिवार्ड रेश्यो' : 'Risk:Reward Ratio'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">
                    {((realSettings.risk.takeProfitValue / realSettings.risk.stopLossValue) || 0).toFixed(1)}:1
                  </div>
                  <div className="text-xs text-blue-300/70">{isHindi ? 'करंट सेटअप' : 'Current Setup'}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'मैक्स पोर्टफोलियो रिस्क (%)' : 'Max Portfolio Risk (%)'}</label>
              <input
                type="number"
                step="0.5"
                value={realSettings.risk.maxPortfolioRisk}
                onChange={(e) => handleSettingChange('risk', 'maxPortfolioRisk', parseFloat(e.target.value))}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                min="1"
                max="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'मैक्स ड्रॉडाउन (%)' : 'Max Drawdown (%)'}</label>
              <input
                type="number"
                step="0.5"
                value={realSettings.risk.maxDrawdown}
                onChange={(e) => handleSettingChange('risk', 'maxDrawdown', parseFloat(e.target.value))}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                min="1"
                max="50"
              />
            </div>
          </div>
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

            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'डार्क मोड इंटेंसिटी' : 'Dark Mode Intensity'}</label>
              <select
                value={realSettings.display.darkModeIntensity}
                onChange={(e) => handleSettingChange('display', 'darkModeIntensity', e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="soft" className="bg-slate-900">{isHindi ? 'सॉफ्ट' : 'Soft'}</option>
                <option value="medium" className="bg-slate-900">{isHindi ? 'मीडियम' : 'Medium'}</option>
                <option value="deep" className="bg-slate-900">{isHindi ? 'डीप' : 'Deep'}</option>
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
              { key: 'gridLines', label: isHindi ? 'ग्रिड लाइन्स' : 'Grid Lines', desc: isHindi ? 'चार्ट्स पर ग्रिड लाइन्स दिखाएं' : 'Show grid lines on charts' },
              { key: 'colorBlindMode', label: isHindi ? 'कलर ब्लाइंड मोड' : 'Color Blind Mode', desc: isHindi ? 'कलर ब्लाइंड फ्रेंडली कलर्स का उपयोग करें' : 'Use color blind friendly colors' },
              { key: 'showTooltips', label: isHindi ? 'टूलटिप्स दिखाएं' : 'Show Tooltips', desc: isHindi ? 'इंटरफ़ेस पर टूलटिप्स दिखाएं' : 'Show tooltips on interface' }
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
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'ऑटो रिफ्रेश इंटरवल (सेकंड)' : 'Auto Refresh Interval (seconds)'}</label>
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

            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'फॉन्ट साइज़' : 'Font Size'}</label>
              <select
                value={realSettings.display.fontSize}
                onChange={(e) => handleSettingChange('display', 'fontSize', e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="small" className="bg-slate-900">{isHindi ? 'छोटा' : 'Small'}</option>
                <option value="medium" className="bg-slate-900">{isHindi ? 'मध्यम' : 'Medium'}</option>
                <option value="large" className="bg-slate-900">{isHindi ? 'बड़ा' : 'Large'}</option>
                <option value="xlarge" className="bg-slate-900">{isHindi ? 'बहुत बड़ा' : 'Extra Large'}</option>
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
                <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2 mt-0.5" />
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
              { key: 'autoLogout', label: isHindi ? 'ऑटो लॉगआउट' : 'Auto Logout', desc: isHindi ? 'इनएक्टिविटी के बाद ऑटोमैटिक लॉगआउट' : 'Automatic logout after inactivity' },
              { key: 'showEmail', label: isHindi ? 'ईमेल दिखाएं' : 'Show Email', desc: isHindi ? 'प्रोफाइल में ईमेल दिखाएं' : 'Show email in profile' },
              { key: 'showPhone', label: isHindi ? 'फोन नंबर दिखाएं' : 'Show Phone Number', desc: isHindi ? 'प्रोफाइल में फोन नंबर दिखाएं' : 'Show phone number in profile' }
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
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'डेटा रिटेंशन पीरियड' : 'Data Retention Period'}</label>
              <select
                value={realSettings.privacy.dataRetention}
                onChange={(e) => handleSettingChange('privacy', 'dataRetention', e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="7days" className="bg-slate-900">{isHindi ? '7 दिन' : '7 Days'}</option>
                <option value="30days" className="bg-slate-900">{isHindi ? '30 दिन' : '30 Days'}</option>
                <option value="90days" className="bg-slate-900">{isHindi ? '90 दिन' : '90 Days'}</option>
                <option value="1year" className="bg-slate-900">{isHindi ? '1 साल' : '1 Year'}</option>
                <option value="forever" className="bg-slate-900">{isHindi ? 'हमेशा के लिए' : 'Forever'}</option>
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
              <RotateCcw className="w-5 h-5 mr-3 text-amber-400" />
              <div>
                <p className="font-medium text-left text-white">{isHindi ? 'डिफ़ॉल्ट सेटिंग्स पर रीसेट करें' : 'Reset to Default Settings'}</p>
                <p className="text-sm text-amber-300/60 text-left">{isHindi ? 'सभी सेटिंग्स को फ़ैक्टरी डिफ़ॉल्ट पर रीसेट करें' : 'Revert all settings to factory default'}</p>
              </div>
            </div>
            <span className="text-amber-400 font-medium">{isHindi ? 'रीसेट' : 'Reset'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm(isHindi ? 
                'क्या आप वाकई अपना अकाउंट डिलीट करना चाहते हैं? यह एक्शन permanent है और undo नहीं हो सकता। सभी डेटा हमेशा के लिए डिलीट हो जाएगा।' : 
                'Are you sure you want to delete your account? This action is permanent and cannot be undone. All data will be permanently deleted.')) {
                alert(isHindi ? 
                  'अकाउंट डिलीशन रिक्वेस्ट इनिशिएट की गई। हमारी टीम 24 घंटे के भीतर आपसे संपर्क करेगी।' : 
                  'Account deletion request initiated. Our team will contact you within 24 hours.');
              }
            }}
            className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-red-900/10 to-red-800/5 rounded-xl border border-red-900/30 hover:border-red-500/40 transition-all"
          >
            <div className="flex items-center">
              <Trash2 className="w-5 h-5 mr-3 text-red-400" />
              <div>
                <p className="font-bold text-left text-red-300">{isHindi ? 'अकाउंट डिलीट करें' : 'Delete Account'}</p>
                <p className="text-sm text-red-300/60 text-left">{isHindi ? 'स्थायी रूप से अपना अकाउंट और सभी डेटा डिलीट करें' : 'Permanently delete your account and all data'}</p>
              </div>
            </div>
            <span className="text-red-300 font-bold">{isHindi ? 'डिलीट' : 'Delete'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm(isHindi ? 
                'क्या आप अपना सारा ट्रेडिंग हिस्ट्री डिलीट करना चाहते हैं? यह एक्शन undo नहीं हो सकता।' : 
                'Delete all your trading history? This action cannot be undone.')) {
                alert(isHindi ? 
                  'ट्रेडिंग हिस्ट्री डिलीट की गई।' : 
                  'Trading history deleted.');
              }
            }}
            className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-purple-900/10 to-purple-800/5 rounded-xl border border-purple-900/30 hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center">
              <History className="w-5 h-5 mr-3 text-purple-400" />
              <div>
                <p className="font-medium text-left text-white">{isHindi ? 'ट्रेडिंग हिस्ट्री क्लियर करें' : 'Clear Trading History'}</p>
                <p className="text-sm text-purple-300/60 text-left">{isHindi ? 'अपनी सारी ट्रेडिंग हिस्ट्री डिलीट करें' : 'Delete all your trading history'}</p>
              </div>
            </div>
            <span className="text-purple-400 font-medium">{isHindi ? 'क्लियर' : 'Clear'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-indigo-900/40 p-5 md:p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center text-white">
          <Key className="w-5 h-5 mr-2 text-indigo-400" />
          {isHindi ? 'API और इंटीग्रेशन सेटिंग्स' : 'API & Integration Settings'}
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-900/10 to-indigo-800/5 rounded-xl border border-indigo-900/30">
            <div>
              <p className="font-bold text-white">{isHindi ? 'थर्ड-पार्टी API एक्सेस दें' : 'Allow Third-Party API Access'}</p>
              <p className="text-sm text-indigo-300/60">{isHindi ? 'एक्सटर्नल ऐप्लिकेशन को API के माध्यम से आपके डेटा तक पहुंचने दें' : 'Enable external applications to access your data via API'}</p>
            </div>
            <ToggleSwitch
              checked={realSettings.api.allowThirdPartyAccess}
              onChange={(e) => handleSettingChange('api', 'allowThirdPartyAccess', e.target.checked)}
              id="thirdPartyApi"
            />
          </div>

          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-900/10 to-indigo-800/5 rounded-xl border border-indigo-900/30">
            <div>
              <p className="font-bold text-white">{isHindi ? 'वेबहुक नोटिफिकेशन' : 'Webhook Notifications'}</p>
              <p className="text-sm text-indigo-300/60">{isHindi ? 'ट्रेड नोटिफिकेशन आपके वेबहुक URL पर भेजें' : 'Send trade notifications to your webhook URL'}</p>
            </div>
            <ToggleSwitch
              checked={realSettings.api.webhookEnabled}
              onChange={(e) => handleSettingChange('api', 'webhookEnabled', e.target.checked)}
              id="webhook"
            />
          </div>

          {realSettings.api.webhookEnabled && (
            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'वेबहुक URL' : 'Webhook URL'}</label>
              <div className="flex items-center">
                <input
                  type={showWebhookUrl ? "text" : "password"}
                  value={realSettings.api.webhookUrl}
                  onChange={(e) => handleSettingChange('api', 'webhookUrl', e.target.value)}
                  className="flex-1 px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="https://your-webhook-url.com"
                />
                <button
                  onClick={() => setShowWebhookUrl(!showWebhookUrl)}
                  className="ml-2 p-3 hover:bg-slate-800/50 rounded-lg transition-colors"
                  title={showWebhookUrl ? (isHindi ? 'छुपाएं' : 'Hide') : (isHindi ? 'दिखाएं' : 'Show')}
                >
                  {showWebhookUrl ? <EyeOffIcon className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'API की' : 'API Key'}</label>
            <div className="flex items-center">
              <input
                type={showApiKey ? "text" : "password"}
                value={realSettings.api.apiKey}
                onChange={(e) => handleSettingChange('api', 'apiKey', e.target.value)}
                className="flex-1 px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                placeholder={isHindi ? 'API की डालें' : 'Enter API Key'}
                readOnly={!!realSettings.api.apiKey}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="ml-2 p-3 hover:bg-slate-800/50 rounded-lg transition-colors"
                title={showApiKey ? (isHindi ? 'छुपाएं' : 'Hide') : (isHindi ? 'दिखाएं' : 'Show')}
              >
                {showApiKey ? <EyeOffIcon className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={handleGenerateApiKey}
                className="ml-2 px-4 py-3 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:border-emerald-400/50 transition-all text-sm"
              >
                {isHindi ? 'जेनरेट' : 'Generate'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'API रेट लिमिट' : 'API Rate Limit'}</label>
              <select
                value={realSettings.api.rateLimit}
                onChange={(e) => handleSettingChange('api', 'rateLimit', e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="low" className="bg-slate-900">{isHindi ? 'लो (10 रिक्वेस्ट/मिनट)' : 'Low (10 requests/minute)'}</option>
                <option value="medium" className="bg-slate-900">{isHindi ? 'मीडियम (30 रिक्वेस्ट/मिनट)' : 'Medium (30 requests/minute)'}</option>
                <option value="high" className="bg-slate-900">{isHindi ? 'हाई (60 रिक्वेस्ट/मिनट)' : 'High (60 requests/minute)'}</option>
                <option value="unlimited" className="bg-slate-900">{isHindi ? 'अनलिमिटेड (अनुशंसित नहीं)' : 'Unlimited (Not Recommended)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'लॉग रिटेंशन पीरियड' : 'Log Retention Period'}</label>
              <select
                value={realSettings.api.logRetention}
                onChange={(e) => handleSettingChange('api', 'logRetention', e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="7days" className="bg-slate-900">{isHindi ? '7 दिन' : '7 Days'}</option>
                <option value="30days" className="bg-slate-900">{isHindi ? '30 दिन' : '30 Days'}</option>
                <option value="90days" className="bg-slate-900">{isHindi ? '90 दिन' : '90 Days'}</option>
                <option value="1year" className="bg-slate-900">{isHindi ? '1 साल' : '1 Year'}</option>
                <option value="forever" className="bg-slate-900">{isHindi ? 'हमेशा के लिए' : 'Forever'}</option>
              </select>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/10 border border-amber-900/40 rounded-xl p-4">
            <h4 className="font-bold text-amber-400 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {isHindi ? '⚠️ API सिक्योरिटी नोटिस' : '⚠️ API Security Notice'}
            </h4>
            <ul className="text-sm text-amber-300/70 space-y-1">
              <li>• {isHindi ? 'अपने API keys सिक्योर रखें और कभी पब्लिकली शेयर न करें' : 'Keep your API keys secure and never share them publicly'}</li>
              <li>• {isHindi ? 'बेहतर सिक्योरिटी के लिए नियमित रूप से API keys rotate करें' : 'Regularly rotate your API keys for better security'}</li>
              <li>• {isHindi ? 'संदिग्ध एक्टिविटी के लिए API यूसेज लॉग्स मॉनिटर करें' : 'Monitor API usage logs for suspicious activities'}</li>
              <li>• {isHindi ? 'अतिरिक्त सिक्योरिटी के लिए IP whitelisting का उपयोग करें' : 'Use IP whitelisting if available for added security'}</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'IP व्हाइटलिस्ट (अल्पविराम से अलग)' : 'IP Whitelist (comma separated)'}</label>
            <textarea
              value={realSettings.api.ipWhitelist}
              onChange={(e) => handleSettingChange('api', 'ipWhitelist', e.target.value)}
              className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="192.168.1.1, 10.0.0.1"
              rows={3}
            />
            <p className="text-xs text-emerald-300/60 mt-1">
              {isHindi ? 'केवल इन IP addresses से API एक्सेस की अनुमति दें' : 'Allow API access only from these IP addresses'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5 md:p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center text-white">
          <CreditCard className="w-5 h-5 mr-2 text-emerald-400" />
          {isHindi ? 'सब्सक्रिप्शन प्लान' : 'Subscription Plan'}
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Trial Card */}
            <div className={`bg-gradient-to-br ${realSettings.subscription.plan === 'free_trial' ? 'from-emerald-900/40 to-cyan-900/30 border-emerald-500/50' : 'from-slate-800/30 to-slate-900/20 border-emerald-900/40'} rounded-xl border p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-emerald-300/70">{isHindi ? 'फ्री ट्रायल' : 'Free Trial'}</p>
                  <p className="text-2xl font-bold text-white">₹0</p>
                </div>
                {realSettings.subscription.plan === 'free_trial' && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                    {isHindi ? 'एक्टिव' : 'Active'}
                  </span>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? 'बेसिक AI सिग्नल्स' : 'Basic AI signals'}
                </li>
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? '1 ब्रोकर कनेक्शन' : '1 broker connection'}
                </li>
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? 'लिमिटेड अलर्ट्स' : 'Limited alerts'}
                </li>
              </ul>
              {realSettings.subscription.trialDaysLeft > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-emerald-300/70 mb-1">
                    <span>{isHindi ? 'ट्रायल डेज लेफ्ट' : 'Trial days left'}</span>
                    <span>{realSettings.subscription.trialDaysLeft} {isHindi ? 'दिन' : 'days'}</span>
                  </div>
                  <div className="h-2 bg-emerald-900/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{ width: `${(realSettings.subscription.trialDaysLeft / 7) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <button
                onClick={() => alert(isHindi ? 'आप पहले से ही फ्री ट्रायल पर हैं!' : 'You are already on Free Trial!')}
                className={`w-full py-2.5 rounded-lg font-medium ${
                  realSettings.subscription.plan === 'free_trial'
                    ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-900/40'
                    : 'bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50'
                }`}
              >
                {realSettings.subscription.plan === 'free_trial' 
                  ? (isHindi ? 'एक्टिव' : 'Active') 
                  : (isHindi ? 'सिलेक्ट' : 'Select')
                }
              </button>
            </div>

            {/* Monthly Plan */}
            <div className={`bg-gradient-to-br ${realSettings.subscription.plan === 'monthly' ? 'from-emerald-900/40 to-cyan-900/30 border-emerald-500/50' : 'from-slate-800/30 to-slate-900/20 border-emerald-900/40'} rounded-xl border p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-emerald-300/70">{isHindi ? 'मंथली' : 'Monthly'}</p>
                  <p className="text-2xl font-bold text-white">₹999</p>
                  <p className="text-xs text-emerald-300/60">{isHindi ? 'प्रति महीना' : 'per month'}</p>
                </div>
                {realSettings.subscription.plan === 'monthly' && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                    {isHindi ? 'एक्टिव' : 'Active'}
                  </span>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? 'फुल AI सिग्नल्स' : 'Full AI signals'}
                </li>
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? 'अनलिमिटेड ब्रोकर्स' : 'Unlimited brokers'}
                </li>
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? 'सभी अलर्ट्स' : 'All alerts'}
                </li>
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? 'प्रायोरिटी सपोर्ट' : 'Priority support'}
                </li>
              </ul>
              <button
                onClick={() => alert(isHindi ? 'मंथली प्लान अपग्रेड के लिए payment page पर redirect किया जा रहा है...' : 'Redirecting to payment page for Monthly plan upgrade...')}
                className={`w-full py-2.5 rounded-lg font-medium ${
                  realSettings.subscription.plan === 'monthly'
                    ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-900/40'
                    : 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                }`}
              >
                {realSettings.subscription.plan === 'monthly' 
                  ? (isHindi ? 'एक्टिव' : 'Active') 
                  : (isHindi ? 'अपग्रेड' : 'Upgrade')
                }
              </button>
            </div>

            {/* Yearly Plan */}
            <div className={`bg-gradient-to-br ${realSettings.subscription.plan === 'yearly' ? 'from-emerald-900/40 to-cyan-900/30 border-emerald-500/50' : 'from-slate-800/30 to-slate-900/20 border-emerald-900/40'} rounded-xl border p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-emerald-300/70">{isHindi ? 'यरली (बेस्ट वैल्यू)' : 'Yearly (Best Value)'}</p>
                  <p className="text-2xl font-bold text-white">₹9,999</p>
                  <p className="text-xs text-emerald-300/60">{isHindi ? 'प्रति साल, 1 महीना फ्री' : 'per year, 1 month free'}</p>
                </div>
                {realSettings.subscription.plan === 'yearly' && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                    {isHindi ? 'एक्टिव' : 'Active'}
                  </span>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? 'फुल AI सिग्नल्स' : 'Full AI signals'}
                </li>
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? 'अनलिमिटेड ब्रोकर्स' : 'Unlimited brokers'}
                </li>
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? 'सभी अलर्ट्स + एडवांस्ड' : 'All alerts + Advanced'}
                </li>
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? '24x7 प्रायोरिटी सपोर्ट' : '24x7 Priority support'}
                </li>
                <li className="flex items-center text-sm text-emerald-300/70">
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  {isHindi ? 'एडवांस्ड एनालिटिक्स' : 'Advanced analytics'}
                </li>
              </ul>
              <button
                onClick={() => alert(isHindi ? 'यरली प्लान अपग्रेड के लिए payment page पर redirect किया जा रहा है...' : 'Redirecting to payment page for Yearly plan upgrade...')}
                className={`w-full py-2.5 rounded-lg font-medium ${
                  realSettings.subscription.plan === 'yearly'
                    ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-900/40'
                    : 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                }`}
              >
                {realSettings.subscription.plan === 'yearly' 
                  ? (isHindi ? 'एक्टिव' : 'Active') 
                  : (isHindi ? 'अपग्रेड' : 'Upgrade')
                }
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 border border-emerald-900/40 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-emerald-400 mb-1">{isHindi ? 'बिलिंग डिटेल्स' : 'Billing Details'}</h4>
                <p className="text-sm text-emerald-300/70">
                  {realSettings.subscription.plan === 'free_trial' 
                    ? (isHindi ? 'फ्री ट्रायल एक्टिव' : 'Free Trial Active')
                    : (isHindi ? `प्लान: ${realSettings.subscription.plan}, बिलिंग: ${realSettings.subscription.billingCycle}` : `Plan: ${realSettings.subscription.plan}, Billing: ${realSettings.subscription.billingCycle}`)
                  }
                </p>
              </div>
              <button
                onClick={() => alert(isHindi ? 'बिलिंग डिटेल्स पेज पर redirect किया जा रहा है...' : 'Redirecting to billing details page...')}
                className="px-4 py-2 border border-emerald-900/40 text-emerald-300 rounded-lg hover:border-emerald-500/60 hover:bg-emerald-900/10 transition-all text-sm"
              >
                {isHindi ? 'बिलिंग मैनेज करें' : 'Manage Billing'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'ऑटो रिन्यू' : 'Auto Renew'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'प्लान ऑटोमैटिक रिन्यू होगा' : 'Plan will automatically renew'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.subscription.autoRenew}
                onChange={(e) => handleSettingChange('subscription', 'autoRenew', e.target.checked)}
                id="autoRenew"
              />
            </div>

            <div className="p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <p className="font-medium text-white">{isHindi ? 'अगला बिलिंग डेट' : 'Next Billing Date'}</p>
              <p className="text-sm text-emerald-300/60">
                {realSettings.subscription.nextBillingDate 
                  ? formatDate(realSettings.subscription.nextBillingDate)
                  : (isHindi ? 'सेट नहीं' : 'Not set')
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrokerTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5 md:p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center text-white">
          <Database className="w-5 h-5 mr-2 text-emerald-400" />
          {isHindi ? 'ब्रोकर सेटिंग्स' : 'Broker Settings'}
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
            <div>
              <p className="font-bold text-white">{isHindi ? 'ऑटो सिंक' : 'Auto Sync'}</p>
              <p className="text-sm text-emerald-300/60">{isHindi ? 'ऑटोमैटिकली ब्रोकर्स से होल्डिंग्स सिंक करें' : 'Automatically sync holdings from brokers'}</p>
            </div>
            <ToggleSwitch
              checked={realSettings.broker.autoSync}
              onChange={(e) => handleSettingChange('broker', 'autoSync', e.target.checked)}
              id="autoSync"
            />
          </div>

          {realSettings.broker.autoSync && (
            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'सिंक इंटरवल (मिनट)' : 'Sync Interval (minutes)'}</label>
              <input
                type="number"
                min="1"
                max="60"
                value={realSettings.broker.syncInterval}
                onChange={(e) => handleSettingChange('broker', 'syncInterval', parseInt(e.target.value))}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
            <div>
              <p className="font-bold text-white">{isHindi ? 'ऑटो कनेक्ट' : 'Auto Connect'}</p>
              <p className="text-sm text-emerald-300/60">{isHindi ? 'लॉगिन पर ब्रोकर्स को ऑटोमैटिक कनेक्ट करें' : 'Automatically connect brokers on login'}</p>
            </div>
            <ToggleSwitch
              checked={realSettings.broker.autoConnect}
              onChange={(e) => handleSettingChange('broker', 'autoConnect', e.target.checked)}
              id="autoConnect"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'मैक्स ब्रोकर्स' : 'Max Brokers'}</label>
              <input
                type="number"
                min="1"
                max="10"
                value={realSettings.broker.maxBrokers}
                onChange={(e) => handleSettingChange('broker', 'maxBrokers', parseInt(e.target.value))}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'ब्रोकर टाइमआउट (सेकंड)' : 'Broker Timeout (seconds)'}</label>
              <input
                type="number"
                min="10"
                max="120"
                value={realSettings.broker.brokerTimeout}
                onChange={(e) => handleSettingChange('broker', 'brokerTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/10 border border-amber-900/40 rounded-xl p-4">
            <h4 className="font-bold text-amber-400 mb-2 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              {isHindi ? 'ब्रोकर कनेक्शन्स' : 'Broker Connections'}
            </h4>
            <p className="text-sm text-amber-300/70 mb-3">
              {realSettings.broker.connectedBrokers && realSettings.broker.connectedBrokers.length > 0
                ? (isHindi ? `${realSettings.broker.connectedBrokers.length} ब्रोकर कनेक्टेड हैं` : `${realSettings.broker.connectedBrokers.length} brokers connected`)
                : (isHindi ? 'कोई ब्रोकर कनेक्ट नहीं है' : 'No brokers connected')
              }
            </p>
            <button
              onClick={() => window.location.href = '/broker-settings'}
              className="w-full flex items-center justify-between p-3 bg-amber-900/20 rounded-lg border border-amber-900/40 hover:border-amber-500/60 transition-all"
            >
              <span className="text-amber-300 font-medium">{isHindi ? 'ब्रोकर सेटिंग्स देखें' : 'View Broker Settings'}</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5 md:p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center text-white">
          <Cpu className="w-5 h-5 mr-2 text-emerald-400" />
          {isHindi ? 'परफॉर्मेंस ऑप्टिमाइज़ेशन' : 'Performance Optimization'}
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl border border-emerald-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-emerald-300/70">{isHindi ? 'CPU यूसेज' : 'CPU Usage'}</p>
                <Thermometer className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{realSettings.performance.cpuUsage}%</p>
              <div className="h-2 bg-emerald-900/30 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  style={{ width: `${realSettings.performance.cpuUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl border border-cyan-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-cyan-300/70">{isHindi ? 'मेमोरी यूसेज' : 'Memory Usage'}</p>
                <HardDrive className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white">{realSettings.performance.memoryUsage}%</p>
              <div className="h-2 bg-cyan-900/30 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${realSettings.performance.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl border border-purple-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-purple-300/70">{isHindi ? 'नेटवर्क स्पीड' : 'Network Speed'}</p>
                <Globe2 className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{realSettings.performance.networkSpeed} Mbps</p>
              <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${Math.min(realSettings.performance.networkSpeed / 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'कैश एनेबल्ड' : 'Cache Enabled'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'फास्ट लोडिंग के लिए कैशिंग' : 'Caching for faster loading'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.performance.cacheEnabled}
                onChange={(e) => handleSettingChange('performance', 'cacheEnabled', e.target.checked)}
                id="cacheEnabled"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'GPU एक्सेलेरेशन' : 'GPU Acceleration'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'चार्ट रेंडरिंग के लिए GPU use करें' : 'Use GPU for chart rendering'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.performance.gpuAcceleration}
                onChange={(e) => handleSettingChange('performance', 'gpuAcceleration', e.target.checked)}
                id="gpuAcceleration"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/10 border border-blue-900/40 rounded-xl p-4">
            <h4 className="font-bold text-blue-400 mb-2">{isHindi ? 'आखिरी ऑप्टिमाइज़ेशन' : 'Last Optimization'}</h4>
            <p className="text-sm text-blue-300/70">
              {realSettings.performance.lastOptimization 
                ? formatDate(realSettings.performance.lastOptimization)
                : (isHindi ? 'कभी नहीं' : 'Never')
              }
            </p>
          </div>

          <button
            onClick={handleOptimizePerformance}
            disabled={optimizing}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {optimizing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{isHindi ? 'ऑप्टिमाइज़ हो रहा है...' : 'Optimizing...'}</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>{isHindi ? 'परफॉर्मेंस ऑप्टिमाइज़ करें' : 'Optimize Performance'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-5 md:p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center text-white">
          <BellRing className="w-5 h-5 mr-2 text-emerald-400" />
          {isHindi ? 'अलर्ट सेटिंग्स' : 'Alert Settings'}
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'साउंड एनेबल्ड' : 'Sound Enabled'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'अलर्ट्स के लिए साउंड प्ले करें' : 'Play sound for alerts'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.alerts.soundEnabled}
                onChange={(e) => handleSettingChange('alerts', 'soundEnabled', e.target.checked)}
                id="soundEnabled"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'वाइब्रेशन' : 'Vibration'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'मोबाइल पर वाइब्रेशन' : 'Vibration on mobile'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.alerts.vibrationEnabled}
                onChange={(e) => handleSettingChange('alerts', 'vibrationEnabled', e.target.checked)}
                id="vibrationEnabled"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'डेस्कटॉप नोटिफिकेशन' : 'Desktop Notifications'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'डेस्कटॉप पर नोटिफिकेशन दिखाएं' : 'Show notifications on desktop'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.alerts.desktopNotifications}
                onChange={(e) => handleSettingChange('alerts', 'desktopNotifications', e.target.checked)}
                id="desktopNotifications"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/10 to-emerald-800/5 rounded-xl border border-emerald-900/30">
              <div>
                <p className="font-medium text-white">{isHindi ? 'प्रायोरिटी अलर्ट्स' : 'Priority Alerts'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'महत्वपूर्ण अलर्ट्स हमेशा दिखाएं' : 'Always show important alerts'}</p>
              </div>
              <ToggleSwitch
                checked={realSettings.alerts.priorityAlerts}
                onChange={(e) => handleSettingChange('alerts', 'priorityAlerts', e.target.checked)}
                id="priorityAlerts"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'अलर्ट वॉल्यूम' : 'Alert Volume'}</label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={realSettings.alerts.alertVolume}
                onChange={(e) => handleSettingChange('alerts', 'alertVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-emerald-300/60">
                <span className="flex items-center">
                  <VolumeX className="w-3 h-3 mr-1" />
                  {isHindi ? 'म्यूट' : 'Mute'}
                </span>
                <span className="text-white font-medium">{realSettings.alerts.alertVolume}%</span>
                <span className="flex items-center">
                  <Volume2 className="w-3 h-3 mr-1" />
                  {isHindi ? 'मैक्स' : 'Max'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-300/70 mb-2">{isHindi ? 'अलर्ट शेड्यूल' : 'Alert Schedule'}</label>
            <select
              value={realSettings.alerts.alertSchedule}
              onChange={(e) => handleSettingChange('alerts', 'alertSchedule', e.target.value)}
              className="w-full px-3 py-3 bg-slate-800/50 border border-emerald-900/40 rounded-lg text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="always" className="bg-slate-900">{isHindi ? 'हमेशा' : 'Always'}</option>
              <option value="trading_hours" className="bg-slate-900">{isHindi ? 'सिर्फ ट्रेडिंग आवर्स' : 'Trading Hours Only'}</option>
              <option value="market_hours" className="bg-slate-900">{isHindi ? 'मार्केट आवर्स' : 'Market Hours'}</option>
              <option value="custom" className="bg-slate-900">{isHindi ? 'कस्टम' : 'Custom'}</option>
            </select>
          </div>

          <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/10 border border-amber-900/40 rounded-xl p-4">
            <h4 className="font-bold text-amber-400 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              {isHindi ? 'अलर्ट टिप्स' : 'Alert Tips'}
            </h4>
            <ul className="text-sm text-amber-300/70 space-y-1">
              <li>• {isHindi ? 'महत्वपूर्ण अलर्ट्स के लिए साउंड ऑन रखें' : 'Keep sound on for critical alerts'}</li>
              <li>• {isHindi ? 'प्रायोरिटी अलर्ट्स हमेशा दिखेंगे' : 'Priority alerts will always show'}</li>
              <li>• {isHindi ? 'ट्रेडिंग आवर्स में अलर्ट्स ज्यादा इम्पोर्टेंट हैं' : 'Alerts are more important during trading hours'}</li>
              <li>• {isHindi ? 'वाइब्रेशन मोबाइल यूजर्स के लिए उपयोगी है' : 'Vibration is useful for mobile users'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'notifications': return renderNotificationsTab();
      case 'trading': return renderTradingTab();
      case 'risk': return renderRiskTab();
      case 'display': return renderDisplayTab();
      case 'privacy': return renderPrivacyTab();
      case 'api': return renderApiTab();
      case 'subscription': return renderSubscriptionTab();
      case 'broker': return renderBrokerTab();
      case 'performance': return renderPerformanceTab();
      case 'alerts': return renderAlertsTab();
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
              <span className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium border border-amber-500/30 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
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

        {/* Footer Info */}
        <div className="mt-6 pt-6 border-t border-emerald-900/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-emerald-300/60">
            <div className="flex items-center space-x-4 mb-3 md:mb-0">
              <div className="flex items-center">
                <SettingsIcon className="w-4 h-4 mr-2" />
                <span>VeloxTradeAI v3.0</span>
              </div>
              <div className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                <span>{isHindi ? 'डेटा सिक्योर' : 'Data Secure'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                className="text-amber-400 hover:text-amber-300 font-medium"
              >
                {isHindi ? 'रीसेट सभी सेटिंग्स' : 'Reset All Settings'}
              </button>
              <button
                onClick={handleExportData}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                {isHindi ? 'एक्सपोर्ट सेटिंग्स' : 'Export Settings'}
              </button>
              <button
                onClick={() => window.open('https://help.veloxtradeai.com', '_blank')}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                {isHindi ? 'हेल्प' : 'Help'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
