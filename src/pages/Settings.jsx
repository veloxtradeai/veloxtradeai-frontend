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
  Zap,
  Target,
  AlertTriangle,
  User,
  Database,
  Network,
  Palette,
  Eye,
  EyeOff,
  Trash2,
  Key,
  Smartphone,
  Mail,
  Volume2
} from 'lucide-react';
import { settingsAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const Settings = () => {
  const { t, isHindi } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);

  // लोड सेटिंग्स
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const result = await settingsAPI.getSettings();
      if (result?.success) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleNestedChange = (category, subCategory, key, value) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: {
          ...prev[category][subCategory],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges || !settings) {
      alert(isHindi ? 'कोई बदलाव नहीं है!' : 'No changes to save!');
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await settingsAPI.saveSettings(settings);
      if (result?.success) {
        setHasChanges(false);
        alert(isHindi ? '✅ सेटिंग्स सेव हुई!' : '✅ Settings saved!');
      } else {
        alert(isHindi ? '❌ सेटिंग्स सेव नहीं हुई' : '❌ Settings save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(isHindi ? '❌ सेटिंग्स सेव नहीं हुई' : '❌ Settings save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(isHindi ? 'सभी सेटिंग्स डिफॉल्ट पर रिसेट करें?' : 'Reset all settings to default?')) {
      fetchSettings();
      setHasChanges(true);
    }
  };

  const handleExportData = () => {
    if (!settings) return;
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `veloxtradeai-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const ToggleSwitch = ({ checked, onChange, id, disabled = false }) => (
    <label htmlFor={id} className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-11 h-6 ${disabled ? 'bg-gray-700' : 'bg-slate-700'} peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all ${disabled ? 'peer-checked:bg-gray-600' : 'peer-checked:bg-emerald-600'}`}></div>
    </label>
  );

  const tabs = [
    { id: 'notifications', label: isHindi ? 'नोटिफिकेशन' : 'Notifications', icon: <Bell className="w-4 h-4" />, color: 'text-blue-400' },
    { id: 'trading', label: isHindi ? 'ट्रेडिंग' : 'Trading', icon: <Activity className="w-4 h-4" />, color: 'text-emerald-400' },
    { id: 'risk', label: isHindi ? 'रिस्क मैनेजमेंट' : 'Risk Management', icon: <Shield className="w-4 h-4" />, color: 'text-amber-400' },
    { id: 'display', label: isHindi ? 'डिस्प्ले' : 'Display', icon: <Moon className="w-4 h-4" />, color: 'text-purple-400' },
    { id: 'privacy', label: isHindi ? 'प्राइवेसी' : 'Privacy & Security', icon: <Lock className="w-4 h-4" />, color: 'text-red-400' },
    { id: 'api', label: 'API', icon: <Globe className="w-4 h-4" />, color: 'text-cyan-400' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-emerald-300 text-lg">{isHindi ? 'सेटिंग्स लोड हो रही हैं...' : 'Loading settings...'}</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center p-8 bg-gradient-to-r from-slate-800/50 to-slate-900/30 rounded-2xl border border-red-500/30">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{isHindi ? 'सेटिंग्स लोड नहीं हुई' : 'Settings failed to load'}</h2>
          <p className="text-red-300/80 mb-4">{isHindi ? 'बैकेंड कनेक्शन में समस्या' : 'Backend connection issue'}</p>
          <button
            onClick={fetchSettings}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-cyan-700 transition-all"
          >
            {isHindi ? 'रिट्राय' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 p-6 rounded-2xl border border-emerald-900/40">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-400" />
          {isHindi ? 'अलर्ट चैनल' : 'Alert Channels'}
        </h3>
        <p className="text-emerald-300/70 mb-6">{isHindi ? 'नोटिफिकेशन प्राप्त करने का तरीका चुनें' : 'Choose how you want to receive notifications'}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'emailAlerts', label: isHindi ? 'ईमेल अलर्ट' : 'Email Alerts', desc: isHindi ? 'ईमेल के माध्यम से नोटिफिकेशन' : 'Receive notifications via email', icon: <Mail className="w-4 h-4" /> },
            { key: 'smsAlerts', label: isHindi ? 'SMS अलर्ट' : 'SMS Alerts', desc: isHindi ? 'मोबाइल पर SMS प्राप्त करें' : 'Get SMS on your mobile', icon: <Smartphone className="w-4 h-4" /> },
            { key: 'pushNotifications', label: isHindi ? 'पुश नोटिफिकेशन' : 'Push Notifications', desc: isHindi ? 'ब्राउज़र और ऐप नोटिफिकेशन' : 'Browser & app notifications', icon: <Bell className="w-4 h-4" /> },
            { key: 'whatsappAlerts', label: isHindi ? 'व्हाट्सएप अलर्ट' : 'WhatsApp Alerts', desc: isHindi ? 'अलर्ट के लिए व्हाट्सएप मैसेज' : 'WhatsApp messages for alerts', icon: <Volume2 className="w-4 h-4" /> }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-emerald-900/40">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-emerald-300/60">{item.desc}</p>
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

      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 p-6 rounded-2xl border border-emerald-900/40">
        <h3 className="font-bold text-lg text-white mb-4">{isHindi ? 'ट्रेड इवेंट्स' : 'Trade Events'}</h3>
        <p className="text-emerald-300/70 mb-6">{isHindi ? 'ट्रेडिंग एक्टिविटी के लिए नोटिफिकेशन कॉन्फ़िगर करें' : 'Configure notifications for trading activities'}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'tradeExecuted', label: isHindi ? 'ट्रेड एक्ज़ीक्यूट' : 'Trade Executed', desc: isHindi ? 'जब ट्रेड सफलतापूर्वक एक्ज़ीक्यूट हो' : 'When a trade is successfully executed' },
            { key: 'stopLossHit', label: isHindi ? 'स्टॉप लॉस हिट' : 'Stop Loss Hit', desc: isHindi ? 'जब स्टॉप लॉस ट्रिगर हो' : 'When stop loss is triggered' },
            { key: 'targetAchieved', label: isHindi ? 'टारगेट अचीव्ड' : 'Target Achieved', desc: isHindi ? 'जब प्रॉफिट टारगेट रीच हो' : 'When profit target is reached' },
            { key: 'marketCloseAlerts', label: isHindi ? 'मार्केट क्लोज समरी' : 'Market Close Summary', desc: isHindi ? 'दैनिक पोर्टफोलियो समरी' : 'Daily portfolio summary' },
            { key: 'priceAlerts', label: isHindi ? 'प्राइस अलर्ट' : 'Price Alerts', desc: isHindi ? 'कस्टम प्राइस लेवल नोटिफिकेशन' : 'Custom price level notifications' },
            { key: 'newsAlerts', label: isHindi ? 'न्यूज़ अलर्ट' : 'News Alerts', desc: isHindi ? 'महत्वपूर्ण मार्केट न्यूज़ अपडेट' : 'Important market news updates' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-emerald-900/40">
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-emerald-300/60">{item.desc}</p>
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
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 p-6 rounded-2xl border border-emerald-900/40">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-emerald-400" />
          {isHindi ? 'ऑटो ट्रेडिंग कॉन्फ़िगरेशन' : 'Auto Trading Configuration'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-emerald-900/40">
            <div>
              <p className="font-bold text-white">{isHindi ? 'ऑटो ट्रेड एक्ज़ीक्यूशन' : 'Auto Trade Execution'}</p>
              <p className="text-sm text-emerald-300/60">{isHindi ? 'AI सिग्नल के आधार पर स्वचालित रूप से ट्रेड एक्ज़ीक्यूट करें' : 'Automatically execute trades based on AI signals'}</p>
            </div>
            <ToggleSwitch
              checked={settings.trading.autoTradeExecution}
              onChange={(e) => handleSettingChange('trading', 'autoTradeExecution', e.target.checked)}
              id="autoTrade"
            />
          </div>

          {settings.trading.autoTradeExecution && (
            <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-500/30 rounded-xl p-4">
              <p className="font-medium text-amber-400 mb-2">⚠️ {isHindi ? 'ऑटो ट्रेडिंग एनेबल्ड' : 'Auto Trading Enabled'}</p>
              <p className="text-sm text-amber-300/80">{isHindi ? 'ट्रेड आपके रिस्क सेटिंग्स के आधार पर स्वचालित रूप से एक्ज़ीक्यूट होंगे। अपने अकाउंट की नियमित निगरानी करें।' : 'Trades will be executed automatically based on your risk settings. Monitor your account regularly.'}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'maxPositions', label: isHindi ? 'मैक्स ओपन पोजिशन' : 'Max Open Positions', value: settings.trading.maxPositions, min: 1, max: 20, unit: '' },
              { key: 'maxRiskPerTrade', label: isHindi ? 'प्रति ट्रेड मैक्स रिस्क' : 'Max Risk Per Trade', value: settings.trading.maxRiskPerTrade, min: 0.1, max: 10, unit: '%' },
              { key: 'maxDailyLoss', label: isHindi ? 'मैक्स डेली लॉस' : 'Max Daily Loss', value: settings.trading.maxDailyLoss, min: 1, max: 50, unit: '%' },
              { key: 'defaultQuantity', label: isHindi ? 'डिफॉल्ट क्वांटिटी' : 'Default Quantity', value: settings.trading.defaultQuantity, min: 1, max: 1000, unit: isHindi ? ' शेयर' : ' shares' },
              { key: 'slippageTolerance', label: isHindi ? 'स्लिपेज टॉलरेंस' : 'Slippage Tolerance', value: settings.trading.slippageTolerance, min: 0.1, max: 5, unit: '%' }
            ].map((item) => (
              <div key={item.key} className="bg-slate-800/30 p-4 rounded-xl border border-emerald-900/40">
                <label className="block text-sm font-medium text-emerald-300 mb-2">{item.label}</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={item.key.includes('Risk') || item.key.includes('slippage') ? 0.1 : 1}
                    value={item.value}
                    onChange={(e) => handleSettingChange('trading', item.key, parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400"
                  />
                  <span className="ml-3 font-bold text-white min-w-[60px]">{item.value}{item.unit}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-300/60 mt-1">
                  <span>{item.min}{item.unit}</span>
                  <span>{item.max}{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-emerald-900/40">
              <div>
                <p className="font-medium text-white">{isHindi ? 'शॉर्ट सेलिंग की अनुमति दें' : 'Allow Short Selling'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'शॉर्ट सेलिंग ट्रेड्स को एनेबल करें' : 'Enable short selling trades'}</p>
              </div>
              <ToggleSwitch
                checked={settings.trading.allowShortSelling}
                onChange={(e) => handleSettingChange('trading', 'allowShortSelling', e.target.checked)}
                id="shortSelling"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-emerald-900/40">
              <div>
                <p className="font-medium text-white">{isHindi ? 'ट्रेड कन्फर्मेशन' : 'Trade Confirmation'}</p>
                <p className="text-sm text-emerald-300/60">{isHindi ? 'प्रत्येक ट्रेड के लिए मैन्युअल कन्फर्मेशन आवश्यक' : 'Require manual confirmation for each trade'}</p>
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

  const renderRiskTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 p-6 rounded-2xl border border-amber-900/40">
          <h3 className="font-bold text-lg text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-amber-400" />
            {isHindi ? 'स्टॉप लॉस सेटिंग्स' : 'Stop Loss Settings'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">{isHindi ? 'स्टॉप लॉस टाइप' : 'Stop Loss Type'}</label>
              <select
                value={settings.risk.stopLossType}
                onChange={(e) => handleSettingChange('risk', 'stopLossType', e.target.value)}
                className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="percentage" className="bg-slate-900">{isHindi ? 'प्रतिशत (%)' : 'Percentage (%)'}</option>
                <option value="absolute" className="bg-slate-900">{isHindi ? 'एब्सोल्यूट वैल्यू (₹)' : 'Absolute Value (₹)'}</option>
                <option value="atr" className="bg-slate-900">ATR Based</option>
                <option value="support" className="bg-slate-900">{isHindi ? 'सपोर्ट/रेजिस्टेंस' : 'Support/Resistance'}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                {settings.risk.stopLossType === 'percentage' ? (isHindi ? 'स्टॉप लॉस प्रतिशत' : 'Stop Loss Percentage') : 
                 settings.risk.stopLossType === 'absolute' ? (isHindi ? 'स्टॉप लॉस अमाउंट (₹)' : 'Stop Loss Amount (₹)') :
                 settings.risk.stopLossType === 'atr' ? 'ATR Multiplier' : (isHindi ? 'लेवल से दूरी' : 'Distance from Level')}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={settings.risk.stopLossValue}
                  onChange={(e) => handleSettingChange('risk', 'stopLossValue', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
                />
                <span className="font-bold text-white min-w-[80px] text-lg">
                  {settings.risk.stopLossValue}
                  {settings.risk.stopLossType === 'percentage' ? '%' : 
                   settings.risk.stopLossType === 'absolute' ? '₹' : 'x'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-amber-900/40">
              <div>
                <p className="font-medium text-white">{isHindi ? 'ट्रेलिंग स्टॉप लॉस' : 'Trailing Stop Loss'}</p>
                <p className="text-sm text-amber-300/60">{isHindi ? 'प्राइस मूवमेंट के साथ स्वचालित रूप से स्टॉप लॉस एडजस्ट करें' : 'Automatically adjust stop loss as price moves'}</p>
              </div>
              <ToggleSwitch
                checked={settings.risk.trailingStopLoss}
                onChange={(e) => handleSettingChange('risk', 'trailingStopLoss', e.target.checked)}
                id="trailingStop"
              />
            </div>

            {settings.risk.trailingStopLoss && (
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">{isHindi ? 'ट्रेलिंग दूरी (%)' : 'Trailing Distance (%)'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.risk.trailingStopDistance}
                  onChange={(e) => handleSettingChange('risk', 'trailingStopDistance', parseFloat(e.target.value))}
                  className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  min="0.5"
                  max="5"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 p-6 rounded-2xl border border-emerald-900/40">
          <h3 className="font-bold text-lg text-white mb-4">{isHindi ? 'टेक प्रॉफिट और रिस्क मैनेजमेंट' : 'Take Profit & Risk Management'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">{isHindi ? 'टेक प्रॉफिट टाइप' : 'Take Profit Type'}</label>
              <select
                value={settings.risk.takeProfitType}
                onChange={(e) => handleSettingChange('risk', 'takeProfitType', e.target.value)}
                className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="percentage" className="bg-slate-900">{isHindi ? 'प्रतिशत (%)' : 'Percentage (%)'}</option>
                <option value="absolute" className="bg-slate-900">{isHindi ? 'एब्सोल्यूट वैल्यू (₹)' : 'Absolute Value (₹)'}</option>
                <option value="rr" className="bg-slate-900">{isHindi ? 'रिस्क/रिवार्ड रेशियो' : 'Risk/Reward Ratio'}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                {settings.risk.takeProfitType === 'percentage' ? (isHindi ? 'टेक प्रॉफिट %' : 'Take Profit %') : 
                 settings.risk.takeProfitType === 'absolute' ? (isHindi ? 'टेक प्रॉफिट अमाउंट (₹)' : 'Take Profit Amount (₹)') : 
                 (isHindi ? 'रिस्क/रिवार्ड रेशियो' : 'Risk/Reward Ratio')}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="50"
                  step={settings.risk.takeProfitType === 'rr' ? 0.5 : 1}
                  value={settings.risk.takeProfitValue}
                  onChange={(e) => handleSettingChange('risk', 'takeProfitValue', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400"
                />
                <span className="font-bold text-white min-w-[80px] text-lg">
                  {settings.risk.takeProfitValue}
                  {settings.risk.takeProfitType === 'percentage' ? '%' : 
                   settings.risk.takeProfitType === 'absolute' ? '₹' : ':1'}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-xl p-4">
              <h4 className="font-bold text-emerald-400 mb-2">{isHindi ? 'वर्तमान रिस्क/रिवार्ड' : 'Current Risk/Reward'}</h4>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">1:{settings.risk.riskRewardRatio}</div>
                  <div className="text-sm text-emerald-300/60">{isHindi ? 'रिस्क:रिवार्ड रेशियो' : 'Risk:Reward Ratio'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {((settings.risk.takeProfitValue / settings.risk.stopLossValue) || 0).toFixed(1)}:1
                  </div>
                  <div className="text-sm text-emerald-300/60">{isHindi ? 'वर्तमान सेटअप' : 'Current Setup'}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">{isHindi ? 'मैक्स पोर्टफोलियो रिस्क (%)' : 'Max Portfolio Risk (%)'}</label>
              <input
                type="number"
                step="0.5"
                value={settings.risk.maxPortfolioRisk}
                onChange={(e) => handleSettingChange('risk', 'maxPortfolioRisk', parseFloat(e.target.value))}
                className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                min="1"
                max="30"
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
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 p-6 rounded-2xl border border-purple-900/40">
          <h3 className="font-bold text-lg text-white mb-4 flex items-center">
            <Moon className="w-5 h-5 mr-2 text-purple-400" />
            {isHindi ? 'थीम और अपीयरेंस' : 'Theme & Appearance'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-3">{isHindi ? 'थीम सिलेक्शन' : 'Theme Selection'}</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'dark', label: isHindi ? 'डार्क' : 'Dark', color: 'from-gray-800 to-slate-900' },
                  { value: 'light', label: isHindi ? 'लाइट' : 'Light', color: 'from-gray-100 to-white' },
                  { value: 'auto', label: isHindi ? 'ऑटो' : 'Auto', color: 'from-gray-800 via-slate-700 to-gray-100' }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handleSettingChange('display', 'theme', theme.value)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                      settings.display.theme === theme.value 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-emerald-900/40 hover:border-emerald-500/60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full mb-2 bg-gradient-to-br ${theme.color}`}></div>
                    <span className="text-sm font-medium text-white capitalize">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">{isHindi ? 'भाषा' : 'Language'}</label>
              <select
                value={settings.display.language}
                onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="en" className="bg-slate-900">English</option>
                <option value="hi" className="bg-slate-900">हिंदी (Hindi)</option>
              </select>
            </div>

            {settings.display.theme === 'dark' && (
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">{isHindi ? 'डार्क मोड इंटेंसिटी' : 'Dark Mode Intensity'}</label>
                <select
                  value={settings.display.darkModeIntensity}
                  onChange={(e) => handleSettingChange('display', 'darkModeIntensity', e.target.value)}
                  className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="soft" className="bg-slate-900">{isHindi ? 'सॉफ्ट' : 'Soft'}</option>
                  <option value="medium" className="bg-slate-900">{isHindi ? 'मीडियम' : 'Medium'}</option>
                  <option value="deep" className="bg-slate-900">{isHindi ? 'डीप' : 'Deep'}</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 p-6 rounded-2xl border border-emerald-900/40">
          <h3 className="font-bold text-lg text-white mb-4">{isHindi ? 'डिस्प्ले प्रेफरेंस' : 'Display Preferences'}</h3>
          <div className="space-y-4">
            {[
              { key: 'showAdvancedCharts', label: isHindi ? 'एडवांस्ड चार्ट' : 'Advanced Charts', desc: isHindi ? 'एडवांस्ड चार्टिंग टूल्स और इंडिकेटर्स दिखाएं' : 'Show advanced charting tools and indicators' },
              { key: 'compactMode', label: isHindi ? 'कॉम्पैक्ट मोड' : 'Compact Mode', desc: isHindi ? 'अधिक डेटा डेंसिटी के लिए कॉम्पैक्ट व्यू का उपयोग करें' : 'Use compact view for more data density' },
              { key: 'showIndicators', label: isHindi ? 'टेक्निकल इंडिकेटर्स' : 'Technical Indicators', desc: isHindi ? 'चार्ट पर टेक्निकल इंडिकेटर्स डिस्प्ले करें' : 'Display technical indicators on charts' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-emerald-900/40">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-emerald-300/60">{item.desc}</p>
                </div>
                <ToggleSwitch
                  checked={settings.display[item.key]}
                  onChange={(e) => handleSettingChange('display', item.key, e.target.checked)}
                  id={`display-${item.key}`}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">{isHindi ? 'ऑटो रिफ्रेश इंटरवल' : 'Auto Refresh Interval'}</label>
              <select
                value={settings.display.refreshInterval}
                onChange={(e) => handleSettingChange('display', 'refreshInterval', parseInt(e.target.value))}
                className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="10" className="bg-slate-900">10 {isHindi ? 'सेकंड (रियल-टाइम)' : 'seconds (Real-time)'}</option>
                <option value="30" className="bg-slate-900">30 {isHindi ? 'सेकंड' : 'seconds'}</option>
                <option value="60" className="bg-slate-900">1 {isHindi ? 'मिनट' : 'minute'}</option>
                <option value="300" className="bg-slate-900">5 {isHindi ? 'मिनट' : 'minutes'}</option>
                <option value="0" className="bg-slate-900">{isHindi ? 'मैन्युअल रिफ्रेश' : 'Manual Refresh'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 p-6 rounded-2xl border border-red-900/40">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-red-400" />
          {isHindi ? 'सिक्योरिटी और प्राइवेसी' : 'Security & Privacy'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-red-900/40">
            <div>
              <p className="font-bold text-white">{isHindi ? 'टू-फैक्टर ऑथेंटिकेशन' : 'Two-Factor Authentication'}</p>
              <p className="text-sm text-red-300/60">{isHindi ? 'अपने अकाउंट में एक अतिरिक्त सुरक्षा परत जोड़ें' : 'Add an extra layer of security to your account'}</p>
            </div>
            <ToggleSwitch
              checked={settings.privacy.twoFactorAuth}
              onChange={(e) => handleSettingChange('privacy', 'twoFactorAuth', e.target.checked)}
              id="twoFactor"
            />
          </div>

          {settings.privacy.twoFactorAuth && (
            <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="font-medium text-emerald-400 mb-2">✅ {isHindi ? '2FA एनेबल्ड' : '2FA Enabled'}</p>
              <p className="text-sm text-emerald-300/80">{isHindi ? 'आपका अकाउंट टू-फैक्टर ऑथेंटिकेशन से सुरक्षित है।' : 'Your account is protected with two-factor authentication.'}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'publicProfile', label: isHindi ? 'पब्लिक प्रोफाइल' : 'Public Profile', desc: isHindi ? 'दूसरों को आपकी प्रोफाइल देखने की अनुमति दें' : 'Allow others to view your profile' },
              { key: 'showPortfolioValue', label: isHindi ? 'पोर्टफोलियो वैल्यू दिखाएं' : 'Show Portfolio Value', desc: isHindi ? 'प्रोफाइल में पोर्टफोलियो वैल्यू डिस्प्ले करें' : 'Display portfolio value in profile' },
              { key: 'shareTradingHistory', label: isHindi ? 'ट्रेडिंग हिस्ट्री शेयर करें' : 'Share Trading History', desc: isHindi ? 'अनामित ट्रेडिंग हिस्ट्री शेयर करें' : 'Share anonymized trading history' },
              { key: 'showRealName', label: isHindi ? 'असली नाम दिखाएं' : 'Show Real Name', desc: isHindi ? 'कम्युनिटी में अपना असली नाम डिस्प्ले करें' : 'Display your real name in community' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-red-900/40">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-red-300/60">{item.desc}</p>
                </div>
                <ToggleSwitch
                  checked={settings.privacy[item.key]}
                  onChange={(e) => handleSettingChange('privacy', item.key, e.target.checked)}
                  id={`privacy-${item.key}`}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-300 mb-2">{isHindi ? 'सेशन टाइमआउट (मिनट)' : 'Session Timeout (minutes)'}</label>
            <select
              value={settings.privacy.sessionTimeout}
              onChange={(e) => handleSettingChange('privacy', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="15" className="bg-slate-900">15 {isHindi ? 'मिनट' : 'minutes'}</option>
              <option value="30" className="bg-slate-900">30 {isHindi ? 'मिनट' : 'minutes'}</option>
              <option value="60" className="bg-slate-900">1 {isHindi ? 'घंटा' : 'hour'}</option>
              <option value="120" className="bg-slate-900">2 {isHindi ? 'घंटे' : 'hours'}</option>
              <option value="0" className="bg-slate-900">{isHindi ? 'कभी नहीं (अनुशंसित नहीं)' : 'Never (Not Recommended)'}</option>
            </select>
          </div>

          <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-4">
            <h4 className="font-bold text-blue-400 mb-2">{isHindi ? 'डेटा शेयरिंग प्रेफरेंस' : 'Data Sharing Preferences'}</h4>
            <select
              value={settings.privacy.dataSharing}
              onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.value)}
              className="w-full bg-slate-800/50 border border-blue-500/40 text-white rounded-xl px-4 py-3 mb-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="none" className="bg-slate-900">{isHindi ? 'कोई डेटा शेयरिंग नहीं' : 'No Data Sharing'}</option>
              <option value="anonymous" className="bg-slate-900">{isHindi ? 'अनामित एग्रीगेटेड डेटा' : 'Anonymous Aggregated Data'}</option>
              <option value="full" className="bg-slate-900">{isHindi ? 'फुल डेटा (AI एल्गोरिदम में सुधार करें)' : 'Full Data (Improve AI Algorithms)'}</option>
            </select>
            <p className="text-sm text-blue-300/80">
              {settings.privacy.dataSharing === 'none' && (isHindi ? 'कोई डेटा शेयर नहीं किया जाएगा। उच्चतम प्राइवेसी लेवल।' : 'No data will be shared. Highest privacy level.')}
              {settings.privacy.dataSharing === 'anonymous' && (isHindi ? 'केवल अनामित, एग्रीगेटेड डेटा सेवाओं में सुधार के लिए शेयर किया जाएगा।' : 'Only anonymous, aggregated data will be shared to improve services.')}
              {settings.privacy.dataSharing === 'full' && (isHindi ? 'आपका ट्रेडिंग डेटा हमारे AI एल्गोरिदम में सुधार करने में मदद करेगा। हम आपके योगदान की सराहना करते हैं!' : 'Your trading data will help improve our AI algorithms. We value your contribution!')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 p-6 rounded-2xl border border-emerald-900/40">
        <h3 className="font-bold text-lg text-white mb-4">{isHindi ? 'डेटा मैनेजमेंट' : 'Data Management'}</h3>
        <div className="space-y-4">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-emerald-900/40 hover:border-emerald-500/60 transition-all"
          >
            <div className="flex items-center">
              <Download className="w-5 h-5 mr-3 text-blue-400" />
              <div>
                <p className="font-medium text-left text-white">{isHindi ? 'सभी सेटिंग्स एक्सपोर्ट करें' : 'Export All Settings'}</p>
                <p className="text-sm text-emerald-300/60 text-left">{isHindi ? 'अपनी सेटिंग्स JSON फाइल के रूप में डाउनलोड करें' : 'Download your settings as JSON file'}</p>
              </div>
            </div>
            <span className="text-blue-400 font-medium">{isHindi ? 'एक्सपोर्ट' : 'Export'}</span>
          </button>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-amber-900/40 hover:border-amber-500/60 transition-all"
          >
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 flex items-center justify-center text-amber-400">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-left text-white">{isHindi ? 'डिफॉल्ट सेटिंग्स पर रिसेट करें' : 'Reset to Default Settings'}</p>
                <p className="text-sm text-amber-300/60 text-left">{isHindi ? 'सभी सेटिंग्स फैक्ट्री डिफॉल्ट पर रिवर्ट करें' : 'Revert all settings to factory default'}</p>
              </div>
            </div>
            <span className="text-amber-400 font-medium">{isHindi ? 'रिसेट' : 'Reset'}</span>
          </button>

          <button
            onClick={() => alert(isHindi ? 'अकाउंट डिलीशन रिक्वेस्ट शुरू हुई। हमारी टीम 24 घंटे के भीतर आपसे संपर्क करेगी।' : 'Account deletion request initiated. Our team will contact you within 24 hours.')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-900/20 to-red-800/10 rounded-xl border border-red-900/40 hover:border-red-500/60 transition-all"
          >
            <div className="flex items-center">
              <Trash2 className="w-5 h-5 mr-3 text-red-400" />
              <div>
                <p className="font-bold text-left text-red-300">{isHindi ? 'अकाउंट डिलीट करें' : 'Delete Account'}</p>
                <p className="text-sm text-red-400/60 text-left">{isHindi ? 'स्थायी रूप से अपना अकाउंट और सभी डेटा डिलीट करें' : 'Permanently delete your account and all data'}</p>
              </div>
            </div>
            <span className="text-red-400 font-bold">{isHindi ? 'डिलीट' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 p-6 rounded-2xl border border-cyan-900/40">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-cyan-400" />
          {isHindi ? 'API और इंटीग्रेशन सेटिंग्स' : 'API & Integration Settings'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-cyan-900/40">
            <div>
              <p className="font-bold text-white">{isHindi ? 'थर्ड-पार्टी API एक्सेस की अनुमति दें' : 'Allow Third-Party API Access'}</p>
              <p className="text-sm text-cyan-300/60">{isHindi ? 'एक्सटर्नल एप्लिकेशन्स को API के माध्यम से आपके डेटा तक पहुंचने की अनुमति दें' : 'Enable external applications to access your data via API'}</p>
            </div>
            <ToggleSwitch
              checked={settings.api.allowThirdPartyAccess}
              onChange={(e) => handleSettingChange('api', 'allowThirdPartyAccess', e.target.checked)}
              id="thirdPartyApi"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-cyan-900/40">
            <div>
              <p className="font-bold text-white">{isHindi ? 'वेबहुक नोटिफिकेशन' : 'Webhook Notifications'}</p>
              <p className="text-sm text-cyan-300/60">{isHindi ? 'आपके वेबहुक URL पर ट्रेड नोटिफिकेशन भेजें' : 'Send trade notifications to your webhook URL'}</p>
            </div>
            <ToggleSwitch
              checked={settings.api.webhookEnabled}
              onChange={(e) => handleSettingChange('api', 'webhookEnabled', e.target.checked)}
              id="webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-300 mb-2">{isHindi ? 'API रेट लिमिट' : 'API Rate Limit'}</label>
            <select
              value={settings.api.rateLimit}
              onChange={(e) => handleSettingChange('api', 'rateLimit', e.target.value)}
              className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="low" className="bg-slate-900">{isHindi ? 'लो (10 रिक्वेस्ट/मिनट)' : 'Low (10 requests/minute)'}</option>
              <option value="medium" className="bg-slate-900">{isHindi ? 'मीडियम (30 रिक्वेस्ट/मिनट)' : 'Medium (30 requests/minute)'}</option>
              <option value="high" className="bg-slate-900">{isHindi ? 'हाई (60 रिक्वेस्ट/मिनट)' : 'High (60 requests/minute)'}</option>
              <option value="unlimited" className="bg-slate-900">{isHindi ? 'अनलिमिटेड (अनुशंसित नहीं)' : 'Unlimited (Not Recommended)'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-300 mb-2">{isHindi ? 'लॉग रिटेंशन पीरियड' : 'Log Retention Period'}</label>
            <select
              value={settings.api.logRetention}
              onChange={(e) => handleSettingChange('api', 'logRetention', e.target.value)}
              className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="7days" className="bg-slate-900">7 {isHindi ? 'दिन' : 'Days'}</option>
              <option value="30days" className="bg-slate-900">30 {isHindi ? 'दिन' : 'Days'}</option>
              <option value="90days" className="bg-slate-900">90 {isHindi ? 'दिन' : 'Days'}</option>
              <option value="1year" className="bg-slate-900">1 {isHindi ? 'वर्ष' : 'Year'}</option>
              <option value="forever" className="bg-slate-900">{isHindi ? 'हमेशा के लिए' : 'Forever'}</option>
            </select>
          </div>

          <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/10 border border-amber-500/30 rounded-xl p-4">
            <h4 className="font-bold text-amber-400 mb-2">⚠️ {isHindi ? 'API सिक्योरिटी नोटिस' : 'API Security Notice'}</h4>
            <p className="text-sm text-amber-300/80">
              {isHindi ? '• अपने API कीज़ को सुरक्षित रखें और कभी भी उन्हें पब्लिकली शेयर न करें' : '• Keep your API keys secure and never share them publicly'}<br/>
              {isHindi ? '• बेहतर सुरक्षा के लिए नियमित रूप से अपने API कीज़ रोटेट करें' : '• Regularly rotate your API keys for better security'}<br/>
              {isHindi ? '• संदिग्ध गतिविधियों के लिए API उपयोग लॉग्स की निगरानी करें' : '• Monitor API usage logs for suspicious activities'}<br/>
              {isHindi ? '• अतिरिक्त सुरक्षा के लिए IP व्हाइटलिस्टिंग का उपयोग करें' : '• Use IP whitelisting if available for added security'}
            </p>
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
      default: return renderNotificationsTab();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      {/* हेडर सेक्शन */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {isHindi ? 'सेटिंग्स और प्रेफरेंस' : 'Settings & Preferences'}
            </h1>
            <p className="text-sm text-emerald-300/80 mt-1">
              {isHindi ? 'अपना ट्रेडिंग अनुभव कस्टमाइज़ करें और अकाउंट प्रेफरेंस मैनेज करें' : 'Customize your trading experience and manage account preferences'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-3 md:mt-0">
            {hasChanges && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 text-amber-400 rounded-xl text-sm font-medium border border-amber-500/30">
                {isHindi ? 'अनसेव्ड बदलाव' : 'Unsaved Changes'}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? (isHindi ? 'सेव हो रहा...' : 'Saving...') : (isHindi ? 'बदलाव सेव करें' : 'Save Changes')}</span>
            </button>
          </div>
        </div>

        {/* क्विक स्टैट्स */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-xl p-3 border border-emerald-900/40">
            <p className="text-xs text-emerald-300/60">{isHindi ? 'ऑटो ट्रेडिंग' : 'Auto Trading'}</p>
            <p className={`text-base font-bold ${settings.trading.autoTradeExecution ? 'text-emerald-400' : 'text-slate-400'}`}>
              {settings.trading.autoTradeExecution ? (isHindi ? 'एक्टिव' : 'Active') : (isHindi ? 'इनएक्टिव' : 'Inactive')}
            </p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-xl p-3 border border-emerald-900/40">
            <p className="text-xs text-emerald-300/60">{isHindi ? 'प्रति ट्रेड रिस्क' : 'Risk Per Trade'}</p>
            <p className="text-base font-bold text-amber-400">{settings.trading.maxRiskPerTrade}%</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-xl p-3 border border-emerald-900/40">
            <p className="text-xs text-emerald-300/60">{isHindi ? '2FA स्टेटस' : '2FA Status'}</p>
            <p className={`text-base font-bold ${settings.privacy.twoFactorAuth ? 'text-emerald-400' : 'text-red-400'}`}>
              {settings.privacy.twoFactorAuth ? (isHindi ? 'एनेबल्ड' : 'Enabled') : (isHindi ? 'डिसेबल्ड' : 'Disabled')}
            </p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-xl p-3 border border-emerald-900/40">
            <p className="text-xs text-emerald-300/60">{isHindi ? 'थीम' : 'Theme'}</p>
            <p className="text-base font-bold text-purple-400 capitalize">{settings.display.theme}</p>
          </div>
        </div>
      </div>

      {/* मुख्य कंटेंट */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 overflow-hidden">
        {/* टैब नेविगेशन */}
        <div className="border-b border-emerald-900/40 overflow-x-auto">
          <div className="flex min-w-max md:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? `text-white bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 border-b-2 ${tab.color.replace('text', 'border')}`
                    : 'text-emerald-300/70 hover:text-white hover:bg-emerald-900/20'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-opacity-20 ' + tab.color.replace('text', 'bg') : 'bg-slate-800/50'}`}>
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* टैब कंटेंट */}
        <div className="p-5 md:p-6">
          {renderActiveTab()}
        </div>
      </div>

      {/* फुटर */}
      <div className="mt-6 text-center text-xs text-emerald-300/40">
        {isHindi ? 'VeloxTradeAI v3.0 • सभी सेटिंग्स रियल-टाइम सिंक' : 'VeloxTradeAI v3.0 • All settings real-time sync'}
      </div>
    </div>
  );
};

export default Settings;
