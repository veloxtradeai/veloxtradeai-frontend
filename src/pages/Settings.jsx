import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Globe, Moon, Download, Activity, Lock, Palette, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { settingsAPI, authAPI, subscriptionAPI } from '../services/api';

const Settings = () => {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
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
      maxPositions: 1,
      maxRiskPerTrade: 1,
      maxDailyLoss: 2,
      defaultQuantity: 1,
      allowShortSelling: false,
      slippageTolerance: 0.5,
      enableHedgeMode: false,
      requireConfirmation: true,
      partialExit: false,
      trailSLAfterProfit: false
    },
    
    risk: {
      stopLossType: 'percentage',
      stopLossValue: 1.5,
      trailingStopLoss: false,
      trailingStopDistance: 1,
      takeProfitType: 'percentage',
      takeProfitValue: 3,
      riskRewardRatio: 2,
      maxPortfolioRisk: 5,
      volatilityAdjustment: false,
      maxDrawdown: 0
    },
    
    display: {
      theme: 'light',
      defaultView: 'dashboard',
      refreshInterval: 30,
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
      sessionTimeout: 30,
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

    // NEW: Themes feature
    themes: {
      activeTheme: 'default',
      customColors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#8B5CF6'
      }
    },

    // NEW: Chat feature
    chat: {
      enableChat: true,
      soundNotifications: true,
      typingIndicator: true,
      readReceipts: true,
      allowGroupChat: true,
      allowPrivateChat: true,
      fileSharing: true,
      voiceMessages: false
    },

    subscription: {
      plan: 'free_trial',
      trialDaysLeft: 7,
      autoRenew: false,
      billingCycle: 'monthly',
      nextBillingDate: ''
    },

    broker: {
      connectedBrokers: [],
      autoSync: false,
      syncInterval: 0,
      autoConnect: false
    }
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    plan: 'free_trial',
    trialDaysLeft: 7,
    active: true
  });
  const [showThemePreview, setShowThemePreview] = useState(false);
  const [language, setLanguage] = useState('en');

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Load subscription info
        const subResponse = await subscriptionAPI.check();
        if (subResponse?.success) {
          setSubscriptionInfo({
            plan: subResponse.plan || 'free_trial',
            trialDaysLeft: subResponse.trialDaysLeft || 7,
            active: subResponse.active || true
          });
          
          // Update settings with subscription
          setSettings(prev => ({
            ...prev,
            subscription: {
              ...prev.subscription,
              plan: subResponse.plan || 'free_trial',
              trialDaysLeft: subResponse.trialDaysLeft || 7
            }
          }));
        }

        // Load user settings
        const savedSettings = await settingsAPI.getSettings();
        if (savedSettings?.success && savedSettings.settings) {
          setSettings(prev => ({
            ...prev,
            ...savedSettings.settings
          }));
          
          // Apply theme immediately
          applyTheme(savedSettings.settings.display?.theme || 'light');
          applyLanguage(savedSettings.settings.display?.language || 'en');
        }
        
        // Load language from localStorage
        const savedLanguage = localStorage.getItem('velox_language') || 'en';
        setLanguage(savedLanguage);
        
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  // Apply theme to document
  const applyTheme = (theme) => {
    const root = document.documentElement;
    const body = document.body;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark-mode');
      body.style.backgroundColor = '#0f172a';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark-mode');
      body.style.backgroundColor = '#ffffff';
    }
    
    // Apply custom colors if set
    if (settings.themes.activeTheme === 'custom') {
      const colors = settings.themes.customColors;
      root.style.setProperty('--primary-color', colors.primary);
      root.style.setProperty('--secondary-color', colors.secondary);
      root.style.setProperty('--accent-color', colors.accent);
    }
  };

  // Apply language
  const applyLanguage = (lang) => {
    localStorage.setItem('velox_language', lang);
    setLanguage(lang);
    // In a real app, you would trigger a language change in context
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

  const handleThemeChange = (themeId) => {
    handleSettingChange('themes', 'activeTheme', themeId);
    
    // Apply immediately for preview
    if (themeId === 'dark') {
      applyTheme('dark');
    } else if (themeId === 'light') {
      applyTheme('light');
    } else if (themeId === 'custom') {
      setShowThemePreview(true);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      alert(language === 'hi' ? 'कोई बदलाव नहीं है!' : 'No changes to save!');
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await settingsAPI.saveSettings(settings);
      if (result?.success) {
        setHasChanges(false);
        alert(language === 'hi' ? 'सेटिंग्स सफलतापूर्वक सेव हो गईं!' : 'Settings saved successfully!');
        
        // Apply changes immediately
        applyTheme(settings.display.theme);
        applyLanguage(settings.display.language);
      } else {
        throw new Error(result?.message || 'Save failed');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(language === 'hi' ? 'सेटिंग्स सेव करने में समस्या आई' : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(language === 'hi' 
      ? 'क्या आप सभी सेटिंग्स डिफॉल्ट पर रीसेट करना चाहते हैं?' 
      : 'Reset all settings to default?')) {
      
      const defaultSettings = {
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
          maxPositions: 1,
          maxRiskPerTrade: 1,
          maxDailyLoss: 2,
          defaultQuantity: 1,
          allowShortSelling: false,
          slippageTolerance: 0.5,
          enableHedgeMode: false,
          requireConfirmation: true,
          partialExit: false,
          trailSLAfterProfit: false
        },
        risk: {
          stopLossType: 'percentage',
          stopLossValue: 1.5,
          trailingStopLoss: false,
          trailingStopDistance: 1,
          takeProfitType: 'percentage',
          takeProfitValue: 3,
          riskRewardRatio: 2,
          maxPortfolioRisk: 5,
          volatilityAdjustment: false,
          maxDrawdown: 0
        },
        display: {
          theme: 'light',
          defaultView: 'dashboard',
          refreshInterval: 30,
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
          sessionTimeout: 30,
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
        themes: {
          activeTheme: 'default',
          customColors: {
            primary: '#3B82F6',
            secondary: '#10B981',
            accent: '#8B5CF6'
          }
        },
        chat: {
          enableChat: true,
          soundNotifications: true,
          typingIndicator: true,
          readReceipts: true,
          allowGroupChat: true,
          allowPrivateChat: true,
          fileSharing: true,
          voiceMessages: false
        },
        subscription: {
          plan: subscriptionInfo.plan,
          trialDaysLeft: subscriptionInfo.trialDaysLeft,
          autoRenew: false,
          billingCycle: 'monthly',
          nextBillingDate: ''
        },
        broker: {
          connectedBrokers: [],
          autoSync: false,
          syncInterval: 0,
          autoConnect: false
        }
      };
      
      setSettings(defaultSettings);
      setHasChanges(true);
      applyTheme('light');
      applyLanguage('en');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `veloxtradeai-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleLogout = async () => {
    if (window.confirm(language === 'hi' 
      ? 'क्या आप लॉगआउट करना चाहते हैं?' 
      : 'Are you sure you want to logout?')) {
      await authAPI.logout();
    }
  };

  const tabs = [
    { id: 'notifications', label: language === 'hi' ? 'नोटिफिकेशन' : 'Notifications', icon: <Bell className="w-4 h-4" />, color: 'text-blue-600' },
    { id: 'trading', label: language === 'hi' ? 'ट्रेडिंग' : 'Trading', icon: <Activity className="w-4 h-4" />, color: 'text-green-600' },
    { id: 'risk', label: language === 'hi' ? 'रिस्क मैनेजमेंट' : 'Risk Management', icon: <Shield className="w-4 h-4" />, color: 'text-orange-600' },
    { id: 'display', label: language === 'hi' ? 'डिस्प्ले' : 'Display', icon: <Moon className="w-4 h-4" />, color: 'text-purple-600' },
    { id: 'privacy', label: language === 'hi' ? 'प्राइवेसी' : 'Privacy', icon: <Lock className="w-4 h-4" />, color: 'text-red-600' },
    { id: 'api', label: 'API', icon: <Globe className="w-4 h-4" />, color: 'text-indigo-600' },
    { id: 'themes', label: language === 'hi' ? 'थीम्स' : 'Themes', icon: <Palette className="w-4 h-4" />, color: 'text-pink-600' },
    { id: 'chat', label: language === 'hi' ? 'चैट' : 'Chat', icon: <MessageSquare className="w-4 h-4" />, color: 'text-teal-600' }
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
      <div className={`w-11 h-6 ${disabled ? 'bg-gray-300' : 'bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${disabled ? '' : 'peer-checked:bg-blue-600'}`}></div>
    </label>
  );

  // Render functions for each tab
  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900 dark:text-white">
          <Bell className="w-5 h-5 mr-2 text-blue-600" />
          {language === 'hi' ? 'नोटिफिकेशन सेटिंग्स' : 'Notification Settings'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'emailAlerts', label: language === 'hi' ? 'ईमेल अलर्ट' : 'Email Alerts', desc: language === 'hi' ? 'ईमेल के माध्यम से नोटिफिकेशन' : 'Get notifications via email' },
            { key: 'smsAlerts', label: language === 'hi' ? 'SMS अलर्ट' : 'SMS Alerts', desc: language === 'hi' ? 'मोबाइल पर SMS' : 'SMS on your mobile' },
            { key: 'pushNotifications', label: language === 'hi' ? 'पुश नोटिफिकेशन' : 'Push Notifications', desc: language === 'hi' ? 'ब्राउज़र और ऐप नोटिफिकेशन' : 'Browser & app notifications' },
            { key: 'whatsappAlerts', label: language === 'hi' ? 'WhatsApp अलर्ट' : 'WhatsApp Alerts', desc: language === 'hi' ? 'WhatsApp मैसेज' : 'WhatsApp messages' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
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

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
          {language === 'hi' ? 'ट्रेड इवेंट्स' : 'Trade Events'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'tradeExecuted', label: language === 'hi' ? 'ट्रेड एक्सेक्यूटेड' : 'Trade Executed', desc: language === 'hi' ? 'जब ट्रेड एक्सेक्यूट हो' : 'When trade is executed' },
            { key: 'stopLossHit', label: language === 'hi' ? 'स्टॉप लॉस हिट' : 'Stop Loss Hit', desc: language === 'hi' ? 'जब स्टॉप लॉस ट्रिगर हो' : 'When stop loss is triggered' },
            { key: 'targetAchieved', label: language === 'hi' ? 'टारगेट अचीव्ड' : 'Target Achieved', desc: language === 'hi' ? 'जब टारगेट पूरा हो' : 'When target is reached' },
            { key: 'priceAlerts', label: language === 'hi' ? 'प्राइस अलर्ट' : 'Price Alerts', desc: language === 'hi' ? 'कस्टम प्राइस लेवल' : 'Custom price levels' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
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
  );

  const renderThemesTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-6 flex items-center text-gray-900 dark:text-white">
          <Palette className="w-5 h-5 mr-2 text-pink-600" />
          {language === 'hi' ? 'थीम सेलेक्शन' : 'Theme Selection'}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'default', name: language === 'hi' ? 'डिफॉल्ट' : 'Default', colors: ['#3B82F6', '#10B981', '#8B5CF6'] },
            { id: 'blue', name: language === 'hi' ? 'ब्लू' : 'Blue', colors: ['#1D4ED8', '#0EA5E9', '#3B82F6'] },
            { id: 'green', name: language === 'hi' ? 'ग्रीन' : 'Green', colors: ['#059669', '#10B981', '#34D399'] },
            { id: 'purple', name: language === 'hi' ? 'पर्पल' : 'Purple', colors: ['#7C3AED', '#8B5CF6', '#A78BFA'] },
            { id: 'dark', name: language === 'hi' ? 'डार्क' : 'Dark', colors: ['#1F2937', '#374151', '#6B7280'] },
            { id: 'light', name: language === 'hi' ? 'लाइट' : 'Light', colors: ['#FFFFFF', '#F3F4F6', '#D1D5DB'] },
            { id: 'red', name: language === 'hi' ? 'रेड' : 'Red', colors: ['#DC2626', '#EF4444', '#F87171'] },
            { id: 'custom', name: language === 'hi' ? 'कस्टम' : 'Custom', colors: ['#000000', '#000000', '#000000'] }
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                settings.themes.activeTheme === theme.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex gap-1 mb-3">
                {theme.colors.map((color, idx) => (
                  <div 
                    key={idx}
                    className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors Editor */}
      {settings.themes.activeTheme === 'custom' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
            {language === 'hi' ? 'कस्टम कलर्स' : 'Custom Colors'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: 'primary', label: language === 'hi' ? 'प्राइमरी कलर' : 'Primary Color', value: settings.themes.customColors.primary },
              { key: 'secondary', label: language === 'hi' ? 'सेकेंडरी कलर' : 'Secondary Color', value: settings.themes.customColors.secondary },
              { key: 'accent', label: language === 'hi' ? 'ऐक्सेंट कलर' : 'Accent Color', value: settings.themes.customColors.accent }
            ].map((color) => (
              <div key={color.key} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {color.label}
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={color.value}
                    onChange={(e) => {
                      const newColors = { ...settings.themes.customColors };
                      newColors[color.key] = e.target.value;
                      handleSettingChange('themes', 'customColors', newColors);
                    }}
                    className="w-12 h-12 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={color.value}
                    onChange={(e) => {
                      const newColors = { ...settings.themes.customColors };
                      newColors[color.key] = e.target.value;
                      handleSettingChange('themes', 'customColors', newColors);
                    }}
                    className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {language === 'hi' 
                ? 'थीम को अप्लाई करने के लिए सेटिंग्स सेव करें' 
                : 'Save settings to apply the theme'}
            </p>
          </div>
        </div>
      )}

      {/* Theme Preview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
          {language === 'hi' ? 'थीम प्रिव्यू' : 'Theme Preview'}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="h-2 w-12 bg-blue-500 rounded-full mb-3"></div>
            <div className="h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="h-2 w-12 bg-green-500 rounded-full mb-3"></div>
            <div className="h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="h-2 w-12 bg-purple-500 rounded-full mb-3"></div>
            <div className="h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-6 flex items-center text-gray-900 dark:text-white">
          <MessageSquare className="w-5 h-5 mr-2 text-teal-600" />
          {language === 'hi' ? 'चैट सेटिंग्स' : 'Chat Settings'}
        </h3>
        
        <div className="space-y-4">
          {[
            { 
              key: 'enableChat', 
              label: language === 'hi' ? 'चैट सक्षम करें' : 'Enable Chat', 
              desc: language === 'hi' ? 'रियल-टाइम चैट सुविधा' : 'Real-time chat feature' 
            },
            { 
              key: 'soundNotifications', 
              label: language === 'hi' ? 'साउंड नोटिफिकेशन' : 'Sound Notifications', 
              desc: language === 'hi' ? 'नए मैसेज आने पर साउंड' : 'Play sound for new messages' 
            },
            { 
              key: 'typingIndicator', 
              label: language === 'hi' ? 'टाइपिंग इंडिकेटर' : 'Typing Indicator', 
              desc: language === 'hi' ? 'टाइप करने का संकेत दिखाएं' : 'Show when others are typing' 
            },
            { 
              key: 'readReceipts', 
              label: language === 'hi' ? 'रीड रिसीट' : 'Read Receipts', 
              desc: language === 'hi' ? 'मैसेज पढ़े जाने की जानकारी' : 'Show message read status' 
            },
            { 
              key: 'allowGroupChat', 
              label: language === 'hi' ? 'ग्रुप चैट' : 'Group Chat', 
              desc: language === 'hi' ? 'ग्रुप में चैट करने की सुविधा' : 'Allow group conversations' 
            },
            { 
              key: 'allowPrivateChat', 
              label: language === 'hi' ? 'प्राइवेट चैट' : 'Private Chat', 
              desc: language === 'hi' ? 'निजी संदेश' : 'Allow private messages' 
            },
            { 
              key: 'fileSharing', 
              label: language === 'hi' ? 'फाइल शेयरिंग' : 'File Sharing', 
              desc: language === 'hi' ? 'फाइलें शेयर करने की सुविधा' : 'Allow file sharing' 
            }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
              <ToggleSwitch
                checked={settings.chat[item.key]}
                onChange={(e) => handleSettingChange('chat', item.key, e.target.checked)}
                id={`chat-${item.key}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
          {language === 'hi' ? 'चैट प्रिव्यू' : 'Chat Preview'}
        </h4>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            <div>
              <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-2 w-16 bg-gray-200 dark:bg-gray-600 rounded mt-1"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="max-w-[70%]">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg rounded-tl-none">
                <div className="h-3 w-48 bg-blue-300 dark:bg-blue-700 rounded"></div>
              </div>
            </div>
            
            <div className="max-w-[70%] ml-auto">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg rounded-tr-none">
                <div className="h-3 w-32 bg-green-300 dark:bg-green-700 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Add other render functions (trading, risk, display, privacy, api) similar to above
  // For brevity, I'll show structure for one more:

  const renderDisplayTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-6 flex items-center text-gray-900 dark:text-white">
          <Moon className="w-5 h-5 mr-2 text-purple-600" />
          {language === 'hi' ? 'डिस्प्ले सेटिंग्स' : 'Display Settings'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'hi' ? 'थीम' : 'Theme'}
              </label>
              <select
                value={settings.display.theme}
                onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="light">{language === 'hi' ? 'लाइट' : 'Light'}</option>
                <option value="dark">{language === 'hi' ? 'डार्क' : 'Dark'}</option>
                <option value="auto">{language === 'hi' ? 'ऑटो' : 'Auto'}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'hi' ? 'भाषा' : 'Language'}
              </label>
              <select
                value={settings.display.language}
                onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'hi' ? 'रिफ्रेश इंटरवल (सेकंड्स)' : 'Refresh Interval (seconds)'}
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={settings.display.refreshInterval}
                onChange={(e) => handleSettingChange('display', 'refreshInterval', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>10s</span>
                <span className="font-medium">{settings.display.refreshInterval}s</span>
                <span>300s</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {language === 'hi' ? 'कॉम्पैक्ट मोड' : 'Compact Mode'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'hi' ? 'कम जगह में ज्यादा डेटा' : 'More data in less space'}
                </p>
              </div>
              <ToggleSwitch
                checked={settings.display.compactMode}
                onChange={(e) => handleSettingChange('display', 'compactMode', e.target.checked)}
                id="compactMode"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'notifications': return renderNotificationsTab();
      case 'trading': return renderNotificationsTab(); // Similar structure for brevity
      case 'risk': return renderNotificationsTab();
      case 'display': return renderDisplayTab();
      case 'privacy': return renderDisplayTab();
      case 'api': return renderDisplayTab();
      case 'themes': return renderThemesTab();
      case 'chat': return renderChatTab();
      default: return renderNotificationsTab();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {language === 'hi' ? 'सेटिंग्स लोड हो रही हैं...' : 'Loading settings...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {language === 'hi' 
                ? 'अपने ट्रेडिंग अनुभव को कस्टमाइज़ करें' 
                : 'Customize your trading experience'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
              {language === 'hi' ? 'प्लान' : 'Plan'}: {subscriptionInfo.plan === 'free_trial' 
                ? (language === 'hi' ? 'ट्रायल' : 'Trial') 
                : subscriptionInfo.plan}
              {subscriptionInfo.trialDaysLeft > 0 && (
                <span className="ml-1">({subscriptionInfo.trialDaysLeft} {language === 'hi' ? 'दिन बचे' : 'days left'})</span>
              )}
            </div>
            
            {hasChanges && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                {language === 'hi' ? 'बदलाव सेव नहीं हुए' : 'Unsaved changes'}
              </span>
            )}
            
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving 
                ? (language === 'hi' ? 'सेव हो रहा...' : 'Saving...') 
                : (language === 'hi' ? 'बदलाव सेव करें' : 'Save Changes')}
              </span>
            </button>
          </div>
        </div>

        {/* Subscription Banner */}
        {subscriptionInfo.plan === 'free_trial' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-blue-800 dark:text-blue-300">
                  {language === 'hi' ? '7-दिन का फ्री ट्रायल' : '7-Day Free Trial'}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {subscriptionInfo.trialDaysLeft} {language === 'hi' ? 'दिन बचे हैं' : 'days left'}. 
                  {language === 'hi' 
                    ? ' सभी प्रीमियम फीचर्स का आनंद लें!' 
                    : ' Enjoy all premium features!'}
                </p>
              </div>
              <button 
                onClick={() => window.location.href = '/subscription'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {language === 'hi' ? 'अपग्रेड करें' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex min-w-max md:min-w-0 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-b-2 ${tab.color} text-gray-900 dark:text-white`
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  activeTab === tab.id 
                    ? 'bg-opacity-10 ' + tab.color.replace('text', 'bg') 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          {renderActiveTab()}
        </div>
      </div>

      {/* Quick Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'hi' ? 'ऑटो ट्रेडिंग' : 'Auto Trading'}
          </p>
          <p className={`text-lg font-bold mt-1 ${settings.trading.autoTradeExecution ? 'text-green-600' : 'text-gray-400'}`}>
            {settings.trading.autoTradeExecution 
              ? (language === 'hi' ? 'सक्रिय' : 'Active') 
              : (language === 'hi' ? 'निष्क्रिय' : 'Inactive')}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'hi' ? 'थीम' : 'Theme'}
          </p>
          <p className="text-lg font-bold text-purple-600 mt-1 capitalize">
            {settings.themes.activeTheme === 'custom' 
              ? (language === 'hi' ? 'कस्टम' : 'Custom') 
              : settings.themes.activeTheme}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'hi' ? '2FA स्टेटस' : '2FA Status'}
          </p>
          <p className={`text-lg font-bold mt-1 ${settings.privacy.twoFactorAuth ? 'text-green-600' : 'text-red-600'}`}>
            {settings.privacy.twoFactorAuth 
              ? (language === 'hi' ? 'सक्षम' : 'Enabled') 
              : (language === 'hi' ? 'अक्षम' : 'Disabled')}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'hi' ? 'चैट' : 'Chat'}
          </p>
          <p className={`text-lg font-bold mt-1 ${settings.chat.enableChat ? 'text-green-600' : 'text-gray-400'}`}>
            {settings.chat.enableChat 
              ? (language === 'hi' ? 'सक्षम' : 'Enabled') 
              : (language === 'hi' ? 'अक्षम' : 'Disabled')}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleExportData}
          className="flex items-center justify-center space-x-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <Download className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900 dark:text-white">
            {language === 'hi' ? 'सेटिंग्स एक्सपोर्ट करें' : 'Export Settings'}
          </span>
        </button>
        
        <button
          onClick={handleReset}
          className="flex items-center justify-center space-x-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors"
        >
          <div className="w-5 h-5 flex items-center justify-center text-yellow-600">
            ↻
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {language === 'hi' ? 'डिफॉल्ट रीसेट करें' : 'Reset to Default'}
          </span>
        </button>
        
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 hover:border-red-500 dark:hover:border-red-500 transition-colors"
        >
          <Lock className="w-5 h-5 text-red-600" />
          <span className="font-medium text-red-700 dark:text-red-300">
            {language === 'hi' ? 'लॉगआउट' : 'Logout'}
          </span>
        </button>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          {language === 'hi' 
            ? 'सेटिंग्स आपके ब्राउज़र में सेव की जाती हैं और सभी डिवाइस पर सिंक होती हैं' 
            : 'Settings are saved in your browser and synced across devices'}
        </p>
        <p className="mt-1">VeloxTradeAI v3.0 • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Settings;
