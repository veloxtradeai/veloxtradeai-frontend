import React, { useState } from 'react';
import { 
  Save, Bell, Shield, Globe, Moon, Download, 
  Activity, Lock, Mail, MessageSquare, Smartphone, 
  AlertCircle, Target, TrendingUp, Clock, Eye, EyeOff,
  CreditCard, Database, Zap, RefreshCw
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      whatsappAlerts: true,
      tradeExecuted: true,
      stopLossHit: true,
      targetAchieved: true,
      marketCloseAlerts: false,
      priceAlerts: true,
      newsAlerts: false
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
      trailSLAfterProfit: true
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
      maxDrawdown: 15
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
      chartType: 'candlestick',
      gridLines: true
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
      autoLogout: true
    },
    
    api: {
      allowThirdPartyAccess: false,
      webhookEnabled: false,
      rateLimit: 'medium',
      logRetention: '30days',
      apiKey: '****************',
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
      autoSync: true,
      syncInterval: 5
    }
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
      // REAL API CALL - यहां आपका बैकएंड API आएगा
      const response = await fetch('/api/settings/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'सेटिंग्स सफलतापूर्वक सहेजी गईं!');
        setHasChanges(false);
      } else {
        throw new Error('सेटिंग्स सहेजने में त्रुटि');
      }
    } catch (error) {
      console.error('सेटिंग्स सेव त्रुटि:', error);
      alert('सेटिंग्स सहेजने में असफल। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('क्या आप सभी सेटिंग्स को डिफ़ॉल्ट पर रीसेट करना चाहते हैं?')) {
      // Reset to default settings
      const defaultSettings = {
        notifications: {
          emailAlerts: true,
          smsAlerts: false,
          pushNotifications: true,
          whatsappAlerts: true,
          tradeExecuted: true,
          stopLossHit: true,
          targetAchieved: true,
          marketCloseAlerts: false,
          priceAlerts: true,
          newsAlerts: false
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
          trailSLAfterProfit: true
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
          maxDrawdown: 15
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
          chartType: 'candlestick',
          gridLines: true
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
          autoLogout: true
        },
        api: {
          allowThirdPartyAccess: false,
          webhookEnabled: false,
          rateLimit: 'medium',
          logRetention: '30days',
          apiKey: '****************',
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
          autoSync: true,
          syncInterval: 5
        }
      };
      
      setSettings(defaultSettings);
      setHasChanges(true);
      alert('सभी सेटिंग्स डिफ़ॉल्ट पर रीसेट की गईं। सेव बटन दबाएं।');
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

  const handleRegenerateApiKey = async () => {
    if (window.confirm('क्या आप नया API की जेनरेट करना चाहते हैं? पुराना की काम करना बंद कर देगा।')) {
      try {
        const response = await fetch('/api/generate-new-key', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          handleSettingChange('api', 'apiKey', data.newApiKey);
          alert('नया API की सफलतापूर्वक जेनरेट हो गया!');
        }
      } catch (error) {
        alert('API की जेनरेट करने में त्रुटि');
      }
    }
  };

  const tabs = [
    { id: 'notifications', label: 'नोटिफिकेशन', icon: <Bell className="w-4 h-4" /> },
    { id: 'trading', label: 'ट्रेडिंग', icon: <Activity className="w-4 h-4" /> },
    { id: 'risk', label: 'रिस्क मैनेजमेंट', icon: <Shield className="w-4 h-4" /> },
    { id: 'display', label: 'डिस्प्ले', icon: <Moon className="w-4 h-4" /> },
    { id: 'privacy', label: 'प्राइवेसी और सिक्योरिटी', icon: <Lock className="w-4 h-4" /> },
    { id: 'api', label: 'API सेटिंग्स', icon: <Globe className="w-4 h-4" /> },
    { id: 'subscription', label: 'सब्सक्रिप्शन', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'broker', label: 'ब्रोकर सेटिंग्स', icon: <Database className="w-4 h-4" /> }
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
      <div className={`w-11 h-6 ${disabled ? 'bg-gray-300' : 'bg-gray-200'} rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
    </label>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
          <Bell className="w-5 h-5 mr-2 text-blue-600" />
          अलर्ट चैनल्स
        </h3>
        <p className="text-gray-600 mb-6">चुनें कि आप नोटिफिकेशन कैसे प्राप्त करना चाहते हैं</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'emailAlerts', label: 'ईमेल अलर्ट्स', desc: 'ईमेल के माध्यम से नोटिफिकेशन प्राप्त करें', icon: <Mail className="w-5 h-5" /> },
            { key: 'smsAlerts', label: 'SMS अलर्ट्स', desc: 'अपने मोबाइल पर SMS प्राप्त करें', icon: <MessageSquare className="w-5 h-5" /> },
            { key: 'pushNotifications', label: 'पुश नोटिफिकेशन', desc: 'ब्राउज़र और ऐप नोटिफिकेशन', icon: <Smartphone className="w-5 h-5" /> },
            { key: 'whatsappAlerts', label: 'WhatsApp अलर्ट्स', desc: 'अलर्ट्स के लिए WhatsApp मैसेज', icon: <MessageSquare className="w-5 h-5" /> }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  {React.cloneElement(item.icon, { className: "w-5 h-5 text-blue-600" })}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
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

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-gray-800">ट्रेड इवेंट्स</h3>
        <p className="text-gray-600 mb-6">ट्रेडिंग एक्टिविटी के लिए नोटिफिकेशन कॉन्फ़िगर करें</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'tradeExecuted', label: 'ट्रेड एक्जीक्यूट हुआ', desc: 'जब कोई ट्रेड सफलतापूर्वक एक्जीक्यूट हो जाए', icon: <Zap className="w-5 h-5" /> },
            { key: 'stopLossHit', label: 'स्टॉप लॉस हिट', desc: 'जब स्टॉप लॉस ट्रिगर हो जाए', icon: <AlertCircle className="w-5 h-5" /> },
            { key: 'targetAchieved', label: 'टार्गेट अचीव्ड', desc: 'जब प्रॉफिट टार्गेट पहुंच जाए', icon: <Target className="w-5 h-5" /> },
            { key: 'marketCloseAlerts', label: 'मार्केट क्लोज समरी', desc: 'दैनिक पोर्टफोलियो समरी', icon: <Clock className="w-5 h-5" /> },
            { key: 'priceAlerts', label: 'प्राइस अलर्ट्स', desc: 'कस्टम प्राइस लेवल नोटिफिकेशन', icon: <TrendingUp className="w-5 h-5" /> },
            { key: 'newsAlerts', label: 'न्यूज अलर्ट्स', desc: 'महत्वपूर्ण मार्केट न्यूज अपडेट्स', icon: <Bell className="w-5 h-5" /> }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  {React.cloneElement(item.icon, { className: "w-5 h-5 text-green-600" })}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
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

  const renderTradingTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg mb-6 flex items-center text-gray-800">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          ऑटो ट्रेडिंग कॉन्फ़िगरेशन
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="font-bold text-gray-800">ऑटो ट्रेड एक्जीक्यूशन</p>
              <p className="text-sm text-gray-600">AI सिग्नल्स के आधार पर ऑटोमैटिकली ट्रेड्स एक्जीक्यूट करें</p>
            </div>
            <ToggleSwitch
              checked={settings.trading.autoTradeExecution}
              onChange={(e) => handleSettingChange('trading', 'autoTradeExecution', e.target.checked)}
              id="autoTrade"
            />
          </div>

          {settings.trading.autoTradeExecution && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 mb-1">⚠️ ऑटो ट्रेडिंग एनेबल्ड</p>
                  <p className="text-sm text-yellow-700">आपके रिस्क सेटिंग्स के आधार पर ट्रेड्स ऑटोमैटिकली एक्जीक्यूट होंगे। नियमित रूप से अपने अकाउंट की मॉनिटरिंग करें।</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">मैक्स ओपन पोजीशन्स</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.trading.maxPositions}
                  onChange={(e) => handleSettingChange('trading', 'maxPositions', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">मैक्स रिस्क प्रति ट्रेड (%)</label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={settings.trading.maxRiskPerTrade}
                  onChange={(e) => handleSettingChange('trading', 'maxRiskPerTrade', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">0.1%</span>
                  <span className="font-medium">{settings.trading.maxRiskPerTrade}%</span>
                  <span className="text-sm text-gray-500">10%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">डिफ़ॉल्ट क्वांटिटी</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={settings.trading.defaultQuantity}
                  onChange={(e) => handleSettingChange('trading', 'defaultQuantity', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">मैक्स डेली लॉस (%)</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="0.5"
                  value={settings.trading.maxDailyLoss}
                  onChange={(e) => handleSettingChange('trading', 'maxDailyLoss', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">1%</span>
                  <span className="font-medium">{settings.trading.maxDailyLoss}%</span>
                  <span className="text-sm text-gray-500">50%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">स्लिपेज टॉलरेंस (%)</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={settings.trading.slippageTolerance}
                  onChange={(e) => handleSettingChange('trading', 'slippageTolerance', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">0.1%</span>
                  <span className="font-medium">{settings.trading.slippageTolerance}%</span>
                  <span className="text-sm text-gray-500">5%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">पार्शियल एक्जिट</p>
                  <p className="text-sm text-gray-600">प्रॉफिट में ट्रेड का आंशिक एक्जिट करें</p>
                </div>
                <ToggleSwitch
                  checked={settings.trading.partialExit}
                  onChange={(e) => handleSettingChange('trading', 'partialExit', e.target.checked)}
                  id="partialExit"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-medium text-gray-800">शॉर्ट सेलिंग की अनुमति दें</p>
                <p className="text-sm text-gray-600">शॉर्ट सेलिंग ट्रेड्स को एनेबल करें</p>
              </div>
              <ToggleSwitch
                checked={settings.trading.allowShortSelling}
                onChange={(e) => handleSettingChange('trading', 'allowShortSelling', e.target.checked)}
                id="shortSelling"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-medium text-gray-800">ट्रेड कन्फर्मेशन</p>
                <p className="text-sm text-gray-600">प्रत्येक ट्रेड के लिए मैनुअल कन्फर्मेशन की आवश्यकता है</p>
              </div>
              <ToggleSwitch
                checked={settings.trading.requireConfirmation}
                onChange={(e) => handleSettingChange('trading', 'requireConfirmation', e.target.checked)}
                id="confirmation"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // बाकी tabs के लिए भी इसी तरह का स्ट्रक्चर रखें...

  const renderDisplayTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg mb-6 flex items-center text-gray-800">
          <Moon className="w-5 h-5 mr-2 text-blue-600" />
          थीम और अपीयरेंस
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">थीम सिलेक्शन</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'light', label: 'लाइट', color: 'bg-white border-gray-300' },
                  { value: 'dark', label: 'डार्क', color: 'bg-gray-900 text-white' },
                  { value: 'blue', label: 'ब्लू', color: 'bg-blue-50 border-blue-200' },
                  { value: 'green', label: 'ग्रीन', color: 'bg-green-50 border-green-200' }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handleSettingChange('display', 'theme', theme.value)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                      settings.display.theme === theme.value 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${theme.color}`}
                  >
                    <div className="w-12 h-8 rounded-lg mb-2 bg-gradient-to-r from-gray-300 to-gray-100"></div>
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="gu">ગુજરાતી</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { key: 'showAdvancedCharts', label: 'एडवांस्ड चार्ट्स', desc: 'एडवांस्ड चार्टिंग टूल्स और इंडिकेटर्स दिखाएं' },
                { key: 'compactMode', label: 'कॉम्पैक्ट मोड', desc: 'अधिक डेटा डेंसिटी के लिए कॉम्पैक्ट व्यू का उपयोग करें' },
                { key: 'showIndicators', label: 'टेक्निकल इंडिकेटर्स', desc: 'चार्ट्स पर टेक्निकल इंडिकेटर्स डिस्प्ले करें' },
                { key: 'gridLines', label: 'ग्रिड लाइन्स', desc: 'चार्ट्स पर ग्रिड लाइन्स दिखाएं' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.display[item.key]}
                    onChange={(e) => handleSettingChange('display', item.key, e.target.checked)}
                    id={`display-${item.key}`}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ऑटो रिफ्रेश इंटरवल</label>
              <select
                value={settings.display.refreshInterval}
                onChange={(e) => handleSettingChange('display', 'refreshInterval', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="5">5 सेकंड (रियल-टाइम)</option>
                <option value="10">10 सेकंड</option>
                <option value="30">30 सेकंड</option>
                <option value="60">1 मिनट</option>
                <option value="0">मैनुअल रिफ्रेश</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg mb-6 flex items-center text-gray-800">
          <Lock className="w-5 h-5 mr-2 text-blue-600" />
          सिक्योरिटी और प्राइवेसी
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="font-bold text-gray-800">टू-फैक्टर ऑथेंटिकेशन</p>
              <p className="text-sm text-gray-600">अपने अकाउंट में एक अतिरिक्त सुरक्षा परत जोड़ें</p>
            </div>
            <ToggleSwitch
              checked={settings.privacy.twoFactorAuth}
              onChange={(e) => handleSettingChange('privacy', 'twoFactorAuth', e.target.checked)}
              id="twoFactor"
            />
          </div>

          {settings.privacy.twoFactorAuth && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 mb-1">✅ 2FA एनेबल्ड</p>
                  <p className="text-sm text-green-700">आपका अकाउंट टू-फैक्टर ऑथेंटिकेशन से प्रोटेक्टेड है।</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'publicProfile', label: 'पब्लिक प्रोफाइल', desc: 'दूसरों को अपना प्रोफाइल देखने की अनुमति दें' },
              { key: 'showPortfolioValue', label: 'पोर्टफोलियो वैल्यू दिखाएं', desc: 'प्रोफाइल में पोर्टफोलियो वैल्यू डिस्प्ले करें' },
              { key: 'shareTradingHistory', label: 'ट्रेडिंग हिस्ट्री शेयर करें', desc: 'अनामित ट्रेडिंग हिस्ट्री शेयर करें' },
              { key: 'showRealName', label: 'रियल नेम दिखाएं', desc: 'कम्युनिटी में अपना रियल नेम डिस्प्ले करें' },
              { key: 'hideBalance', label: 'बैलेंस छुपाएं', desc: 'डैशबोर्ड से बैलेंस छुपाएं' },
              { key: 'autoLogout', label: 'ऑटो लॉगआउट', desc: 'इनएक्टिविटी के बाद ऑटोमैटिक लॉगआउट' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                <ToggleSwitch
                  checked={settings.privacy[item.key]}
                  onChange={(e) => handleSettingChange('privacy', item.key, e.target.checked)}
                  id={`privacy-${item.key}`}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">सेशन टाइमआउट (मिनट)</label>
              <select
                value={settings.privacy.sessionTimeout}
                onChange={(e) => handleSettingChange('privacy', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="15">15 मिनट</option>
                <option value="30">30 मिनट</option>
                <option value="60">1 घंटा</option>
                <option value="120">2 घंटे</option>
                <option value="0">कभी नहीं (अनुशंसित नहीं)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">डेटा शेयरिंग प्रेफरेंसेज</label>
              <select
                value={settings.privacy.dataSharing}
                onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">कोई डेटा शेयरिंग नहीं</option>
                <option value="anonymous">अनामित एग्रीगेटेड डेटा</option>
                <option value="full">फुल डेटा (AI एल्गोरिदम सुधारें)</option>
              </select>
              <p className="text-sm text-gray-600 mt-2">
                {settings.privacy.dataSharing === 'none' && 'कोई डेटा शेयर नहीं किया जाएगा। उच्चतम प्राइवेसी लेवल।'}
                {settings.privacy.dataSharing === 'anonymous' && 'सेवाओं में सुधार के लिए केवल अनामित, एग्रीगेटेड डेटा शेयर किया जाएगा।'}
                {settings.privacy.dataSharing === 'full' && 'आपका ट्रेडिंग डेटा हमारे AI एल्गोरिदम को सुधारने में मदद करेगा। हम आपके योगदान की कदर करते हैं!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg mb-6 text-gray-800">डेटा मैनेजमेंट</h3>
        
        <div className="space-y-4">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <Download className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <p className="font-medium text-left text-gray-800">सभी सेटिंग्स एक्सपोर्ट करें</p>
                <p className="text-sm text-gray-600 text-left">अपनी सेटिंग्स JSON फ़ाइल के रूप में डाउनलोड करें</p>
              </div>
            </div>
            <span className="text-blue-600 font-medium">एक्सपोर्ट</span>
          </button>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-3 text-orange-600" />
              <div>
                <p className="font-medium text-left text-gray-800">डिफ़ॉल्ट सेटिंग्स पर रीसेट करें</p>
                <p className="text-sm text-gray-600 text-left">सभी सेटिंग्स को फ़ैक्टरी डिफ़ॉल्ट पर रीसेट करें</p>
              </div>
            </div>
            <span className="text-orange-600 font-medium">रीसेट</span>
          </button>

          <button
            onClick={() => alert('अकाउंट डिलीशन रिक्वेस्ट इनिशिएट की गई। हमारी टीम 24 घंटे के भीतर आपसे संपर्क करेगी।')}
            className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 flex items-center justify-center text-red-600">
                🗑️
              </div>
              <div>
                <p className="font-bold text-left text-red-700">अकाउंट डिलीट करें</p>
                <p className="text-sm text-red-600 text-left">स्थायी रूप से अपना अकाउंट और सभी डेटा डिलीट करें</p>
              </div>
            </div>
            <span className="text-red-700 font-bold">डिलीट</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Rest of the tabs follow similar pattern...

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">सेटिंग्स और प्रेफरेंसेज</h1>
            <p className="text-gray-600 mt-2">अपना ट्रेडिंग एक्सपीरियंस कस्टमाइज़ करें और अकाउंट प्रेफरेंसेज मैनेज करें</p>
          </div>
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                अनसेव्ड बदलाव
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'सेव हो रहा है...' : 'बदलाव सेव करें'}</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 md:px-6 md:py-4 font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === tab.id ? 'bg-blue-100' : 'bg-gray-200'
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
            {renderActiveTab()}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">ऑटो ट्रेडिंग</p>
            <p className={`text-lg font-bold ${settings.trading.autoTradeExecution ? 'text-green-600' : 'text-gray-500'}`}>
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
              {settings.privacy.twoFactorAuth ? 'एनेबल्ड' : 'डिसेबल्ड'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">थीम</p>
            <p className="text-lg font-bold text-blue-600 capitalize">{settings.display.theme}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
