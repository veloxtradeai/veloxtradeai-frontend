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
  Wallet
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [hasNotifications] = useState(true);
  const [dailyProfit, setDailyProfit] = useState(12450);
  const [winRate, setWinRate] = useState(68.5);
  const location = useLocation();

  const menuItems = [
    { 
      path: '/', 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Dashboard',
      badge: '5'
    },
    { 
      path: '/analytics', 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: 'Analytics',
      pro: true
    },
    { 
      path: '/subscription', 
      icon: <CreditCard className="w-5 h-5" />, 
      label: 'Subscription',
      status: 'pro'
    },
    { 
      path: '/broker-settings', 
      icon: <Building2 className="w-5 h-5" />, 
      label: 'Broker Settings',
      count: 2
    },
    { 
      path: '/settings', 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings'
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
      setDailyProfit(prev => prev + Math.floor(Math.random() * 100 - 50));
      setWinRate(prev => {
        const newRate = prev + (Math.random() * 0.5 - 0.25);
        return Math.min(Math.max(newRate, 65), 72);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="h-full bg-gradient-to-b from-gray-900 to-gray-950 text-white flex flex-col w-64">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div>
            <div className="text-xl font-bold">VeloxTradeAI</div>
            <div className="text-xs text-gray-400 flex items-center">
              <Zap className="w-3 h-3 mr-1 text-yellow-500" />
              Professional Trading
            </div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <Shield className="w-2 h-2 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="font-medium truncate">Trader User</div>
              <div className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-0.5 rounded-full">
                PRO
              </div>
            </div>
            <div className="text-xs text-gray-400 flex items-center">
              <Wallet className="w-3 h-3 mr-1" />
              Premium Member
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-green-400 flex items-center">
                +₹{dailyProfit.toLocaleString()}
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
              <div className="text-xs text-gray-400">Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto sidebar-scroll">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-white border border-blue-500/30' 
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }
                  `}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      p-1.5 rounded-lg
                      ${isActive 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                        : 'bg-gray-800 group-hover:bg-gray-700'
                      }
                    `}>
                      {item.icon}
                    </div>
                    <div className="font-medium">{item.label}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <div className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        {item.badge}
                      </div>
                    )}
                    {item.pro && (
                      <div className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
                        PRO
                      </div>
                    )}
                    {item.count && (
                      <div className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        {item.count}
                      </div>
                    )}
                    {item.status && (
                      <div className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        {item.status}
                      </div>
                    )}
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-400">Performance</div>
              <div className="flex items-center text-xs text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Live
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">Brokers</div>
                <div className="text-sm font-semibold text-green-400">
                  2 Active
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Win Rate</div>
                <div className="text-sm font-semibold text-green-400">
                  {winRate.toFixed(1)}%
                </div>
              </div>
              <div className="pt-2">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${winRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
              <div className="relative">
                <Bell className="w-5 h-5" />
                {hasNotifications && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
              <div className="text-xs mt-1 text-gray-400">Alerts</div>
            </button>
            
            <div className="flex items-center justify-center">
              <ThemeToggle />
            </div>
            
            <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
              <HelpCircle className="w-5 h-5" />
              <div className="text-xs mt-1 text-gray-400">Help</div>
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gray-800/50 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <div className="text-sm font-medium">Logout</div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;