import React, { useState } from 'react';
import { Bell, Search, User, Menu, X, ChevronDown, Clock, RefreshCw, TrendingUp, Zap } from 'lucide-react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching:', searchQuery);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('velox_auth_token');
      localStorage.removeItem('velox_user');
      window.location.href = '/login';
    }
  };

  // NO FAKE NOTIFICATIONS
  const notifications = [];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-gray-950 text-white border-b border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu Button & Brand */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500 transition-all"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-blue-400" />
              ) : (
                <Menu className="h-5 w-5 text-blue-400" />
              )}
            </button>
            
            <div className="ml-4 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1.5 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    VeloxTradeAI
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 hidden lg:block">
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search stocks, symbols..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-gray-900/80 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  />
                </div>
              </form>
              
              {/* Live Status */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-400">LIVE</span>
              </div>
            </div>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <button className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-900/40 to-cyan-900/30 rounded-lg border border-blue-800/30 hover:border-blue-600 transition-all">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300">Refresh</span>
            </button>

            {/* Mobile Search */}
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
                {/* No notification badge if empty */}
              </button>
              
              {notificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-gray-800 z-50">
                    <div className="p-4 border-b border-gray-800">
                      <div className="font-bold text-white">Notifications</div>
                    </div>
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <div className="text-gray-400">No notifications</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-1.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-600 transition-all"
              >
                <div className="relative">
                  <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-bold text-white">Trader User</div>
                  <div className="text-xs text-gray-400">Premium</div>
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
                  <div className="absolute right-0 mt-2 w-72 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-gray-800 z-50">
                    {/* User Info */}
                    <div className="p-5 border-b border-gray-800">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-lg">Trader User</div>
                          <div className="text-sm text-gray-400">premium@veloxtrade.ai</div>
                          <div className="mt-2">
                            <div className="text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2 py-1 rounded-full font-bold">
                              Premium Member
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-2">
                      <button className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg">
                        <div className="text-blue-400">👤</div>
                        <span>Profile Settings</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg">
                        <div className="text-green-400">💰</div>
                        <span>Account & Billing</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg">
                        <div className="text-purple-400">❓</div>
                        <span>Help & Support</span>
                      </button>
                      
                      <div className="border-t border-gray-800 my-2"></div>
                      
                      {/* LOGOUT BUTTON HERE - Moved from Sidebar */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-red-900/40 to-red-800/30 hover:from-red-800/50 text-red-300 hover:text-white rounded-lg"
                      >
                        <span className="font-bold">Logout</span>
                      </button>
                    </div>
                    
                    {/* Footer */}
                    <div className="p-3 border-t border-gray-800 text-center">
                      <div className="text-xs text-gray-500">VeloxTradeAI v2.0</div>
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/80 rounded-xl border border-gray-700 text-white placeholder-gray-400"
            />
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
