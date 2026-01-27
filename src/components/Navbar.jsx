import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Search, User, Menu, X, ChevronDown, 
  Clock, TrendingUp, Zap, Settings, 
  HelpCircle, Wallet, LogOut, BarChart3,
  Volume2, VolumeX, Sun, Moon, Palette,
  Sparkles, CheckCircle, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Load real data
  useEffect(() => {
    const loadData = () => {
      try {
        // Load user data
        const savedUser = JSON.parse(localStorage.getItem('velox_user') || '{}');
        setUserData(savedUser);

        // Load notifications
        const savedNotifications = JSON.parse(localStorage.getItem('velox_notifications') || '[]');
        setNotifications(savedNotifications);

        // Load sound preference
        const soundPref = localStorage.getItem('velox_sound_enabled');
        if (soundPref !== null) {
          setSoundEnabled(soundPref === 'true');
        }
      } catch (error) {
        console.error('Error loading navbar data:', error);
      }
    };

    loadData();
  }, []);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns
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

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('velox_sound_enabled', newState.toString());
  };

  const clearNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('velox_notifications', JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('velox_notifications', '[]');
  };

  const themeOptions = [
    { id: 'light', name: 'Light', icon: <Sun className="w-4 h-4" />, color: 'from-yellow-400 to-orange-400' },
    { id: 'dark', name: 'Dark', icon: <Moon className="w-4 h-4" />, color: 'from-gray-800 to-gray-900' },
    { id: 'blue', name: 'Blue', icon: <Palette className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'premium', name: 'Premium', icon: <Sparkles className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-gray-900 to-gray-950 text-white border-b border-emerald-900/30 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors lg:hidden"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-emerald-400" />
              ) : (
                <Menu className="h-5 w-5 text-emerald-400" />
              )}
            </button>
            
            <div className="ml-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-gray-800 border border-emerald-900/30">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-lg font-bold text-white">VeloxTradeAI</div>
                  <div className="text-xs text-emerald-300/70">Elite Trading Platform</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Search */}
          <div className="flex-1 max-w-xl mx-4 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search stocks, signals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 rounded-lg border border-emerald-900/30 text-white placeholder-emerald-300/50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Time */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-emerald-900/30">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300">{formatTime()}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="hidden md:flex p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-5 h-5 text-emerald-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg border border-emerald-900/30 shadow-xl z-50">
                  <div className="p-3 border-b border-emerald-900/30">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-white">Notifications</div>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className="p-3 border-b border-emerald-900/20 hover:bg-gray-800/50 transition-colors"
                          onClick={() => clearNotification(notification.id)}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="mt-0.5">
                              {notification.type === 'success' ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-white">{notification.text}</div>
                              <div className="text-xs text-emerald-300/70 mt-0.5">{notification.time}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <div className="text-gray-400">No notifications</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-bold text-white">
                    {userData?.name || 'Trader Pro'}
                  </div>
                  <div className="text-xs text-emerald-300/70">Premium Member</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg border border-emerald-900/30 shadow-xl z-50">
                  <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-cyan-900/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {userData?.name || 'Trader Pro'}
                        </div>
                        <div className="text-sm text-emerald-300/70">
                          {userData?.email || 'premium@veloxtrade.ai'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {/* Menu Items */}
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                    >
                      <Settings className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">Profile Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/subscription');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Account & Billing</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/analytics');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">Performance Analytics</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/reports');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">Trade Reports</span>
                    </button>

                    {/* Theme Selector */}
                    <div className="p-2 mt-2">
                      <div className="text-xs text-emerald-300/70 mb-2">Theme</div>
                      <div className="grid grid-cols-2 gap-2">
                        {themeOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              changeTheme(option.id);
                              setUserMenuOpen(false);
                            }}
                            className={`flex items-center justify-center space-x-2 p-2 rounded border ${
                              theme === option.id 
                                ? 'border-emerald-500 bg-emerald-500/10' 
                                : 'border-emerald-900/30 hover:border-emerald-500/50'
                            }`}
                          >
                            <div className={`p-1 rounded ${option.icon.props.className.includes('text-') ? '' : 'text-emerald-400'}`}>
                              {option.icon}
                            </div>
                            <span className="text-sm">{option.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sound Toggle */}
                    <div className="p-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Sound Effects</span>
                        <button
                          onClick={toggleSound}
                          className={`w-10 h-5 rounded-full transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                            soundEnabled ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Logout */}
                    <div className="mt-2 pt-2 border-t border-emerald-900/30">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 p-2 bg-red-900/30 hover:bg-red-800/40 text-red-300 hover:text-white rounded transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="pb-3 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <input
              type="text"
              placeholder="Search stocks, signals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 rounded-lg border border-emerald-900/30 text-white placeholder-emerald-300/50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
