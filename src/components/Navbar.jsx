import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Bell, Search, User, Menu, X, ChevronDown, 
  Clock, RefreshCw, Zap, Settings, 
  HelpCircle, Wallet, Shield, LogOut, BarChart3,
  Globe, Wifi, Sparkles,
  TrendingUp, TrendingDown, Sun,
  Moon, Palette, AlertCircle, CheckCircle,
  MessageSquare, Target, Activity, Volume2,
  VolumeX, Eye, EyeOff, Download, Filter,
  Smartphone, Monitor, Battery
} from 'lucide-react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { theme, toggleTheme, themes, setTheme } = useTheme();
  const { t, isHindi, language, toggleLanguage } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState('CLOSED');
  const [isMobile, setIsMobile] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    backend: false,
    broker: false,
    websocket: false
  });

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check market status and connection
  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Indian market hours: 9:15 AM to 3:30 PM
      const marketOpen = (hours > 9 || (hours === 9 && minutes >= 15)) && 
                        (hours < 15 || (hours === 15 && minutes <= 30));
      
      setMarketStatus(marketOpen ? 'OPEN' : 'CLOSED');
    };
    
    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    
    // Check connection status
    const checkConnection = () => {
      const token = localStorage.getItem('velox_auth_token');
      const brokers = JSON.parse(localStorage.getItem('velox_brokers') || '[]');
      const connectedBrokers = brokers.filter(b => b.status === 'connected');
      
      setConnectionStatus({
        backend: !!token,
        broker: connectedBrokers.length > 0,
        websocket: true // Simulated
      });
    };
    
    checkConnection();
    
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = () => {
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = () => {
    return time.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching:', searchQuery);
      // Implement real search
    }
  };

  const handleLogout = () => {
    if (window.confirm(isHindi ? 'क्या आप लॉग आउट करना चाहते हैं?' : 'Are you sure you want to logout?')) {
      localStorage.removeItem('velox_auth_token');
      localStorage.removeItem('velox_user');
      localStorage.removeItem('velox_brokers');
      window.location.href = '/login';
    }
  };

  // Real notifications from localStorage or API
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Load real notifications
    const savedNotifications = JSON.parse(localStorage.getItem('velox_notifications') || '[]');
    setNotifications(savedNotifications);
  }, []);

  // User stats from localStorage
  const userStats = {
    todayProfit: localStorage.getItem('today_profit') || 0,
    winRate: localStorage.getItem('win_rate') || '0%',
    activeTrades: localStorage.getItem('active_trades') || 0,
    rank: localStorage.getItem('user_rank') || 'Top 0%'
  };

  // Theme colors based on your image
  const themeColors = {
    emerald: {
      bg: 'from-emerald-500 to-green-500',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      light: 'bg-emerald-500/20'
    },
    blue: {
      bg: 'from-blue-500 to-cyan-500',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      light: 'bg-blue-500/20'
    },
    amber: {
      bg: 'from-amber-500 to-red-500',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      light: 'bg-amber-500/20'
    }
  };

  const currentTheme = themeColors[theme] || themeColors.emerald;

  return (
    <nav className={`sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white border-b ${currentTheme.border} shadow-xl shadow-emerald-900/10`}>
      <div className="px-3 sm:px-4 lg:px-6">
        {/* Main Row */}
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Menu & Brand */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Menu Button */}
            <button
              onClick={toggleSidebar}
              className={`p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border ${currentTheme.border} hover:border-emerald-500 transition-all`}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? (
                <X className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
              ) : (
                <Menu className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
              )}
            </button>
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.bg} rounded-lg blur opacity-60`}></div>
                <div className="relative bg-slate-900 p-1.5 rounded-lg border border-emerald-500/40">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                </div>
              </div>
              
              <div className="hidden sm:block">
                <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  VeloxTradeAI
                </div>
                <div className="text-xs text-emerald-300/70 flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  Elite Trading Platform
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search Bar (Desktop only) */}
          <div className="flex-1 max-w-xl mx-4 hidden lg:block">
            <form onSubmit={handleSearch} className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.bg} opacity-10 rounded-xl blur`}></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  placeholder={isHindi ? "स्टॉक, AI सिग्नल खोजें..." : "Search stocks, AI signals..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-emerald-900/40 text-white placeholder-emerald-300/50 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Market Status */}
            <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${marketStatus === 'OPEN' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/20 border-red-500/30'}`}>
              <div className={`w-2 h-2 rounded-full ${marketStatus === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className={`text-xs font-medium ${marketStatus === 'OPEN' ? 'text-emerald-400' : 'text-red-400'}`}>
                {marketStatus === 'OPEN' ? (isHindi ? 'खुला' : 'OPEN') : (isHindi ? 'बंद' : 'CLOSED')}
              </span>
            </div>

            {/* Time & Date */}
            <div className="hidden md:flex flex-col items-end px-3 py-1">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-cyan-300 font-medium">{formatTime()}</span>
              </div>
              <span className="text-xs text-emerald-300/60 mt-0.5">{formatDate()}</span>
            </div>

            {/* Connection Status */}
            <div className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-emerald-900/40">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.backend ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              <span className="text-xs text-emerald-300">{connectionStatus.broker ? 'Connected' : 'Offline'}</span>
            </div>

            {/* Mobile Search Button */}
            <button className="lg:hidden p-2 rounded-xl bg-slate-800/50 border border-emerald-900/40">
              <Search className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="hidden sm:flex items-center justify-center p-2 rounded-xl bg-slate-800/50 border border-emerald-900/40 hover:border-purple-500 transition-all"
              title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-purple-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-800/50 border border-emerald-900/40 hover:border-amber-500 transition-all"
                title="Change theme"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : theme === 'blue' ? (
                  <Palette className="w-4 h-4 text-blue-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-emerald-900/40 hover:border-cyan-500 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-cyan-300 font-medium">
                {language === 'hi' ? 'हिंदी' : 'ENG'}
              </span>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl bg-slate-800/50 border border-emerald-900/40 hover:border-purple-500 transition-all"
                title="Notifications"
              >
                <Bell className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-ping"></span>
                  </>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl border border-emerald-900/40 shadow-2xl z-50">
                  <div className="p-4 border-b border-emerald-900/40">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-white flex items-center space-x-2">
                        <Bell className="w-4 h-4" />
                        <span>{isHindi ? 'नोटिफिकेशन' : 'Notifications'}</span>
                      </div>
                      <div className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded-full">
                        {notifications.filter(n => n.unread).length} {isHindi ? 'नए' : 'New'}
                      </div>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-emerald-900/30 hover:bg-slate-800/50 transition-colors ${notification.unread ? 'bg-emerald-900/10' : ''}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1 p-1.5 rounded-full ${notification.type === 'success' ? 'bg-emerald-500/20' : notification.type === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                              {notification.type === 'success' ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : notification.type === 'warning' ? (
                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                              ) : (
                                <Bell className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{notification.text}</div>
                              <div className="text-xs text-emerald-300/70 mt-1">{notification.time}</div>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-10 h-10 text-emerald-400/40 mx-auto mb-3" />
                        <div className="text-emerald-300/70">{isHindi ? 'कोई नोटिफिकेशन नहीं' : 'No notifications'}</div>
                        <div className="text-sm text-emerald-300/50 mt-1">
                          {isHindi ? 'सभी अपडेट अप टू डेट हैं' : 'All updates are up to date'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-emerald-900/40">
                    <button className="w-full text-center text-sm text-emerald-400 hover:text-emerald-300 py-2">
                      {isHindi ? 'सभी नोटिफिकेशन देखें' : 'View All Notifications'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-800/50 border border-emerald-900/40 hover:border-emerald-500 transition-all"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full blur opacity-50"></div>
                  <div className="relative h-8 w-8 bg-gradient-to-br from-emerald-600 to-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-bold text-white">Trader Pro</div>
                  <div className="text-xs text-emerald-300/70">Premium</div>
                </div>
                <ChevronDown className={`h-4 w-4 text-emerald-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl border border-emerald-900/40 shadow-2xl z-50 overflow-hidden">
                  {/* User Header */}
                  <div className="p-5 bg-gradient-to-r from-emerald-900/30 to-green-900/20 border-b border-emerald-900/40">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full blur opacity-50"></div>
                        <div className="relative h-12 w-12 bg-gradient-to-br from-emerald-600 to-green-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">Trader Pro</div>
                        <div className="text-sm text-emerald-300/80">premium@veloxtrade.ai</div>
                        <div className="flex items-center mt-2 space-x-2">
                          <div className="text-xs bg-gradient-to-r from-amber-600 to-red-600 text-white px-2 py-1 rounded-full font-bold">
                            ELITE
                          </div>
                          <div className="text-xs bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-2 py-1 rounded-full font-bold">
                            {isHindi ? 'टॉप 8%' : 'Top 8%'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg border border-emerald-900/30">
                        <div className="text-xs text-emerald-300/70">{isHindi ? 'आज का लाभ' : "Today's Profit"}</div>
                        <div className="text-sm font-bold text-emerald-400">
                          ₹{parseInt(userStats.todayProfit).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg border border-emerald-900/30">
                        <div className="text-xs text-emerald-300/70">{isHindi ? 'जीत दर' : 'Win Rate'}</div>
                        <div className="text-sm font-bold text-emerald-400">{userStats.winRate}</div>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg border border-emerald-900/30">
                        <div className="text-xs text-emerald-300/70">{isHindi ? 'एक्टिव ट्रेड्स' : 'Active Trades'}</div>
                        <div className="text-sm font-bold text-emerald-400">{userStats.activeTrades}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 p-3 text-emerald-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                      <Settings className="h-5 w-5 text-blue-400" />
                      <span>{isHindi ? 'प्रोफाइल सेटिंग' : 'Profile Settings'}</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 text-emerald-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                      <Wallet className="h-5 w-5 text-green-400" />
                      <span>{isHindi ? 'खाता और बिलिंग' : 'Account & Billing'}</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 text-emerald-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                      <span>{isHindi ? 'प्रदर्शन एनालिटिक्स' : 'Performance Analytics'}</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 text-emerald-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                      <HelpCircle className="h-5 w-5 text-cyan-400" />
                      <span>{isHindi ? 'सहायता और समर्थन' : 'Help & Support'}</span>
                    </button>
                    
                    <div className="border-t border-emerald-900/40 my-2"></div>
                    
                    {/* Theme Selector */}
                    <div className="p-3">
                      <div className="text-xs text-emerald-300/70 mb-2">{isHindi ? 'थीम' : 'Theme'}</div>
                      <div className="grid grid-cols-4 gap-2">
                        <button 
                          onClick={() => setTheme('emerald')}
                          className={`p-2 rounded-lg border ${theme === 'emerald' ? 'border-emerald-500 bg-emerald-500/20' : 'border-emerald-900/40 bg-slate-800/50'}`}
                        >
                          <div className="w-4 h-4 mx-auto bg-gradient-to-r from-emerald-500 to-green-500 rounded"></div>
                        </button>
                        <button 
                          onClick={() => setTheme('blue')}
                          className={`p-2 rounded-lg border ${theme === 'blue' ? 'border-blue-500 bg-blue-500/20' : 'border-blue-900/40 bg-slate-800/50'}`}
                        >
                          <div className="w-4 h-4 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded"></div>
                        </button>
                        <button 
                          onClick={() => setTheme('amber')}
                          className={`p-2 rounded-lg border ${theme === 'amber' ? 'border-amber-500 bg-amber-500/20' : 'border-amber-900/40 bg-slate-800/50'}`}
                        >
                          <div className="w-4 h-4 mx-auto bg-gradient-to-r from-amber-500 to-red-500 rounded"></div>
                        </button>
                        <button 
                          onClick={() => setTheme('dark')}
                          className={`p-2 rounded-lg border ${theme === 'dark' ? 'border-gray-500 bg-gray-500/20' : 'border-gray-900/40 bg-slate-800/50'}`}
                        >
                          <Moon className="w-4 h-4 text-gray-400 mx-auto" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-emerald-900/40 my-2"></div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-red-900/40 to-red-800/30 hover:from-red-800/50 text-red-300 hover:text-white rounded-lg transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-bold">{isHindi ? 'लॉग आउट' : 'Logout'}</span>
                    </button>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-3 border-t border-emerald-900/40 text-center">
                    <div className="text-xs text-emerald-300/50">VeloxTradeAI v3.0 • {isHindi ? 'एलाइट संस्करण' : 'Elite Edition'}</div>
                    <div className="text-xs text-emerald-300/30 mt-1">
                      {isMobile ? '📱 Mobile' : '💻 Desktop'} • 🔒 Secure • ☁️ Cloud
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.bg} opacity-10 rounded-xl blur`}></div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
              <input
                type="text"
                placeholder={isHindi ? "स्टॉक, AI सिग्नल खोजें..." : "Search stocks, AI signals..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 rounded-xl border border-emerald-900/40 text-white placeholder-emerald-300/50 text-sm"
              />
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
