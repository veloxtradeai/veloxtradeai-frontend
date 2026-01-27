import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Building2,
  TrendingUp,
  User,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Zap,
  Wallet,
  Target,
  TrendingDown,
  Activity,
  PieChart,
  CloudLightning,
  Rocket,
  Crown,
  Sparkles,
  Star,
  Award,
  BatteryCharging,
  Wifi,
  RefreshCw,
  Brain,
  Cpu
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [hasNotifications] = useState(true);
  const [dailyProfit, setDailyProfit] = useState(712);
  const [winRate, setWinRate] = useState(68.5);
  const [connectionStatus, setConnectionStatus] = useState({
    broker: true,
    api: true,
    websocket: true
  });
  const [activeTrades, setActiveTrades] = useState(5);
  const location = useLocation();

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Dashboard',
      badge: 'NEW',
      color: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-400'
    },
    { 
      path: '/analytics', 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: 'Analytics',
      pro: true,
      color: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-400'
    },
    { 
      path: '/subscription', 
      icon: <Crown className="w-5 h-5" />, 
      label: 'Subscription',
      status: 'pro',
      color: 'from-yellow-500 to-orange-500',
      iconColor: 'text-yellow-400'
    },
    { 
      path: '/broker-settings', 
      icon: <Building2 className="w-5 h-5" />, 
      label: 'Broker',
      count: 2,
      color: 'from-green-500 to-emerald-500',
      iconColor: 'text-green-400'
    },
    { 
      path: '/ai-insights', 
      icon: <Brain className="w-5 h-5" />, 
      label: 'AI Insights',
      badge: 'AI',
      color: 'from-violet-500 to-purple-500',
      iconColor: 'text-violet-400'
    },
    { 
      path: '/settings', 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings',
      color: 'from-gray-600 to-gray-700',
      iconColor: 'text-gray-400'
    },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('velox_auth_token');
      localStorage.removeItem('velox_user');
      window.location.href = '/login';
    }
  };

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDailyProfit(prev => {
        const change = Math.floor(Math.random() * 200 - 100);
        return Math.max(prev + change, 500);
      });
      setWinRate(prev => {
        const newRate = prev + (Math.random() * 1 - 0.5);
        return Math.min(Math.max(newRate, 65), 75);
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="h-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white flex flex-col w-64 border-r border-gray-800">
      {/* Logo Section with Glow Effect */}
      <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-70"></div>
            <div className="relative bg-gray-900 p-2 rounded-xl border border-gray-700">
              <Rocket className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              VeloxTradeAI
            </div>
            <div className="text-xs text-gray-400 flex items-center mt-1">
              <CloudLightning className="w-3 h-3 mr-2 text-yellow-500" />
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-medium">
                Professional Trading
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile with Gradient */}
      <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur opacity-50"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-gray-900">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg truncate">Trader User</div>
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 text-yellow-400 mr-1" />
                <div className="text-xs bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 px-2.5 py-0.5 rounded-full font-bold">
                  PREMIUM
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400 flex items-center mt-1">
              <Wallet className="w-3 h-3 mr-2 text-cyan-400" />
              <span>Premium Member</span>
            </div>
            <div className="mt-3 p-2.5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <div className="text-sm font-bold text-green-400">
                    +₹{dailyProfit.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs bg-gray-800 px-2 py-1 rounded-lg text-gray-300">
                  Today
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="px-5 py-3 bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus.broker ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400">Broker Connected</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wifi className="w-3 h-3 text-green-500" />
            <BatteryCharging className="w-3 h-3 text-green-500" />
            <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-5 overflow-y-auto sidebar-scroll">
        <div className="mb-4">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2 flex items-center">
            <Activity className="w-3 h-3 mr-2 text-blue-500" />
            MAIN MENU
          </div>
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group relative
                      ${isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split('-')[1]}/20` 
                        : 'text-gray-300 hover:bg-gray-800/80 hover:text-white hover:shadow-lg hover:border hover:border-gray-700'
                      }
                    `}
                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        p-2 rounded-lg transition-all duration-300
                        ${isActive 
                          ? `bg-white/20 backdrop-blur-sm` 
                          : 'bg-gray-800 group-hover:bg-gray-700'
                        }
                      `}>
                        <div className={isActive ? 'text-white' : item.iconColor}>
                          {item.icon}
                        </div>
                      </div>
                      <div className={`font-medium ${isActive ? 'text-white font-bold' : ''}`}>
                        {item.label}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <div className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          item.badge === 'NEW' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                            : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                        }`}>
                          {item.badge}
                        </div>
                      )}
                      {item.pro && (
                        <div className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 py-0.5 rounded-full font-bold">
                          PRO
                        </div>
                      )}
                      {item.count && (
                        <div className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                          {item.count}
                        </div>
                      )}
                      {item.status && (
                        <div className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-bold">
                          {item.status}
                        </div>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                    </div>
                    
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r-full"></div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2 flex items-center">
            <PieChart className="w-3 h-3 mr-2 text-purple-500" />
            QUICK STATS
          </div>
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-400">Active Trades</div>
                <div className="text-sm font-bold text-cyan-400">{activeTrades}</div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-400">AI Confidence</div>
                <div className="text-sm font-bold text-green-400">85.6%</div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '85.6%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-5 border-t border-gray-800 bg-gradient-to-t from-gray-950 to-gray-900">
        {/* Performance Stats */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-yellow-500" />
              <div className="text-sm font-bold text-white">Performance</div>
            </div>
            <div className="flex items-center text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
              LIVE
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">Brokers</div>
              <div className="text-sm font-bold text-green-400">
                2 Active
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">Win Rate</div>
              <div className="flex items-center space-x-2">
                <div className="text-sm font-bold text-green-400">
                  {winRate.toFixed(1)}%
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <div className="pt-1">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-1000"
                  style={{ width: `${winRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-800/30 hover:border-blue-600 transition-all hover:scale-105">
            <div className="relative">
              <Bell className="w-5 h-5 text-blue-400" />
              {hasNotifications && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              )}
            </div>
            <div className="text-xs mt-1 text-blue-300">Alerts</div>
          </button>
          
          <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-800/30 hover:border-purple-600 transition-all hover:scale-105">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <div className="text-xs mt-1 text-purple-300">Help</div>
          </button>
          
          <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border border-cyan-800/30 hover:border-cyan-600 transition-all hover:scale-105">
            <Star className="w-5 h-5 text-cyan-400" />
            <div className="text-xs mt-1 text-cyan-300">Themes</div>
          </button>
          
          <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-pink-900/50 to-pink-800/30 border border-pink-800/30 hover:border-pink-600 transition-all hover:scale-105">
            <Award className="w-5 h-5 text-pink-400" />
            <div className="text-xs mt-1 text-pink-300">Rewards</div>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-900/40 to-red-800/30 border border-red-800/30 hover:border-red-600 hover:bg-gradient-to-r hover:from-red-800/50 hover:to-red-700/40 text-red-300 hover:text-white transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          <div className="text-sm font-bold">Logout</div>
        </button>

        {/* Version Info */}
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-500">v2.0.1</div>
          <div className="text-xs text-gray-600 mt-1 flex items-center justify-center space-x-2">
            <Cpu className="w-3 h-3" />
            <span>AI-Powered Trading Platform</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
