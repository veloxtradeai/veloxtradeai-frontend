import React, { useState } from 'react';
import { Save, Bell, Shield, Globe, Moon, Download, Activity, Lock } from 'lucide-react';

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
      requireConfirmation: true
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
      volatilityAdjustment: true
    },
    
    display: {
      theme: 'light',
      defaultView: 'dashboard',
      refreshInterval: 30,
      showAdvancedCharts: true,
      compactMode: false,
      language: 'en',
      showIndicators: true,
      darkModeIntensity: 'medium'
    },
    
    privacy: {
      publicProfile: false,
      showPortfolioValue: true,
      shareTradingHistory: false,
      dataSharing: 'anonymous',
      twoFactorAuth: false,
      sessionTimeout: 30,
      showRealName: false
    },
    
    api: {
      allowThirdPartyAccess: false,
      webhookEnabled: false,
      rateLimit: 'medium',
      logRetention: '30days'
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

  const handleNestedChange = (category, subCategory, key, value) => {
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
    if (!hasChanges) {
      alert('No changes to save!');
      return;
    }
    
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      setSettings({
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
          requireConfirmation: true
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
          volatilityAdjustment: true
        },
        display: {
          theme: 'light',
          defaultView: 'dashboard',
          refreshInterval: 30,
          showAdvancedCharts: true,
          compactMode: false,
          language: 'en',
          showIndicators: true,
          darkModeIntensity: 'medium'
        },
        privacy: {
          publicProfile: false,
          showPortfolioValue: true,
          shareTradingHistory: false,
          dataSharing: 'anonymous',
          twoFactorAuth: false,
          sessionTimeout: 30,
          showRealName: false
        },
        api: {
          allowThirdPartyAccess: false,
          webhookEnabled: false,
          rateLimit: 'medium',
          logRetention: '30days'
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
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, color: 'text-blue-600' },
    { id: 'trading', label: 'Trading', icon: <Activity className="w-4 h-4" />, color: 'text-green-600' },
    { id: 'risk', label: 'Risk Management', icon: <Shield className="w-4 h-4" />, color: 'text-orange-600' },
    { id: 'display', label: 'Display', icon: <Moon className="w-4 h-4" />, color: 'text-purple-600' },
    { id: 'privacy', label: 'Privacy & Security', icon: <Lock className="w-4 h-4" />, color: 'text-red-600' },
    { id: 'api', label: 'API', icon: <Globe className="w-4 h-4" />, color: 'text-indigo-600' }
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
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-100">
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-600" />
          Alert Channels
        </h3>
        <p className="text-gray-600 mb-4">Choose how you want to receive notifications</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive notifications via email' },
            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Get SMS on your mobile' },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser & app notifications' },
            { key: 'whatsappAlerts', label: 'WhatsApp Alerts', desc: 'WhatsApp messages for alerts' }
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

      <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border border-green-100">
        <h3 className="font-bold text-lg mb-2">Trade Events</h3>
        <p className="text-gray-600 mb-4">Configure notifications for trading activities</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'tradeExecuted', label: 'Trade Executed', desc: 'When a trade is successfully executed' },
            { key: 'stopLossHit', label: 'Stop Loss Hit', desc: 'When stop loss is triggered' },
            { key: 'targetAchieved', label: 'Target Achieved', desc: 'When profit target is reached' },
            { key: 'marketCloseAlerts', label: 'Market Close Summary', desc: 'Daily portfolio summary' },
            { key: 'priceAlerts', label: 'Price Alerts', desc: 'Custom price level notifications' },
            { key: 'newsAlerts', label: 'News Alerts', desc: 'Important market news updates' }
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
  );

  const renderTradingTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border border-green-100">
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-600" />
          Auto Trading Configuration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-bold">Auto Trade Execution</p>
              <p className="text-sm text-gray-600">Automatically execute trades based on AI signals</p>
            </div>
            <ToggleSwitch
              checked={settings.trading.autoTradeExecution}
              onChange={(e) => handleSettingChange('trading', 'autoTradeExecution', e.target.checked)}
              id="autoTrade"
            />
          </div>

          {settings.trading.autoTradeExecution && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-800 mb-2">⚠️ Auto Trading Enabled</p>
              <p className="text-sm text-yellow-700">Trades will be executed automatically based on your risk settings. Monitor your account regularly.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'maxPositions', label: 'Max Open Positions', value: settings.trading.maxPositions, min: 1, max: 20, unit: '' },
              { key: 'maxRiskPerTrade', label: 'Max Risk Per Trade', value: settings.trading.maxRiskPerTrade, min: 0.1, max: 10, unit: '%' },
              { key: 'maxDailyLoss', label: 'Max Daily Loss', value: settings.trading.maxDailyLoss, min: 1, max: 50, unit: '%' },
              { key: 'defaultQuantity', label: 'Default Quantity', value: settings.trading.defaultQuantity, min: 1, max: 1000, unit: ' shares' },
              { key: 'slippageTolerance', label: 'Slippage Tolerance', value: settings.trading.slippageTolerance, min: 0.1, max: 5, unit: '%' }
            ].map((item) => (
              <div key={item.key} className="bg-white p-4 rounded-lg border">
                <label className="block text-sm font-medium text-gray-700 mb-2">{item.label}</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={item.key.includes('Risk') || item.key.includes('slippage') ? 0.1 : 1}
                    value={item.value}
                    onChange={(e) => handleSettingChange('trading', item.key, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 font-bold min-w-[60px]">{item.value}{item.unit}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{item.min}{item.unit}</span>
                  <span>{item.max}{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <p className="font-medium">Allow Short Selling</p>
                <p className="text-sm text-gray-600">Enable short selling trades</p>
              </div>
              <ToggleSwitch
                checked={settings.trading.allowShortSelling}
                onChange={(e) => handleSettingChange('trading', 'allowShortSelling', e.target.checked)}
                id="shortSelling"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <p className="font-medium">Trade Confirmation</p>
                <p className="text-sm text-gray-600">Require manual confirmation for each trade</p>
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
        <div className="bg-gradient-to-r from-orange-50 to-white p-6 rounded-xl border border-orange-100">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-orange-600" />
            Stop Loss Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stop Loss Type</label>
              <select
                value={settings.risk.stopLossType}
                onChange={(e) => handleSettingChange('risk', 'stopLossType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="absolute">Absolute Value (₹)</option>
                <option value="atr">ATR Based</option>
                <option value="support">Support/Resistance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {settings.risk.stopLossType === 'percentage' ? 'Stop Loss Percentage' : 
                 settings.risk.stopLossType === 'absolute' ? 'Stop Loss Amount (₹)' :
                 settings.risk.stopLossType === 'atr' ? 'ATR Multiplier' : 'Distance from Level'}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={settings.risk.stopLossValue}
                  onChange={(e) => handleSettingChange('risk', 'stopLossValue', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold min-w-[80px] text-lg">
                  {settings.risk.stopLossValue}
                  {settings.risk.stopLossType === 'percentage' ? '%' : 
                   settings.risk.stopLossType === 'absolute' ? '₹' : 'x'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <p className="font-medium">Trailing Stop Loss</p>
                <p className="text-sm text-gray-600">Automatically adjust stop loss as price moves</p>
              </div>
              <ToggleSwitch
                checked={settings.risk.trailingStopLoss}
                onChange={(e) => handleSettingChange('risk', 'trailingStopLoss', e.target.checked)}
                id="trailingStop"
              />
            </div>

            {settings.risk.trailingStopLoss && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trailing Distance (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.risk.trailingStopDistance}
                  onChange={(e) => handleSettingChange('risk', 'trailingStopDistance', parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  min="0.5"
                  max="5"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border border-green-100">
          <h3 className="font-bold text-lg mb-4">Take Profit & Risk Management</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Take Profit Type</label>
              <select
                value={settings.risk.takeProfitType}
                onChange={(e) => handleSettingChange('risk', 'takeProfitType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="absolute">Absolute Value (₹)</option>
                <option value="rr">Risk/Reward Ratio</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {settings.risk.takeProfitType === 'percentage' ? 'Take Profit %' : 
                 settings.risk.takeProfitType === 'absolute' ? 'Take Profit Amount (₹)' : 'Risk/Reward Ratio'}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="50"
                  step={settings.risk.takeProfitType === 'rr' ? 0.5 : 1}
                  value={settings.risk.takeProfitValue}
                  onChange={(e) => handleSettingChange('risk', 'takeProfitValue', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold min-w-[80px] text-lg">
                  {settings.risk.takeProfitValue}
                  {settings.risk.takeProfitType === 'percentage' ? '%' : 
                   settings.risk.takeProfitType === 'absolute' ? '₹' : ':1'}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-2">Current Risk/Reward</h4>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">1:{settings.risk.riskRewardRatio}</div>
                  <div className="text-sm text-gray-600">Risk:Reward Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {((settings.risk.takeProfitValue / settings.risk.stopLossValue) || 0).toFixed(1)}:1
                  </div>
                  <div className="text-sm text-gray-600">Current Setup</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Portfolio Risk (%)</label>
              <input
                type="number"
                step="0.5"
                value={settings.risk.maxPortfolioRisk}
                onChange={(e) => handleSettingChange('risk', 'maxPortfolioRisk', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
        <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-100">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <Moon className="w-5 h-5 mr-2 text-purple-600" />
            Theme & Appearance
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme Selection</label>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'auto'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleSettingChange('display', 'theme', theme)}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center ${
                      settings.display.theme === theme 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full mb-2 ${
                      theme === 'light' ? 'bg-yellow-100 border border-yellow-200' :
                      theme === 'dark' ? 'bg-gray-800' :
                      'bg-gradient-to-r from-gray-800 to-yellow-100'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{theme}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={settings.display.language}
                onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>

            {settings.display.theme === 'dark' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dark Mode Intensity</label>
                <select
                  value={settings.display.darkModeIntensity}
                  onChange={(e) => handleSettingChange('display', 'darkModeIntensity', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                >
                  <option value="soft">Soft</option>
                  <option value="medium">Medium</option>
                  <option value="deep">Deep</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Display Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'showAdvancedCharts', label: 'Advanced Charts', desc: 'Show advanced charting tools and indicators' },
              { key: 'compactMode', label: 'Compact Mode', desc: 'Use compact view for more data density' },
              { key: 'showIndicators', label: 'Technical Indicators', desc: 'Display technical indicators on charts' }
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auto Refresh Interval</label>
              <select
                value={settings.display.refreshInterval}
                onChange={(e) => handleSettingChange('display', 'refreshInterval', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
              >
                <option value="10">10 seconds (Real-time)</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
                <option value="0">Manual Refresh</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-white p-6 rounded-xl border border-red-100">
        <h3 className="font-bold text-lg mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-red-600" />
          Security & Privacy
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-bold">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <ToggleSwitch
              checked={settings.privacy.twoFactorAuth}
              onChange={(e) => handleSettingChange('privacy', 'twoFactorAuth', e.target.checked)}
              id="twoFactor"
            />
          </div>

          {settings.privacy.twoFactorAuth && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-green-800 mb-2">✅ 2FA Enabled</p>
              <p className="text-sm text-green-700">Your account is protected with two-factor authentication.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'publicProfile', label: 'Public Profile', desc: 'Allow others to view your profile' },
              { key: 'showPortfolioValue', label: 'Show Portfolio Value', desc: 'Display portfolio value in profile' },
              { key: 'shareTradingHistory', label: 'Share Trading History', desc: 'Share anonymized trading history' },
              { key: 'showRealName', label: 'Show Real Name', desc: 'Display your real name in community' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <select
              value={settings.privacy.sessionTimeout}
              onChange={(e) => handleSettingChange('privacy', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="0">Never (Not Recommended)</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 mb-2">Data Sharing Preferences</h4>
            <select
              value={settings.privacy.dataSharing}
              onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.value)}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 bg-white mb-3"
            >
              <option value="none">No Data Sharing</option>
              <option value="anonymous">Anonymous Aggregated Data</option>
              <option value="full">Full Data (Improve AI Algorithms)</option>
            </select>
            <p className="text-sm text-blue-700">
              {settings.privacy.dataSharing === 'none' && 'No data will be shared. Highest privacy level.'}
              {settings.privacy.dataSharing === 'anonymous' && 'Only anonymous, aggregated data will be shared to improve services.'}
              {settings.privacy.dataSharing === 'full' && 'Your trading data will help improve our AI algorithms. We value your contribution!'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200">
        <h3 className="font-bold text-lg mb-4">Data Management</h3>
        <div className="space-y-4">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Download className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <p className="font-medium text-left">Export All Settings</p>
                <p className="text-sm text-gray-500 text-left">Download your settings as JSON file</p>
              </div>
            </div>
            <span className="text-blue-600 font-medium">Export</span>
          </button>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 flex items-center justify-center text-orange-600">
                ↻
              </div>
              <div>
                <p className="font-medium text-left">Reset to Default Settings</p>
                <p className="text-sm text-gray-500 text-left">Revert all settings to factory default</p>
              </div>
            </div>
            <span className="text-orange-600 font-medium">Reset</span>
          </button>

          <button
            onClick={() => alert('Account deletion request initiated. Our team will contact you within 24 hours.')}
            className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 flex items-center justify-center text-red-600">
                🗑️
              </div>
              <div>
                <p className="font-bold text-left text-red-700">Delete Account</p>
                <p className="text-sm text-red-600 text-left">Permanently delete your account and all data</p>
              </div>
            </div>
            <span className="text-red-700 font-bold">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
        <h3 className="font-bold text-lg mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-indigo-600" />
          API & Integration Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-bold">Allow Third-Party API Access</p>
              <p className="text-sm text-gray-600">Enable external applications to access your data via API</p>
            </div>
            <ToggleSwitch
              checked={settings.api.allowThirdPartyAccess}
              onChange={(e) => handleSettingChange('api', 'allowThirdPartyAccess', e.target.checked)}
              id="thirdPartyApi"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-bold">Webhook Notifications</p>
              <p className="text-sm text-gray-600">Send trade notifications to your webhook URL</p>
            </div>
            <ToggleSwitch
              checked={settings.api.webhookEnabled}
              onChange={(e) => handleSettingChange('api', 'webhookEnabled', e.target.checked)}
              id="webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit</label>
            <select
              value={settings.api.rateLimit}
              onChange={(e) => handleSettingChange('api', 'rateLimit', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
            >
              <option value="low">Low (10 requests/minute)</option>
              <option value="medium">Medium (30 requests/minute)</option>
              <option value="high">High (60 requests/minute)</option>
              <option value="unlimited">Unlimited (Not Recommended)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Log Retention Period</label>
            <select
              value={settings.api.logRetention}
              onChange={(e) => handleSettingChange('api', 'logRetention', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
            >
              <option value="7days">7 Days</option>
              <option value="30days">30 Days</option>
              <option value="90days">90 Days</option>
              <option value="1year">1 Year</option>
              <option value="forever">Forever</option>
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">⚠️ API Security Notice</h4>
            <p className="text-sm text-yellow-700">
              • Keep your API keys secure and never share them publicly<br/>
              • Regularly rotate your API keys for better security<br/>
              • Monitor API usage logs for suspicious activities<br/>
              • Use IP whitelisting if available for added security
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings & Preferences</h1>
          <p className="text-gray-600 mt-1">Customize your trading experience and manage account preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Unsaved Changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-b-2 ${tab.color}`
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-opacity-10 ' + tab.color.replace('text', 'bg') : 'bg-gray-100'}`}>
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderActiveTab()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Auto Trading</p>
          <p className={`text-lg font-bold ${settings.trading.autoTradeExecution ? 'text-green-600' : 'text-gray-400'}`}>
            {settings.trading.autoTradeExecution ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Risk Per Trade</p>
          <p className="text-lg font-bold text-orange-600">{settings.trading.maxRiskPerTrade}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">2FA Status</p>
          <p className={`text-lg font-bold ${settings.privacy.twoFactorAuth ? 'text-green-600' : 'text-red-600'}`}>
            {settings.privacy.twoFactorAuth ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Theme</p>
          <p className="text-lg font-bold text-purple-600 capitalize">{settings.display.theme}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;


कोई और फाइल का कोड भी देखना हो तो बता दो किस किस फाइल का देखना है यही  दे दूंगा उसके बाद फाइनल कोड्स दे देना . गड़बड़ नहीं होना चाहिए . कुछ भी. समझ रहे हो . न .
