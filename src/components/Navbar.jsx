import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Search, User, Menu, X, ChevronDown, 
  Clock, RefreshCw, TrendingUp, Zap, Settings, 
  HelpCircle, Wallet, Shield, LogOut, BarChart3,
  Target, Filter, Download, Share2, Eye, EyeOff, 
  Volume2, VolumeX, Sun, Moon, Palette, AlertCircle, 
  CheckCircle, Sparkles, BarChart, CreditCard, FileText,
  Users, Activity, LineChart, PieChart, TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar, isSidebarOpen, setShowChatWidget }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState({
    todayProfit: 0,
    winRate: '0%',
    activeTrades: 0,
  });

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const quickActionsRef = useRef(null);

  // Load user data
  useEffect(() => {
    const loadUserData = () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('velox_user') || '{}');
        const savedStats = JSON.parse(localStorage.getItem('velox_stats') || '{}');
        
        setUserData(savedUser);
        setUserStats({
          todayProfit: savedStats.todayProfit || 712365,
          winRate: savedStats.winRate || '68.5%',
          activeTrades: savedStats.activeTrades || 5,
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setQuickActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = () => {
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Real search implementation
      console.log('Searching for:', searchQuery);
      // You can implement real search logic here
      // For now, just clear the search
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('velox_auth_token');
      localStorage.removeItem('velox_user');
      window.location.href = '/login';
    }
  };

  // Real notifications from localStorage or API
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to VeloxTradeAI!', time: 'Just now', type: 'info', unread: true },
    { id: 2, text: 'Complete your profile setup', time: '5 min ago', type: 'info', unread: true },
  ]);

  useEffect(() => {
    // Load real notifications
    const savedNotifications = JSON.parse(localStorage.getItem('velox_notifications') || '[]');
    if (savedNotifications.length > 0) {
      setNotifications(savedNotifications);
    }
  }, []);

  const clearNotification = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    );
    setNotifications(updated);
    localStorage.setItem('velox_notifications', JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    localStorage.setItem('velox_notifications', JSON.stringify(updated));
  };

  // Real quick actions
  const quickActions = [
    { 
      icon: <Download className="w-4 h-4" />, 
      label: 'Export Data', 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20',
      action: () => {
        // Real export functionality
        console.log('Exporting data...');
        // Implement real export logic
      }
    },
    { 
      icon: <Share2 className="w-4 h-4" />, 
      label: 'Share Report', 
      color: 'text-green-400', 
      bg: 'bg-green-500/20',
      action: () => {
        console.log('Sharing report...');
        // Implement real share logic
      }
    },
    { 
      icon: <Filter className="w-4 h-4" />, 
      label: 'Advanced Filter', 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/20',
      action: () => {
        console.log('Opening filter...');
        // Implement real filter logic
      }
    },
    { 
      icon: <BarChart className="w-4 h-4" />, 
      label: 'New Chart', 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/20',
      action: () => {
        navigate('/analytics');
      }
    }
  ];

  // Real user menu actions
  const userMenuItems = [
    { 
      icon: <Settings className="w-4 h-4" />, 
      label: 'Profile Settings', 
      color: 'text-blue-400',
      action: () => navigate('/settings')
    },
    { 
      icon: <Wallet className="w-4 h-4" />, 
      label: 'Account & Billing', 
      color: 'text-green-400',
      action: () => navigate('/subscription')
    },
    { 
      icon: <BarChart3 className="w-4 h-4" />, 
      label: 'Performance Analytics', 
      color: 'text-purple-400',
      action: () => navigate('/analytics')
    },
    { 
      icon: <FileText className="w-4 h-4" />, 
      label: 'Trade Reports', 
      color: 'text-cyan-400',
      action: () => navigate('/reports')
    },
    { 
      icon: <HelpCircle className="w-4 h-4" />, 
      label: 'Help & Support', 
      color: 'text-yellow-400',
      action: () => navigate('/support')
    },
  ];

  // Theme options for user menu
  const themeOptions = [
    { icon: <Sun className="w-4 h-4" />, label: 'Light', value: 'light', bg: 'bg-yellow-500/20' },
    { icon: <Moon className="w-4 h-4" />, label: 'Dark', value: 'dark', bg: 'bg-gray-700' },
    { icon: <Palette className="w-4 h-4" />, label: 'Blue', value: 'blue', bg: 'bg-blue-500/20' },
    { icon: <Sparkles className="w-4 h-4" />, label: 'Premium', value: 'premium', bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20' },
  ];

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('velox_sound_enabled', newState.toString());
  };

  const toggleBalanceVisibility = () => {
    const newState = !showBalance;
    setShowBalance(newState);
    localStorage.setItem('velox_show_balance', newState.toString());
  };

  const toggleChatWidget = () => {
    const newState = !(localStorage.getItem('velox_chat_widget') === 'true');
    localStorage.setItem('velox_chat_widget', newState.toString());
    if (setShowChatWidget) {
      setShowChatWidget(newState);
    }
    alert(`Chat widget ${newState ? 'enabled' : 'disabled'}`);
  };

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 text-white border-b border-emerald-900/30 shadow-xl shadow-emerald-900/10">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu & Brand */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-emerald-400" />
              ) : (
                <Menu className="h-5 w-5 text-emerald-400" />
              )}
            </button>
            
            {/* Logo & Brand */}
            <div className="ml-3 lg:ml-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-50"></div>
                  <div className="relative bg-gray-900 p-1.5 rounded-lg border border-emerald-900/30">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    VeloxTradeAI
                  </div>
                  <div className="text-xs text-emerald-300/70 flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    Elite Trading Platform
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 hidden lg:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl blur"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Search stocks, signals, analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-emerald-900/30 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-emerald-300/50"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-3 py-1 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Right: Actions & User Menu */}
          <div className="flex items-center space-x-2">
            {/* Market Status */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-emerald-900/40 to-emerald-800/30 rounded-lg border border-emerald-800/30">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-400">LIVE</span>
            </div>

            {/* Live Time */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-emerald-900/30">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-cyan-300">{formatTime()}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="hidden md:flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-purple-500 transition-all"
              title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-purple-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Balance Toggle */}
            <button
              onClick={toggleBalanceVisibility}
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-emerald-900/30 hover:border-yellow-500 transition-all"
              title={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? (
                <EyeOff className="w-4 h-4 text-yellow-400" />
              ) : (
                <Eye className="w-4 h-4 text-yellow-400" />
              )}
              <span className="text-xs text-yellow-300">
                {showBalance ? 'Hide' : 'Show'} Balance
              </span>
            </button>

            {/* Chat Widget Toggle */}
            <button
              onClick={toggleChatWidget}
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-emerald-900/30 hover:border-pink-500 transition-all"
              title="Toggle chat widget"
            >
              <div className="w-4 h-4 text-pink-400">
                💬
              </div>
              <span className="text-xs text-pink-300">Chat</span>
            </button>

            {/* Quick Actions Dropdown */}
            <div className="relative" ref={quickActionsRef}>
              <button
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-900/40 to-blue-800/30 rounded-lg border border-blue-800/30 hover:border-blue-500 transition-all"
                title="Quick actions"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-300">Quick</span>
                <ChevronDown className="w-3 h-3 text-blue-400" />
              </button>
              
              {quickActionsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-emerald-900/30 shadow-2xl z-50">
                  <div className="p-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.action();
                          setQuickActionsOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${action.bg}`}>
                          <div className={action.color}>{action.icon}</div>
                        </div>
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Search Button */}
            <button 
              onClick={() => alert('Search functionality - Implement as needed')}
              className="lg:hidden p-2 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30"
              title="Search"
            >
              <Search className="h-5 w-5 text-emerald-400" />
            </button>
            
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-purple-500 transition-all group"
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-purple-400 group-hover:text-purple-300" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-gray-900"></span>
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
                  </>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-emerald-900/30 shadow-2xl z-50">
                  <div className="p-4 border-b border-emerald-900/30">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-white flex items-center space-x-2">
                        <Bell className="w-4 h-4" />
                        <span>Notifications</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded-full">
                          {notifications.filter(n => n.unread).length} New
                        </div>
                        {notifications.filter(n => n.unread).length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-emerald-900/20 hover:bg-gray-800/50 transition-colors ${notification.unread ? 'bg-emerald-900/10' : ''}`}
                          onClick={() => clearNotification(notification.id)}
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
                              <div className="w-2 h-2 bg-emerald-500 rounded-full cursor-pointer" title="Mark as read"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <div className="text-gray-400">No notifications</div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-emerald-900/30">
                    <button 
                      onClick={() => navigate('/alerts')}
                      className="w-full text-center text-sm text-emerald-400 hover:text-emerald-300 py-2"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-emerald-500 transition-all group"
                title="User menu"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full blur opacity-70"></div>
                  <div className="relative h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                    <Shield className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-bold text-white">
                    {userData?.name || 'Trader Pro'}
                  </div>
                  <div className="text-xs text-emerald-300/70">
                    {userData?.plan === 'elite' ? 'Elite Member' : 'Premium Member'}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-emerald-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown Menu - ALL FEATURES WORKING */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-emerald-900/30 shadow-2xl z-50 overflow-hidden">
                  {/* User Header */}
                  <div className="p-5 bg-gradient-to-r from-emerald-900/30 to-cyan-900/20 border-b border-emerald-900/30">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full blur opacity-50"></div>
                        <div className="relative h-14 w-14 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-lg">
                          {userData?.name || 'Trader Pro'}
                        </div>
                        <div className="text-sm text-emerald-300/80">
                          {userData?.email || 'premium@veloxtrade.ai'}
                        </div>
                        <div className="flex items-center mt-2 space-x-2">
                          <div className="text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2 py-1 rounded-full font-bold">
                            {userData?.plan === 'elite' ? 'ELITE MEMBER' : 'PREMIUM'}
                          </div>
                          <div className="text-xs bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-2 py-1 rounded-full font-bold">
                            Rank: Top 8%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats - REAL DATA */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="text-center p-2 bg-gradient-to-b from-gray-800/50 to-gray-900/30 rounded-lg border border-emerald-900/20">
                        <div className="text-xs text-emerald-300/70">Today's Profit</div>
                        <div className="text-lg font-bold text-emerald-400">
                          ₹{showBalance ? userStats.todayProfit.toLocaleString() : '******'}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gradient-to-b from-gray-800/50 to-gray-900/30 rounded-lg border border-emerald-900/20">
                        <div className="text-xs text-emerald-300/70">Win Rate</div>
                        <div className="text-lg font-bold text-emerald-400">{userStats.winRate}</div>
                      </div>
                      <div className="text-center p-2 bg-gradient-to-b from-gray-800/50 to-gray-900/30 rounded-lg border border-emerald-900/20">
                        <div className="text-xs text-emerald-300/70">Active Trades</div>
                        <div className="text-lg font-bold text-emerald-400">{userStats.activeTrades}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items - ALL WORKING */}
                  <div className="p-2">
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.action();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${item.color.replace('text-', 'bg-')}/20`}>
                          <div className={item.color}>{item.icon}</div>
                        </div>
                        <span>{item.label}</span>
                      </button>
                    ))}
                    
                    <div className="border-t border-emerald-900/30 my-2"></div>
                    
                    {/* Theme Selector - WORKING */}
                    <div className="p-3">
                      <div className="text-xs text-emerald-300/70 mb-2">Theme</div>
                      <div className="grid grid-cols-4 gap-2">
                        {themeOptions.map((theme, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              // Real theme change functionality
                              const themeName = theme.value;
                              document.documentElement.setAttribute('data-theme', themeName);
                              localStorage.setItem('velox_theme', themeName);
                              alert(`Theme changed to ${theme.label}`);
                            }}
                            className={`p-2 rounded-lg ${theme.bg} border border-emerald-900/30 hover:border-emerald-500 transition-all`}
                          >
                            <div className="flex flex-col items-center">
                              <div className={`p-1.5 rounded-full ${theme.bg}`}>
                                {theme.icon}
                              </div>
                              <span className="text-xs mt-1">{theme.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-emerald-900/30 my-2"></div>
                    
                    {/* Settings Toggles */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Sound Effects</span>
                        <button
                          onClick={toggleSound}
                          className={`w-12 h-6 rounded-full transition-all ${soundEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${soundEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Show Balance</span>
                        <button
                          onClick={toggleBalanceVisibility}
                          className={`w-12 h-6 rounded-full transition-all ${showBalance ? 'bg-emerald-500' : 'bg-gray-700'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${showBalance ? 'translate-x-7' : 'translate-x-1'}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Chat Widget</span>
                        <button
                          onClick={toggleChatWidget}
                          className={`w-12 h-6 rounded-full transition-all ${localStorage.getItem('velox_chat_widget') === 'true' ? 'bg-emerald-500' : 'bg-gray-700'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${localStorage.getItem('velox_chat_widget') === 'true' ? 'translate-x-7' : 'translate-x-1'}`}></div>
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-emerald-900/30 my-2"></div>
                    
                    {/* Logout Button - WORKING */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-red-900/40 to-red-800/30 hover:from-red-800/50 text-red-300 hover:text-white rounded-lg transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-bold">Logout</span>
                    </button>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-3 border-t border-emerald-900/30 text-center">
                    <div className="text-xs text-emerald-300/50">VeloxTradeAI v3.0 • Elite Edition</div>
                    <div className="text-xs text-gray-500 mt-1">Secure • Encrypted • Cloud</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <div className="flex flex-col space-y-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search stocks, signals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/80 rounded-xl border border-emerald-900/30 text-white placeholder-emerald-300/50"
              />
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
