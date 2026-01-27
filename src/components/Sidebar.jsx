import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Activity,
  Rocket,
  Shield,
  RefreshCw,
  Menu,
  X,
  ChevronRight,
  Users,
  Smartphone,
  Monitor,
  LineChart,
  BarChart,
  FileText,
  CreditCard
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [activeBrokers, setActiveBrokers] = useState(0);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch real broker data
  useEffect(() => {
    const brokers = JSON.parse(localStorage.getItem('velox_brokers') || '[]');
    const connected = brokers.filter(b => b.status === 'connected').length;
    setActiveBrokers(connected);
  }, []);

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-4 h-4" />, 
      label: 'Dashboard',
      description: 'Real-time insights'
    },
    { 
      path: '/analytics', 
      icon: <BarChart3 className="w-4 h-4" />, 
      label: 'Analytics',
      pro: true,
      description: 'Advanced charts'
    },
    { 
      path: '/broker-settings',
      icon: <Building2 className="w-4 h-4" />, 
      label: 'Broker Settings',
      count: activeBrokers,
      description: 'Manage accounts'
    },
    { 
      path: '/subscription', 
      icon: <Crown className="w-4 h-4" />, 
      label: 'Premium',
      status: 'PRO',
      description: 'Upgrade plan'
    },
    { 
      path: '/settings', 
      icon: <Settings className="w-4 h-4" />, 
      label: 'Settings',
      description: 'Preferences'
    },
  ];

  const quickStats = [
    { label: 'AI Confidence', value: '87%', icon: <Activity className="w-3 h-3" />, color: 'text-emerald-400' },
    { label: 'Market', value: 'Bullish', icon: <TrendingUp className="w-3 h-3" />, color: 'text-green-400' },
    { label: 'Volatility', value: 'Medium', icon: <LineChart className="w-3 h-3" />, color: 'text-yellow-400' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:relative h-full flex flex-col w-64
        bg-gradient-to-b from-gray-900 to-gray-950
        border-r border-emerald-900/30
        shadow-xl
        z-50 lg:z-0
        transition-transform duration-300 ease-in-out
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        
        {/* Logo Header */}
        <div className="p-4 border-b border-emerald-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="relative bg-gray-900 p-2 rounded-lg border border-emerald-500/30">
                  <Rocket className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">VeloxTradeAI</h1>
                <p className="text-xs text-emerald-300/70 flex items-center mt-0.5">
                  <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                  Professional Trading
                </p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg bg-gray-800 border border-emerald-900/30"
              >
                <X className="w-4 h-4 text-emerald-400" />
              </button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-emerald-900/30">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border border-gray-800 flex items-center justify-center">
                <Shield className="w-2 h-2 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="font-semibold text-white text-sm">Trader Pro</div>
              <p className="text-xs text-emerald-300/70 flex items-center mt-0.5">
                <Wallet className="w-3 h-3 mr-1" />
                Premium Member
              </p>
              
              {/* Connection Status */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-400">Live</span>
                  </div>
                  <div className="text-xs text-gray-500">•</div>
                  <span className="text-xs text-emerald-400">{activeBrokers} Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="px-4 py-2 bg-gradient-to-r from-emerald-900/10 to-cyan-900/5 border-y border-emerald-900/20">
          <div className="grid grid-cols-3 gap-2">
            {quickStats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-1.5 rounded-lg bg-gray-800/40 border border-emerald-900/20"
              >
                <div className={`inline-flex p-1 rounded-md bg-emerald-500/20 mb-1`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div className={`text-xs font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider text-emerald-400/60 font-bold mb-3">
              TRADING SUITE
            </div>
            
            <div className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = window.location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`
                      group flex items-center justify-between px-3 py-2.5 rounded-xl
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md' 
                        : 'bg-gray-800/30 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-transparent hover:border-emerald-900/20'
                      }
                    `}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-800'}`}>
                        <div className={isActive ? 'text-white' : 'text-emerald-400'}>
                          {item.icon}
                        </div>
                      </div>
                      
                      <div>
                        <div className={`font-medium text-sm ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                          {item.label}
                        </div>
                        <div className="text-xs text-emerald-300/50">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1.5">
                      {item.pro && (
                        <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full">
                          PRO
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className="text-xs bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-1.5 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                      {item.status && (
                        <span className="text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-1.5 py-0.5 rounded-full">
                          {item.status}
                        </span>
                      )}
                      <ChevronRight className={`w-3 h-3 ${isActive ? 'rotate-90' : ''}`} />
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Reports & Data Section */}
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider text-emerald-400/60 font-bold mb-3">
              REPORTS & DATA
            </div>
            
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  navigate('/reports');
                  isMobile && toggleSidebar();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-800/30 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-transparent hover:border-emerald-900/20 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-gray-800">
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Trade Reports</div>
                    <div className="text-xs text-emerald-300/50">Performance analytics</div>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3" />
              </button>
              
              <button
                onClick={() => {
                  navigate('/transactions');
                  isMobile && toggleSidebar();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-800/30 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-transparent hover:border-emerald-900/20 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-gray-800">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Transactions</div>
                    <div className="text-xs text-emerald-300/50">Payment history</div>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-emerald-900/30">
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button 
              onClick={() => navigate('/alerts')}
              className="group flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/40 border border-emerald-900/30 hover:border-emerald-500 transition-all"
            >
              <Bell className="w-4 h-4 text-emerald-400" />
              <span className="text-xs mt-1 text-emerald-300/70">Alerts</span>
            </button>
            
            <button 
              onClick={() => navigate('/support')}
              className="group flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/40 border border-blue-900/30 hover:border-blue-500 transition-all"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="text-xs mt-1 text-blue-300/70">Support</span>
            </button>
            
            <button 
              onClick={() => navigate('/rewards')}
              className="group flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/40 border border-purple-900/30 hover:border-purple-500 transition-all"
            >
              <Crown className="w-4 h-4 text-purple-400" />
              <span className="text-xs mt-1 text-purple-300/70">Rewards</span>
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              className="group flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/40 border border-cyan-900/30 hover:border-cyan-500 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span className="text-xs mt-1 text-cyan-300/70">Refresh</span>
            </button>
          </div>

          {/* Version & Status */}
          <div className="text-center pt-2 border-t border-emerald-900/20">
            <div className="text-xs text-emerald-300/40 mb-1">
              v3.0 • Elite Edition
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                {isMobile ? (
                  <Smartphone className="w-3 h-3" />
                ) : (
                  <Monitor className="w-3 h-3" />
                )}
                <span>{isMobile ? 'Mobile' : 'Desktop'}</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <span>Secure</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
