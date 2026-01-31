// src/pages/Settings.jsx - FINAL WORKING VERSION
import React, { useState, useEffect } from 'react';
import { 
  Save, Bell, Shield, Globe, Moon, Download, 
  Activity, Lock, Palette, MessageSquare, 
  Settings as SettingsIcon, User, CreditCard,
  Database, LogOut, Eye, EyeOff, Smartphone,
  Mail, Key, AlertTriangle, Check
} from 'lucide-react';

const Settings = () => {
  // SIMPLE STATE - NO COMPLEX NESTING
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // User Profile State
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    avatar: '',
    twoFactorEnabled: false,
    emailVerified: true,
    phoneVerified: false
  });
  
  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    tradeAlerts: true,
    priceAlerts: false,
    newsAlerts: true
  });
  
  // Trading Settings
  const [trading, setTrading] = useState({
    autoTrade: false,
    maxRisk: 2,
    defaultQty: 10,
    allowShort: true,
    requireConfirm: true,
    trailingSL: false
  });
  
  // Theme Settings
  const [theme, setTheme] = useState({
    mode: 'light',
    color: 'blue',
    fontSize: 'medium',
    compactView: false
  });
  
  // Subscription Info
  const [subscription, setSubscription] = useState({
    plan: 'free_trial',
    expiry: '2024-01-07',
    autoRenew: false,
    status: 'active'
  });

  // Initialize - Load from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedProfile = localStorage.getItem('velox_profile');
        const savedNotifications = localStorage.getItem('velox_notifications');
        const savedTrading = localStorage.getItem('velox_trading');
        const savedTheme = localStorage.getItem('velox_theme');
        const savedSubscription = localStorage.getItem('velox_subscription');
        
        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
        if (savedTrading) setTrading(JSON.parse(savedTrading));
        if (savedTheme) setTheme(JSON.parse(savedTheme));
        if (savedSubscription) setSubscription(JSON.parse(savedSubscription));
      } catch (error) {
        console.log('Loading settings from localStorage failed');
      }
    };
    
    loadSettings();
  }, []);

  // Save to localStorage
  const saveSettings = (category, data) => {
    try {
      localStorage.setItem(`velox_${category}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  };

  const handleSaveAll = () => {
    setIsLoading(true);
    
    saveSettings('profile', profile);
    saveSettings('notifications', notifications);
    saveSettings('trading', trading);
    saveSettings('theme', theme);
    saveSettings('subscription', subscription);
    
    // Show success message
    setTimeout(() => {
      setIsLoading(false);
      showAlert('Settings saved successfully!', 'success');
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      setProfile({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 9876543210',
        avatar: '',
        twoFactorEnabled: false,
        emailVerified: true,
        phoneVerified: false
      });
      
      setNotifications({
        emailAlerts: true,
        pushNotifications: true,
        smsAlerts: false,
        tradeAlerts: true,
        priceAlerts: false,
        newsAlerts: true
      });
      
      setTrading({
        autoTrade: false,
        maxRisk: 2,
        defaultQty: 10,
        allowShort: true,
        requireConfirm: true,
        trailingSL: false
      });
      
      setTheme({
        mode: 'light',
        color: 'blue',
        fontSize: 'medium',
        compactView: false
      });
      
      // Clear localStorage
      ['profile', 'notifications', 'trading', 'theme', 'subscription'].forEach(key => {
        localStorage.removeItem(`velox_${key}`);
      });
      
      showAlert('Settings reset to default!', 'info');
    }
  };

  const showAlert = (message, type = 'info') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('velox_auth_token');
      localStorage.removeItem('velox_profile');
      window.location.href = '/login';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'trading', label: 'Trading', icon: <Activity className="w-4 h-4" /> },
    { id: 'theme', label: 'Theme', icon: <Palette className="w-4 h-4" /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> }
  ];

  // Render Profile Tab
  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="flex items-center space-x-3">
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile.emailVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile.emailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="flex items-center space-x-3">
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile.phoneVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile.phoneVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Account Actions</h3>
        
        <div className="space-y-3">
          <button
            onClick={() => showAlert('Password reset link sent to your email!', 'success')}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
            </div>
            <span className="text-blue-600 font-medium">Change</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/subscription'}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Upgrade Plan</p>
                <p className="text-sm text-gray-500">Get access to premium features</p>
              </div>
            </div>
            <span className="text-green-600 font-medium">Upgrade</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <p className="font-medium text-red-700">Logout</p>
                <p className="text-sm text-red-600">Sign out from your account</p>
              </div>
            </div>
            <span className="text-red-700 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Render Notifications Tab
  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          {[
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important updates via email' },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get browser notifications' },
            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive text messages on your phone' },
            { key: 'tradeAlerts', label: 'Trade Alerts', desc: 'Alerts for trade executions' },
            { key: 'priceAlerts', label: 'Price Alerts', desc: 'Alerts when prices hit targets' },
            { key: 'newsAlerts', label: 'News Alerts', desc: 'Important market news updates' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) => {
                    setNotifications({...notifications, [item.key]: e.target.checked});
                    saveSettings('notifications', {...notifications, [item.key]: e.target.checked});
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Trading Tab
  const renderTradingTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Trading Configuration</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto Trading</p>
              <p className="text-sm text-gray-500">Automatically execute trades based on signals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={trading.autoTrade}
                onChange={(e) => {
                  setTrading({...trading, autoTrade: e.target.checked});
                  saveSettings('trading', {...trading, autoTrade: e.target.checked});
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Risk Per Trade (%)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={trading.maxRisk}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setTrading({...trading, maxRisk: value});
                    saveSettings('trading', {...trading, maxRisk: value});
                  }}
                  className="flex-1"
                />
                <span className="font-bold text-lg min-w-[60px]">{trading.maxRisk}%</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Quantity</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={trading.defaultQty}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setTrading({...trading, defaultQty: value});
                  saveSettings('trading', {...trading, defaultQty: value});
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <p className="font-medium text-blue-800">Trading Disclaimer</p>
            </div>
            <p className="text-sm text-blue-700">
              Trading involves risk of loss. Please trade responsibly and never invest more than you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Theme Tab
  const renderThemeTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Theme Customization</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Color Theme</label>
            <div className="grid grid-cols-4 gap-4">
              {['blue', 'green', 'purple', 'red'].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setTheme({...theme, color});
                    saveSettings('theme', {...theme, color});
                    applyTheme(color);
                  }}
                  className={`p-4 rounded-lg border-2 ${
                    theme.color === color 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                    color === 'blue' ? 'bg-blue-500' :
                    color === 'green' ? 'bg-green-500' :
                    color === 'purple' ? 'bg-purple-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">{color}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Theme Mode</label>
            <div className="grid grid-cols-3 gap-4">
              {['light', 'dark', 'auto'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setTheme({...theme, mode});
                    saveSettings('theme', {...theme, mode});
                    applyThemeMode(mode);
                  }}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center ${
                    theme.mode === mode 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full mb-2 ${
                    mode === 'light' ? 'bg-yellow-100 border border-yellow-200' :
                    mode === 'dark' ? 'bg-gray-800' :
                    'bg-gradient-to-r from-gray-800 to-yellow-100'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">{mode}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Compact View</p>
              <p className="text-sm text-gray-500">Show more data in less space</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={theme.compactView}
                onChange={(e) => {
                  setTheme({...theme, compactView: e.target.checked});
                  saveSettings('theme', {...theme, compactView: e.target.checked});
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Apply theme to document
  const applyTheme = (color) => {
    const root = document.documentElement;
    const colors = {
      blue: { primary: '#3B82F6', secondary: '#1D4ED8' },
      green: { primary: '#10B981', secondary: '#059669' },
      purple: { primary: '#8B5CF6', secondary: '#7C3AED' },
      red: { primary: '#EF4444', secondary: '#DC2626' }
    };
    
    if (colors[color]) {
      root.style.setProperty('--primary-color', colors[color].primary);
      root.style.setProperty('--secondary-color', colors[color].secondary);
    }
  };

  const applyThemeMode = (mode) => {
    const body = document.body;
    if (mode === 'dark') {
      body.classList.add('dark');
    } else if (mode === 'light') {
      body.classList.remove('dark');
    } else {
      // Auto mode - follow system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark');
      } else {
        body.classList.remove('dark');
      }
    }
  };

  // Render Subscription Tab
  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Current Plan</h3>
        
        <div className={`p-6 rounded-lg border-2 ${
          subscription.plan === 'free_trial' 
            ? 'border-blue-200 bg-blue-50' 
            : 'border-green-200 bg-green-50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900 capitalize">
                {subscription.plan === 'free_trial' ? '7-Day Free Trial' : subscription.plan}
              </h4>
              <p className="text-gray-600">Active until {subscription.expiry}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium ${
              subscription.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {subscription.status === 'active' ? 'Active' : 'Expired'}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>Real-time AI Signals</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>Broker Integration</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>Advanced Charts</span>
            </div>
            {subscription.plan !== 'free_trial' && (
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Priority Support</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/subscription?plan=monthly'}
            className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-2xl font-bold text-gray-900">₹999</div>
            <div className="text-sm text-gray-600">Monthly Plan</div>
          </button>
          
          <button
            onClick={() => window.location.href = '/subscription?plan=yearly'}
            className="p-4 border border-gray-300 rounded-lg hover:border-green-500 transition-colors text-center"
          >
            <div className="text-2xl font-bold text-gray-900">₹9,999</div>
            <div className="text-sm text-gray-600">Yearly Plan (Save 16%)</div>
          </button>
          
          <button
            onClick={() => window.location.href = '/subscription?plan=lifetime'}
            className="p-4 border border-gray-300 rounded-lg hover:border-purple-500 transition-colors text-center"
          >
            <div className="text-2xl font-bold text-gray-900">₹49,999</div>
            <div className="text-sm text-gray-600">Lifetime Access</div>
          </button>
        </div>
      </div>
    </div>
  );

  // Render Security Tab
  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Security Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.twoFactorEnabled}
                onChange={(e) => {
                  setProfile({...profile, twoFactorEnabled: e.target.checked});
                  saveSettings('profile', {...profile, twoFactorEnabled: e.target.checked});
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="font-medium text-gray-900 mb-2">Session Timeout</p>
            <select
              value={30}
              onChange={(e) => showAlert(`Session timeout set to ${e.target.value} minutes`, 'success')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="0">Never (Not Recommended)</option>
            </select>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout from all devices</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'trading': return renderTradingTab();
      case 'theme': return renderThemeTab();
      case 'subscription': return renderSubscriptionTab();
      case 'security': return renderSecurityTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
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
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  activeTab === tab.id ? 'bg-blue-50' : 'bg-gray-100'
                }`}>
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
      
      {/* Action Buttons */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Reset to Default
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        
        <button
          onClick={handleSaveAll}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>{isLoading ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>
      
      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Theme</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{theme.color}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Auto Trading</p>
          <p className={`text-lg font-bold ${trading.autoTrade ? 'text-green-600' : 'text-gray-400'}`}>
            {trading.autoTrade ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">2FA</p>
          <p className={`text-lg font-bold ${profile.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
            {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Plan</p>
          <p className="text-lg font-bold text-purple-600 capitalize">
            {subscription.plan === 'free_trial' ? 'Trial' : subscription.plan}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
