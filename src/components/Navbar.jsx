import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Search, User, Menu, X, ChevronDown, 
  Clock, RefreshCw, TrendingUp, Zap, Settings, 
  HelpCircle, Wallet, Shield, LogOut, BarChart3,
  Target, Filter, Download,
  Share2, Eye, EyeOff, Volume2, VolumeX, Sun,
  Moon, Palette, AlertCircle, CheckCircle,
  Sparkles, TrendingDown, BarChart, PieChart,
  Users, Activity, TargetIcon, Award, TrendingUp as TrendingUpIcon
} from 'lucide-react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState('open');
  const [isMobile, setIsMobile] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const quickActionsRef = useRef(null);

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
      console.log('Searching:', searchQuery);
      // Implement real search
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('velox_auth_token');
      localStorage.removeItem('velox_user');
      window.location.href = '/login';
    }
  };

  const notifications = [
    { id: 1, text: 'New AI signal detected!', time: '2 min ago', type: 'success', unread: true },
    { id: 2, text: 'Daily profit target achieved!', time: '5 min ago', type: 'success', unread: true },
    { id: 3, text: 'Broker connection established', time: '10 min ago', type: 'success', unread: false },
    { id: 4, text: 'Market volatility high - Trade carefully', time: '15 min ago', type: 'warning', unread: false },
    { id: 5, text: 'System update available', time: '1 hour ago', type: 'info', unread: false }
  ];

  const quickActions = [
    { icon: <Download className="w-4 h-4" />, label: 'Export Data', color: 'text-blue-400', bg: 'bg-blue-500/20', action: () => console.log('Export Data') },
    { icon: <Share2 className="w-4 h-4" />, label: 'Share Report', color: 'text-green-400', bg: 'bg-green-500/20', action: () => console.log('Share Report') },
    { icon: <Filter className="w-4 h-4" />, label: 'Advanced Filter', color: 'text-purple-400', bg: 'bg-purple-500/20', action: () => console.log('Advanced Filter') },
    { icon: <BarChart className="w-4 h-4" />, label: 'New Chart', color: 'text-cyan-400', bg: 'bg-cyan-500/20', action: () => console.log('New Chart') }
  ];

  const userStats = {
    todayProfit: 712365,
    winRate: '68.5%',
    activeTrades: 5,
    rank: 'Top 8%'
  };

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 text-white border-b border-emerald-900/30 shadow-lg shadow-emerald-900/10">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Top Row - Height reduced */}
        <div className="flex items-center justify-between h-14">
          {/* Left: Menu & Brand */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/10 transition-all"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? (
                <X className="h-4 w-4 text-emerald-400" />
              ) : (
                <Menu className="h-4 w-4 text-emerald-400" />
              )}
            </button>
            
            {/* Logo & Brand - Smaller */}
            <div className="ml-3 lg:ml-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-40"></div>
                  <div className="relative bg-gray-900 p-1.5 rounded-lg border border-emerald-900/30">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-md font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    VeloxTradeAI
                  </div>
                  <div className="text-xs text-emerald-300/70 flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    Elite Trading Platform
                  </div>
                </div>
              </div>
            </div>

            {/* Market Indices REMOVED - Now only in Dashboard */}
          </div>

          {/* Center: Search Bar - Smaller */}
          <div className="flex-1 max-w-2xl mx-4 hidden lg:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Search stocks, signals, analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-emerald-900/30 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-emerald-300/50 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-2.5 py-1 rounded-md hover:opacity-90 transition-opacity"
                >
                  Go
                </button>
              </div>
            </form>
          </div>

          {/* Right: Actions & User Menu - Smaller icons and buttons */}
          <div className="flex items-center space-x-2">
            {/* Market Status - Smaller */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 rounded-md border border-emerald-800/30">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-400">LIVE</span>
            </div>

            {/* Live Time - Smaller */}
            <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-md border border-emerald-900/30">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span className="text-xs text-cyan-300">{formatTime()}</span>
            </div>

            {/* Sound Toggle - Smaller */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="hidden md:flex items-center justify-center p-1.5 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-purple-500 transition-all"
              title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-gray-500" />
              )}
            </button>

            {/* Balance Toggle - Smaller */}
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-md border border-emerald-900/30 hover:border-yellow-500 transition-all"
              title={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? (
                <EyeOff className="w-3.5 h-3.5 text-yellow-400" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-yellow-400" />
              )}
              <span className="text-xs text-yellow-300">
                {showBalance ? 'Hide' : 'Show'}
              </span>
            </button>

            {/* Quick Actions Dropdown - Smaller */}
            <div className="relative" ref={quickActionsRef}>
              <button
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-900/30 to-blue-800/20 rounded-md border border-blue-800/30 hover:border-blue-500 transition-all"
                title="Quick actions"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-blue-300">Actions</span>
                <ChevronDown className="w-3 h-3 text-blue-400" />
              </button>
              
              {quickActionsOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-emerald-900/30 shadow-lg z-50">
                  <div className="p-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm"
                      >
                        <div className={`p-1.5 rounded-md ${action.bg}`}>
                          <div className={action.color}>{action.icon}</div>
                        </div>
                        <span className="text-xs">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Search Button - Smaller */}
            <button 
              className="lg:hidden p-1.5 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30"
              title="Search"
            >
              <Search className="h-4 w-4 text-emerald-400" />
            </button>
            
            {/* Notifications - Smaller */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-1.5 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-purple-500 transition-all"
                title="Notifications"
              >
                <Bell className="h-4 w-4 text-purple-400" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-gray-900"></span>
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-ping opacity-75"></span>
                  </>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-emerald-900/30 shadow-lg z-50">
                  <div className="p-3 border-b border-emerald-900/30">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-white flex items-center space-x-2 text-sm">
                        <Bell className="w-4 h-4" />
                        <span>Notifications</span>
                      </div>
                      <div className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded-full">
                        {notifications.filter(n => n.unread).length} New
                      </div>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b border-emerald-900/20 hover:bg-gray-800/50 transition-colors ${notification.unread ? 'bg-emerald-900/10' : ''}`}
                        >
                          <div className="flex items-start space-x-2">
                            <div className={`mt-0.5 p-1 rounded-full ${notification.type === 'success' ? 'bg-emerald-500/20' : notification.type === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                              {notification.type === 'success' ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              ) : notification.type === 'warning' ? (
                                <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                              ) : (
                                <Bell className="w-3.5 h-3.5 text-blue-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{notification.text}</div>
                              <div className="text-xs text-emerald-300/70 mt-0.5">{notification.time}</div>
                            </div>
                            {notification.unread && (
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                        <div className="text-gray-400 text-sm">No notifications</div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-emerald-900/30">
                    <button className="w-full text-center text-xs text-emerald-400 hover:text-emerald-300 py-1.5">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Menu - Smaller */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-emerald-500 transition-all"
                title="User menu"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full blur opacity-60"></div>
                  <div className="relative h-7 w-7 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center border border-gray-900">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border border-gray-900 flex items-center justify-center">
                    <Shield className="w-1.5 h-1.5 text-white" />
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-white">Trader Pro</div>
                  <div className="text-xs text-emerald-300/70">Elite</div>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-emerald-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-emerald-900/30 shadow-lg z-50 overflow-hidden">
                  {/* User Header */}
                  <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 border-b border-emerald-900/30">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full blur opacity-40"></div>
                        <div className="relative h-12 w-12 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">Trader Pro</div>
                        <div className="text-sm text-emerald-300/80">premium@veloxtrade.ai</div>
                        <div className="flex items-center mt-1.5 space-x-1.5">
                          <div className="text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2 py-0.5 rounded-full font-bold">
                            ELITE
                          </div>
                          <div className="text-xs bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-2 py-0.5 rounded-full">
                            Top 8%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats - Smaller */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center p-1.5 bg-gradient-to-b from-gray-800/50 to-gray-900/30 rounded-md border border-emerald-900/20">
                        <div className="text-xs text-emerald-300/70">Today's P&L</div>
                        <div className="text-sm font-bold text-emerald-400">
                          ₹{userStats.todayProfit.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center p-1.5 bg-gradient-to-b from-gray-800/50 to-gray-900/30 rounded-md border border-emerald-900/20">
                        <div className="text-xs text-emerald-300/70">Win Rate</div>
                        <div className="text-sm font-bold text-emerald-400">{userStats.winRate}</div>
                      </div>
                      <div className="text-center p-1.5 bg-gradient-to-b from-gray-800/50 to-gray-900/30 rounded-md border border-emerald-900/20">
                        <div className="text-xs text-emerald-300/70">Trades</div>
                        <div className="text-sm font-bold text-emerald-400">{userStats.activeTrades}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items - Smaller */}
                  <div className="p-1">
                    <button className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors text-sm">
                      <Settings className="h-4 w-4 text-blue-400" />
                      <span>Profile Settings</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors text-sm">
                      <Wallet className="h-4 w-4 text-green-400" />
                      <span>Account & Billing</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors text-sm">
                      <BarChart3 className="h-4 w-4 text-purple-400" />
                      <span>Performance Analytics</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors text-sm">
                      <HelpCircle className="h-4 w-4 text-cyan-400" />
                      <span>Help & Support</span>
                    </button>
                    
                    <div className="border-t border-emerald-900/30 my-1"></div>
                    
                    {/* Theme Selector - Smaller */}
                    <div className="p-2">
                      <div className="text-xs text-emerald-300/70 mb-1.5">Theme</div>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button className="p-1.5 rounded-md bg-emerald-500/20 border border-emerald-500/30">
                          <Sun className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                        </button>
                        <button className="p-1.5 rounded-md bg-gray-800/50 border border-gray-700">
                          <Moon className="w-3.5 h-3.5 text-gray-400 mx-auto" />
                        </button>
                        <button className="p-1.5 rounded-md bg-blue-500/20 border border-blue-500/30">
                          <Palette className="w-3.5 h-3.5 text-blue-400 mx-auto" />
                        </button>
                        <button className="p-1.5 rounded-md bg-purple-500/20 border border-purple-500/30">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 mx-auto" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-emerald-900/30 my-1"></div>
                    
                    {/* Logout Button - Smaller */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-1.5 p-2 bg-gradient-to-r from-red-900/30 to-red-800/20 hover:from-red-800/40 text-red-300 hover:text-white rounded-md transition-all text-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                  
                  {/* Footer - Smaller */}
                  <div className="p-2 border-t border-emerald-900/30 text-center">
                    <div className="text-xs text-emerald-300/50">VeloxTradeAI v3.0</div>
                    <div className="text-xs text-gray-500 mt-0.5">Secure • Encrypted</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar - Removed market indices completely */}
        <div className="lg:hidden pb-2">
          <div className="flex flex-col space-y-2">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-emerald-400" />
              <input
                type="text"
                placeholder="Search stocks, signals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/80 rounded-lg border border-emerald-900/30 text-white placeholder-emerald-300/50 text-sm"
              />
            </form>
            
            {/* Mobile Market Indices REMOVED - Now only in Dashboard */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
