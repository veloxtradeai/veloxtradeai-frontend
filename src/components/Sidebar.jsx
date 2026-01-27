import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  X,
  ChevronRight,
  FileText,
  CreditCard,
  LineChart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeBrokers, setActiveBrokers] = useState(0);
  const [userData, setUserData] = useState(null);

  // Load real data
  useEffect(() => {
    const loadData = () => {
      try {
        // Load broker connections
        const brokers = JSON.parse(localStorage.getItem('velox_brokers') || '[]');
        const connected = brokers.filter(b => b.status === 'connected').length;
        setActiveBrokers(connected);

        // Load user data
        const savedUser = JSON.parse(localStorage.getItem('velox_user') || '{}');
        setUserData(savedUser);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Dashboard',
      description: 'Real-time insights'
    },
    { 
      path: '/analytics', 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: 'Analytics',
      pro: true,
      description: 'Advanced charts'
    },
    { 
      path: '/broker-settings',
      icon: <Building2 className="w-5 h-5" />, 
      label: 'Broker Settings',
      count: activeBrokers,
      description: 'Manage accounts'
    },
    { 
      path: '/subscription', 
      icon: <Crown className="w-5 h-5" />, 
      label: 'Premium',
      status: 'PRO',
      description: 'Upgrade plan'
    },
    { 
      path: '/settings', 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings',
      description: 'Preferences'
    },
  ];

  const quickStats = [
    { label: 'AI Confidence', value: '87%', color: 'text-emerald-400' },
    { label: 'Market', value: 'Bullish', color: 'text-green-400' },
    { label: 'Volatility', value: 'Medium', color: 'text-yellow-400' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64
        bg-gradient-to-b from-gray-900 to-gray-950
        border-r border-emerald-900/30
        shadow-xl
        z-50 lg:z-10
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo Header */}
        <div className="p-4 border-b border-emerald-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-900/50 to-cyan-900/30 border border-emerald-900/30">
                <Rocket className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">VeloxTradeAI</h1>
                <p className="text-xs text-emerald-300/70">Professional Trading</p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 rounded-lg bg-gray-800 border border-emerald-900/30"
            >
              <X className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-emerald-900/30">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-gray-900">
                <div className="w-full h-full flex items-center justify-center">
                  <Shield className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="font-semibold text-white text-sm">
                {userData?.name || 'Trader Pro'}
              </div>
              <p className="text-xs text-emerald-300/70 flex items-center mt-0.5">
                <Wallet className="w-3 h-3 mr-1" />
                Premium Member
              </p>
              
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-400">Live</span>
                </div>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-emerald-400">
                  {activeBrokers} Connected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 border-y border-emerald-900/20">
          <div className="grid grid-cols-3 gap-2">
            {quickStats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-2 rounded-lg bg-gray-800/40 border border-emerald-900/20"
              >
                <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-4">
            <div className="text-xs uppercase text-emerald-400/60 font-bold mb-3">
              TRADING SUITE
            </div>
            
            <div className="space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${active 
                        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${active ? 'bg-white/20' : 'bg-gray-800'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-emerald-300/50">{item.description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1.5">
                      {item.pro && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                          PRO
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded">
                          {item.count}
                        </span>
                      )}
                      {item.status && (
                        <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">
                          {item.status}
                        </span>
                      )}
                      <ChevronRight className={`w-3 h-3 ${active ? 'rotate-90' : ''}`} />
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Reports Section */}
          <div className="mb-4">
            <div className="text-xs uppercase text-emerald-400/60 font-bold mb-3">
              REPORTS & DATA
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => {
                  navigate('/reports');
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-gray-800">
                    <FileText className="w-5 h-5 text-emerald-400" />
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
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-gray-800">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
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

        {/* Footer */}
        <div className="p-4 border-t border-emerald-900/30">
          <div className="text-center">
            <div className="text-xs text-emerald-300/50 mb-1">VeloxTradeAI v3.0</div>
            <div className="text-xs text-gray-500">Professional Trading Platform</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
