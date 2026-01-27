import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Menu, X, ChevronDown, LogOut, TrendingUp, Zap, Clock, RefreshCw, Settings, HelpCircle, Wallet, Shield } from 'lucide-react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState('open');
  
  const user = {
    name: 'Trader User',
    email: 'premium@veloxtrade.ai',
    level: 'Premium Pro',
    profit: '+₹712,365',
    rank: 'Top 5%'
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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
      // Implement search functionality
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
    { id: 1, text: 'NIFTY crossed 22,500!', time: '2 min ago', type: 'success' },
    { id: 2, text: 'New AI recommendation: RELIANCE', time: '5 min ago', type: 'info' },
    { id: 3, text: 'Broker connection stable', time: '10 min ago', type: 'success' },
    { id: 4, text: 'Market volatility high', time: '15 min ago', type: 'warning' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 text-white border-b border-gray-800 shadow-2xl">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu Button & Brand */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-blue-400" />
              ) : (
                <Menu className="h-5 w-5 text-blue-400" />
              )}
            </button>
            
            <div className="ml-4 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-50"></div>
                  <div className="relative bg-gray-900 p-1.5 rounded-lg border border-gray-700">
                    <TrendingUp className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    VeloxTradeAI
                  </div>
                  <div className="text-xs text-gray-400 flex items-center">
                    <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                    Professional Trading
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search Bar & Stats */}
          <div className="flex-1 max-w-2xl mx-4 hidden lg:block">
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search stocks, AI signals, analytics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  />
                </div>
              </form>
              
              {/* Live Stats */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-400">LIVE</span>
                </div>
                <div className="text-xs text-gray-400">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatTime()}
                </div>
              </div>
            </div>
          </div>

          {/* Right: User Menu & Actions */}
          <div className="flex items-center space-x-3">
            {/* Market Status */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-900/40 to-emerald-900/30 rounded-lg border border-green-800/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-green-400">MARKET OPEN</span>
            </div>

            {/* Refresh Button */}
            <button className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-900/40 to-cyan-900/30 rounded-lg border border-blue-800/30 hover:border-blue-600 transition-all">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300">Refresh</span>
            </button>

            {/* Mobile Search Button */}
            <button className="lg:hidden p-2 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
              <Search className="h-5 w-5 text-blue-400" />
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-purple-600 transition-all"
              >
                <Bell className="h-5 w-5 text-purple-400" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-gray-900"></span>
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
              </button>
              
              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl shadow-2xl border border-gray-800 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-800">
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-white">Notifications</div>
                        <div className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded-full">
                          {notifications.length} New
                        </div>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 mt-1.5 rounded-full ${
                              notification.type === 'success' ? 'bg-green-500' :
                              notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{notification.text}</div>
                              <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-800">
                      <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-1.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-600 transition-all group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur opacity-70"></div>
                  <div className="relative h-9 w-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                    <Shield className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-gray-400 flex items-center">
                    <Wallet className="w-3 h-3 mr-1 text-yellow-500" />
                    {user.level}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl shadow-2xl border border-gray-800 z-50 overflow-hidden">
                    {/* User Info */}
                    <div className="p-5 bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-800">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur opacity-50"></div>
                          <div className="relative h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-lg">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                          <div className="flex items-center mt-2">
                            <div className="text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2 py-1 rounded-full font-bold mr-2">
                              {user.level}
                            </div>
                            <div className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-1 rounded-full font-bold">
                              {user.rank}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-400">Today's Profit</div>
                          <div className="text-lg font-bold text-green-400">{user.profit}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-2">
                      <button className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                        <Settings className="h-5 w-5 text-blue-400" />
                        <span>Profile Settings</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                        <Wallet className="h-5 w-5 text-green-400" />
                        <span>Account & Billing</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                        <HelpCircle className="h-5 w-5 text-purple-400" />
                        <span>Help & Support</span>
                      </button>
                      
                      <div className="border-t border-gray-800 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-red-900/40 to-red-800/30 hover:from-red-800/50 hover:to-red-700/40 text-red-300 hover:text-white rounded-lg transition-all"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-bold">Logout</span>
                      </button>
                    </div>
                    
                    {/* Footer */}
                    <div className="p-3 border-t border-gray-800 text-center">
                      <div className="text-xs text-gray-500">VeloxTradeAI v2.0.1</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="pb-3 lg:hidden">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur"></div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 text-white placeholder-gray-400"
              />
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
