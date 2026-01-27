import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Search, User, Menu, X, ChevronDown, 
  Clock, TrendingUp, Zap, Settings, 
  HelpCircle, Wallet, Shield, LogOut, BarChart3,
  Filter, Download, Share2, Eye, EyeOff, Volume2, 
  VolumeX, Sun, Moon, Palette, AlertCircle, CheckCircle,
  Sparkles, FileText, CreditCard, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = () => {
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('velox_auth_token');
      localStorage.removeItem('velox_user');
      window.location.href = '/login';
    }
  };

  const notifications = [
    { id: 1, text: 'Welcome to VeloxTradeAI!', time: 'Just now', type: 'info', unread: true },
    { id: 2, text: 'Complete your profile setup', time: '5 min ago', type: 'info', unread: true },
  ];

  const userStats = {
    todayProfit: 712365,
    winRate: '90%',
    activeTrades: 0
  };

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 text-white border-b border-emerald-900/30 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Top Row - Compact */}
        <div className="flex items-center justify-between h-14">
          {/* Left: Menu & Brand */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-emerald-500 transition-all"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? (
                <X className="h-4 w-4 text-emerald-400" />
              ) : (
                <Menu className="h-4 w-4 text-emerald-400" />
              )}
            </button>
            
            {/* Logo & Brand */}
            <div className="ml-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="relative bg-gray-900 p-1.5 rounded-lg border border-emerald-900/30">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-md font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    VeloxTradeAI
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search Bar - Only on desktop */}
          <div className="flex-1 max-w-md mx-4 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search stocks, signals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/80 rounded-lg border border-emerald-900/30 text-white placeholder-emerald-300/50 text-sm"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            {/* Live Time - Compact */}
            <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-md border border-emerald-900/30">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-cyan-300">{formatTime()}</span>
            </div>

            {/* Sound Toggle - Compact */}
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

            {/* Mobile Search Button */}
            <button className="lg:hidden p-1.5 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30">
              <Search className="h-4 w-4 text-emerald-400" />
            </button>
            
            {/* Notifications - Compact */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-1.5 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-purple-500 transition-all"
                title="Notifications"
              >
                <Bell className="h-4 w-4 text-purple-400" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-gray-900"></span>
                )}
              </button>
              
              {/* Notifications Dropdown - Compact */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-emerald-900/30 shadow-lg z-50">
                  <div className="p-3 border-b border-emerald-900/30">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-white text-sm">Notifications</div>
                      <div className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded-full">
                        {notifications.filter(n => n.unread).length} New
                      </div>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-3 border-b border-emerald-900/20 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start space-x-2">
                          <div className="mt-0.5">
                            {notification.type === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-white">{notification.text}</div>
                            <div className="text-xs text-emerald-300/70 mt-0.5">{notification.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* User Menu - Compact */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center p-1 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-emerald-500 transition-all"
                title="User menu"
              >
                <div className="relative">
                  <div className="relative h-7 w-7 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-emerald-400 ml-1 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown Menu - COMPACT AND FITS ON SCREEN */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-emerald-900/30 shadow-lg z-50 overflow-hidden">
                  {/* User Header - Compact */}
                  <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 border-b border-emerald-900/30">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="relative h-10 w-10 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">Trader Pro</div>
                        <div className="text-xs text-emerald-300/70">premium@veloxtrade.ai</div>
                      </div>
                    </div>
                    
                    {/* Quick Stats - Compact */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center p-1.5 bg-gray-800/40 rounded border border-emerald-900/20">
                        <div className="text-xs text-emerald-300/70">Today's P&L</div>
                        <div className="text-sm font-bold text-emerald-400">
                          ₹{showBalance ? userStats.todayProfit.toLocaleString() : '******'}
                        </div>
                      </div>
                      <div className="text-center p-1.5 bg-gray-800/40 rounded border border-emerald-900/20">
                        <div className="text-xs text-emerald-300/70">Win Rate</div>
                        <div className="text-sm font-bold text-emerald-400">{userStats.winRate}</div>
                      </div>
                      <div className="text-center p-1.5 bg-gray-800/40 rounded border border-emerald-900/20">
                        <div className="text-xs text-emerald-300/70">Trades</div>
                        <div className="text-sm font-bold text-emerald-400">{userStats.activeTrades}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items - Compact */}
                  <div className="p-2 max-h-80 overflow-y-auto">
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded transition-colors text-sm"
                    >
                      <Settings className="h-4 w-4 text-blue-400" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={() => navigate('/subscription')}
                      className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded transition-colors text-sm"
                    >
                      <Wallet className="h-4 w-4 text-green-400" />
                      <span>Account & Billing</span>
                    </button>
                    <button
                      onClick={() => navigate('/analytics')}
                      className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded transition-colors text-sm"
                    >
                      <BarChart3 className="h-4 w-4 text-purple-400" />
                      <span>Performance Analytics</span>
                    </button>
                    <button
                      onClick={() => navigate('/reports')}
                      className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded transition-colors text-sm"
                    >
                      <FileText className="h-4 w-4 text-cyan-400" />
                      <span>Trade Reports</span>
                    </button>
                    <button
                      onClick={() => navigate('/support')}
                      className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded transition-colors text-sm"
                    >
                      <HelpCircle className="h-4 w-4 text-yellow-400" />
                      <span>Help & Support</span>
                    </button>
                    
                    <div className="border-t border-emerald-900/30 my-2"></div>
                    
                    {/* Theme Selector - Compact */}
                    <div className="p-2">
                      <div className="text-xs text-emerald-300/70 mb-1">Theme</div>
                      <div className="grid grid-cols-4 gap-1">
                        <button className="p-1.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                          <Sun className="w-4 h-4 text-emerald-400 mx-auto" />
                          <div className="text-xs mt-0.5">Light</div>
                        </button>
                        <button className="p-1.5 rounded bg-gray-800/50 border border-gray-700">
                          <Moon className="w-4 h-4 text-gray-400 mx-auto" />
                          <div className="text-xs mt-0.5">Dark</div>
                        </button>
                        <button className="p-1.5 rounded bg-blue-500/20 border border-blue-500/30">
                          <Palette className="w-4 h-4 text-blue-400 mx-auto" />
                          <div className="text-xs mt-0.5">Blue</div>
                        </button>
                        <button className="p-1.5 rounded bg-purple-500/20 border border-purple-500/30">
                          <Sparkles className="w-4 h-4 text-purple-400 mx-auto" />
                          <div className="text-xs mt-0.5">Premium</div>
                        </button>
                      </div>
                    </div>
                    
                    {/* Settings Toggles - Compact */}
                    <div className="p-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Sound Effects</span>
                        <button
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className={`w-10 h-5 rounded-full transition-all ${soundEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Show Balance</span>
                        <button
                          onClick={() => setShowBalance(!showBalance)}
                          className={`w-10 h-5 rounded-full transition-all ${showBalance ? 'bg-emerald-500' : 'bg-gray-700'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${showBalance ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-emerald-900/30 my-2"></div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-1.5 p-2 bg-gradient-to-r from-red-900/30 to-red-800/20 hover:from-red-800/40 text-red-300 hover:text-white rounded transition-all text-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-2 border-t border-emerald-900/30 text-center">
                    <div className="text-xs text-emerald-300/50">VeloxTradeAI v3.0</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-emerald-400" />
            <input
              type="text"
              placeholder="Search stocks, signals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900/80 rounded-lg border border-emerald-900/30 text-white placeholder-emerald-300/50 text-sm"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
