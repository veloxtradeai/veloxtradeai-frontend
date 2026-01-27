import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Crown, 
  Settings, 
  Building2,
  TrendingUp,
  User,
  Bell,
  HelpCircle,
  Zap,
  Wallet,
  Target,
  Activity,
  PieChart,
  Rocket,
  Shield,
  Sparkles,
  Cpu,
  Star,
  Award,
  Wifi,
  BatteryCharging,
  RefreshCw
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  // NO FAKE DATA - only static labels
  const menuItems = [
    { 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Dashboard',
      color: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-400'
    },
    { 
      path: '/analytics', 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: 'Analytics',
      color: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-400'
    },
    { 
      path: '/subscription', 
      icon: <Crown className="w-5 h-5" />, 
      label: 'Subscription',
      color: 'from-yellow-500 to-orange-500',
      iconColor: 'text-yellow-400'
    },
    { 
      path: '/broker-settings', 
      icon: <Building2 className="w-5 h-5" />, 
      label: 'Broker',
      color: 'from-green-500 to-emerald-500',
      iconColor: 'text-green-400'
    },
    { 
      path: '/settings', 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings',
      color: 'from-gray-600 to-gray-700',
      iconColor: 'text-gray-400'
    },
  ];

  return (
    <aside className="h-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white flex flex-col w-64 border-r border-gray-800">
      {/* Logo Section - Simple and Clean */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl">
              <Rocket className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              VeloxTradeAI
            </div>
            <div className="text-xs text-gray-400">
              Professional Trading
            </div>
          </div>
        </div>
      </div>

      {/* User Profile - No Fake Numbers */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg truncate">Trader User</div>
              <div className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-0.5 rounded-full font-bold">
                PREMIUM
              </div>
            </div>
            <div className="text-xs text-gray-400 flex items-center mt-1">
              <Wallet className="w-3 h-3 mr-2 text-cyan-400" />
              <span>Premium Member</span>
            </div>
            {/* NO FAKE PROFIT NUMBER - Just Label */}
            <div className="mt-3 p-2.5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <div className="text-sm font-bold text-green-400">
                    Live Profit
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

      {/* Connection Status - Static */}
      <div className="px-5 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-400">Broker Connected</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wifi className="w-3 h-3 text-green-500" />
            <BatteryCharging className="w-3 h-3 text-green-500" />
          </div>
        </div>
      </div>

      {/* Navigation Menu - Proper Spacing */}
      <nav className="flex-1 p-5 overflow-y-auto">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">
            MAIN MENU
          </div>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                      ${isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                        : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                      }
                    `}
                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  >
                    <div className={`
                      p-2 rounded-lg mr-3
                      ${isActive 
                        ? 'bg-white/20' 
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
                    
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Stats - Labels Only */}
        <div className="mt-8">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">
            QUICK VIEW
          </div>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-400">Performance</div>
                <div className="flex items-center text-xs text-green-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Live
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-300">Brokers</div>
                  <div className="text-sm font-bold text-cyan-400">Connected</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-300">AI Status</div>
                  <div className="text-sm font-bold text-green-400">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-5 border-t border-gray-800">
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-800/30 hover:border-blue-600 transition-all">
            <Bell className="w-5 h-5 text-blue-400" />
            <div className="text-xs mt-1 text-blue-300">Alerts</div>
          </button>
          
          {/* Theme Toggle - Fixed */}
          <ThemeToggle />
          
          <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border border-cyan-800/30 hover:border-cyan-600 transition-all">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <div className="text-xs mt-1 text-cyan-300">Help</div>
          </button>
        </div>

        {/* Version Info - NO LOGOUT BUTTON */}
        <div className="text-center pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-500">VeloxTradeAI v2.0</div>
          <div className="text-xs text-gray-600 mt-1 flex items-center justify-center space-x-2">
            <Cpu className="w-3 h-3" />
            <span>AI Trading Platform</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
