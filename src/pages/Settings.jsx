import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Globe, Moon, Download, Activity, Lock, Palette, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { settingsService } from '../services/settingsService';

const Settings = () => {
  const { user } = useAuth();
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
      requireConfirmation: true
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
      volatilityAdjustment: false
    },
    
    display: {
      theme: 'light',
      defaultView: 'dashboard',
      refreshInterval: 30,
      showAdvancedCharts: false,
      compactMode: false,
      language: 'en',
      showIndicators: false,
      darkModeIntensity: 'medium'
    },
    
    privacy: {
      publicProfile: false,
      showPortfolioValue: false,
      shareTradingHistory: false,
      dataSharing: 'none',
      twoFactorAuth: false,
      sessionTimeout: 30,
      showRealName: false
    },
    
    api: {
      allowThirdPartyAccess: false,
      webhookEnabled: false,
      rateLimit: 'low',
      logRetention: '30days'
    },

    // New Features Added
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
      readReceipts: true
    }
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        if (user && user.token) {
          const savedSettings = await settingsService.getUserSettings(user.token);
          if (savedSettings) {
            setSettings(savedSettings);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Use default settings if failed to load
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

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
      alert('कोई बदलाव नहीं है!');
      return;
    }
    
    setIsSaving(true);
    try {
      if (user && user.token) {
        await settingsService.saveUserSettings(user.token, settings);
        setHasChanges(false);
        alert('सेटिंग्स सफलतापूर्वक सेव हो गईं!');
        
        // Apply theme changes immediately
        applyThemeChanges();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('सेटिंग्स सेव करने में समस्या आई');
    } finally {
      setIsSaving(false);
    }
  };

  const applyThemeChanges = () => {
    // Apply theme to document
    const root = document.documentElement;
    const theme = settings.display.theme;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
    }

    // Apply custom colors if theme is custom
    if (settings.themes.activeTheme === 'custom') {
      root.style.setProperty('--primary-color', settings.themes.customColors.primary);
      root.style.setProperty('--secondary-color', settings.themes.customColors.secondary);
      root.style.setProperty('--accent-color', settings.themes.customColors.accent);
    }
  };

  const handleReset = () => {
    if (window.confirm('क्या आप सभी सेटिंग्स डिफॉल्ट पर रीसेट करना चाहते हैं?')) {
      setSettings({
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
          requireConfirmation: true
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
          volatilityAdjustment: false
        },
        display: {
          theme: 'light',
          defaultView: 'dashboard',
          refreshInterval: 30,
          showAdvancedCharts: false,
          compactMode: false,
          language: 'en',
          showIndicators: false,
          darkModeIntensity: 'medium'
        },
        privacy: {
          publicProfile: false,
          showPortfolioValue: false,
          shareTradingHistory: false,
          dataSharing: 'none',
          twoFactorAuth: false,
          sessionTimeout: 30,
          showRealName: false
        },
        api: {
          allowThirdPartyAccess: false,
          webhookEnabled: false,
          rateLimit: 'low',
          logRetention: '30days'
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
          readReceipts: true
        }
      });
      setHasChanges(true);
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

  const tabs = [
    { id: 'notifications', label: 'नोटिफिकेशन', icon: <Bell className="w-4 h-4" />, color: 'text-blue-600' },
    { id: 'trading', label: 'ट्रेडिंग', icon: <Activity className="w-4 h-4" />, color: 'text-green-600' },
    { id: 'risk', label: 'रिस्क मैनेजमेंट', icon: <Shield className="w-4 h-4" />, color: 'text-orange-600' },
    { id: 'display', label: 'डिस्प्ले', icon: <Moon className="w-4 h-4" />, color: 'text-purple-600' },
    { id: 'privacy', label: 'प्राइवेसी', icon: <Lock className="w-4 h-4" />, color: 'text-red-600' },
    { id: 'api', label: 'API', icon: <Globe className="w-4 h-4" />, color: 'text-indigo-600' },
    { id: 'themes', label: 'थीम्स', icon: <Palette className="w-4 h-4" />, color: 'text-pink-600' },
    { id: 'chat', label: 'चैट', icon: <MessageSquare className="w-4 h-4" />, color: 'text-teal-600' }
  ];

  const ToggleSwitch = ({ checked, onChange, id }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-2 flex items-center text-gray-900 dark:text-white">
          <Bell className="w-5 h-5 mr-2 text-blue-600" />
          अलर्ट चैनल
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">नोटिफिकेशन कैसे प्राप्त करना चाहते हैं</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'emailAlerts', label: 'ईमेल अलर्ट', desc: 'ईमेल के माध्यम से नोटिफिकेशन प्राप्त करें' },
            { key: 'smsAlerts', label: 'SMS अलर्ट', desc: 'मोबाइल पर SMS प्राप्त करें' },
            { key: 'pushNotifications', label: 'पुश नोटिफिकेशन', desc: 'ब्राउज़र और ऐप नोटिफिकेशन' },
            { key: 'whatsappAlerts', label: 'WhatsApp अलर्ट', desc: 'अलर्ट के लिए WhatsApp मैसेज' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
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
    </div>
  );

  const renderThemesTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900 dark:text-white">
          <Palette className="w-5 h-5 mr-2 text-pink-600" />
          थीम सेलेक्शन
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { id: 'default', name: 'डिफॉल्ट', colors: ['#3B82F6', '#10B981', '#8B5CF6'] },
            { id: 'blue', name: 'ब्लू', colors: ['#1D4ED8', '#0EA5E9', '#3B82F6'] },
            { id: 'green', name: 'ग्रीन', colors: ['#059669', '#10B981', '#34D399'] },
            { id: 'purple', name: 'पर्पल', colors: ['#7C3AED', '#8B5CF6', '#A78BFA'] },
            { id: 'dark', name: 'डार्क', colors: ['#1F2937', '#374151', '#6B7280'] },
            { id: 'red', name: 'रेड', colors: ['#DC2626', '#EF4444', '#F87171'] },
            { id: 'orange', name: 'ऑरेंज', colors: ['#EA580C', '#F97316', '#FB923C'] },
            { id: 'custom', name: 'कस्टम', colors: ['#000000', '#000000', '#000000'] }
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleSettingChange('themes', 'activeTheme', theme.id)}
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
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{theme.name}</span>
            </button>
          ))}
        </div>

        {settings.themes.activeTheme === 'custom' && (
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">कस्टम कलर्स</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: 'primary', label: 'प्राइमरी कलर', value: settings.themes.customColors.primary },
                { key: 'secondary', label: 'सेकेंडरी कलर', value: settings.themes.customColors.secondary },
                { key: 'accent', label: 'ऐक्सेंट कलर', value: settings.themes.customColors.accent }
              ].map((color) => (
                <div key={color.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      className="w-16 h-10 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color.value}
                      onChange={(e) => {
                        const newColors = { ...settings.themes.customColors };
                        newColors[color.key] = e.target.value;
                        handleSettingChange('themes', 'customColors', newColors);
                      }}
                      className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderChatTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900 dark:text-white">
          <MessageSquare className="w-5 h-5 mr-2 text-teal-600" />
          चैट सेटिंग्स
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'enableChat', label: 'चैट सक्षम करें', desc: 'अन्य उपयोगकर्ताओं के साथ चैट करने की सुविधा' },
            { key: 'soundNotifications', label: 'साउंड नोटिफिकेशन', desc: 'नए मैसेज आने पर साउंड प्ले करें' },
            { key: 'typingIndicator', label: 'टाइपिंग इंडिकेटर', desc: 'दूसरे उपयोगकर्ता के टाइप करने का संकेत दिखाएं' },
            { key: 'readReceipts', label: 'रीड रिसीट', desc: 'मैसेज पढ़े जाने की जानकारी दिखाएं' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
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

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">चैट फीचर्स</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• रियल-टाइम मैसेजिंग</li>
            <li>• ग्रुप चैट और प्राइवेट चैट</li>
            <li>• फाइल शेयरिंग</li>
            <li>• वॉइस मैसेज</li>
            <li>• ट्रेडिंग सिग्नल शेयर करना</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Other tab render functions remain similar but with dark mode support...

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'notifications': return renderNotificationsTab();
      case 'trading': return renderTradingTab();
      case 'risk': return renderRiskTab();
      case 'display': return renderDisplayTab();
      case 'privacy': return renderPrivacyTab();
      case 'api': return renderApiTab();
      case 'themes': return renderThemesTab();
      case 'chat': return renderChatTab();
      default: return renderNotificationsTab();
    }
  };

  if (loading) {
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
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">सेटिंग्स</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">अपने ट्रेडिंग अनुभव को कस्टमाइज़ करें</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
              बदलाव सेव नहीं हुए
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'सेव हो रहा...' : 'बदलाव सेव करें'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto px-4">
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">ऑटो ट्रेडिंग</p>
          <p className={`text-lg font-bold ${settings.trading.autoTradeExecution ? 'text-green-600' : 'text-gray-400'}`}>
            {settings.trading.autoTradeExecution ? 'सक्रिय' : 'निष्क्रिय'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">थीम</p>
          <p className="text-lg font-bold text-purple-600 capitalize">
            {settings.themes.activeTheme === 'custom' ? 'कस्टम' : settings.themes.activeTheme}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">2FA स्टेटस</p>
          <p className={`text-lg font-bold ${settings.privacy.twoFactorAuth ? 'text-green-600' : 'text-red-600'}`}>
            {settings.privacy.twoFactorAuth ? 'सक्षम' : 'अक्षम'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">चैट</p>
          <p className={`text-lg font-bold ${settings.chat.enableChat ? 'text-green-600' : 'text-gray-400'}`}>
            {settings.chat.enableChat ? 'सक्षम' : 'अक्षम'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
