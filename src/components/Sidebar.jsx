import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  RefreshCw,
  Menu,
  X,
  ChevronRight,
  Cloud,
  ShieldCheck,
  Users,
  Smartphone,
  Monitor,
  LineChart,
  Globe,
  BarChart,
  Wallet2,
  CreditCard,
  FileText
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [activeBrokers, setActiveBrokers] = useState(0);
  const [aiConfidence, setAiConfidence] = useState(87);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch real broker data
  useEffect(() => {
    // Real broker connections
    const fetchBrokerConnections = () => {
      try {
        // Check localStorage for broker connections
        const connections = JSON.parse(localStorage.getItem('velox_broker_connections') || '[]');
        const active = connections.filter(conn => conn.status === 'connected');
        setActiveBrokers(active.length);
        
        // Update AI confidence based on market data
        const marketData = JSON.parse(localStorage.getItem('market_data') || 'null');
        if (marketData && marketData.aiConfidence) {
          setAiConfidence(marketData.aiConfidence);
        }
      } catch (error) {
        console.error("Error fetching broker data:", error);
      }
    };
    
    fetchBrokerConnections();
    const interval = setInterval(fetchBrokerConnections, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Correct menu items - AI Signals REMOVED, Broker settings path fixed
  const menuItems = [
    { 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-4 h-4" />, 
      label: 'Dashboard',
      gradient: 'from-emerald-500 to-cyan-500',
      description: 'Real-time insights'
    },
    { 
      path: '/analytics', 
      icon: <BarChart3 className="w-4 h-4" />, 
      label: 'Analytics',
      pro: true,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Advanced charts'
    },
    { 
      path: '/broker-settings',  // Changed from '/broker' to '/broker-settings'
      icon: <Building2 className="w-4 h-4" />, 
      label: 'Broker Settings',
      count: activeBrokers,
      gradient: 'from-green-500 to-emerald-500',
      description: 'Manage accounts'
    },
    { 
      path: '/subscription', 
      icon: <Crown className="w-4 h-4" />, 
      label: 'Premium',
      status: 'PRO',
      gradient: 'from-yellow-500 to-orange-500',
      description: 'Upgrade plan'
    },
    { 
      path: '/settings', 
      icon: <Settings className="w-4 h-4" />, 
      label: 'Settings',
      gradient: 'from-gray-600 to-slate-500',
      description: 'Preferences'
    },
  ];

  const quickStats = [
    { label: 'AI Confidence', value: `${aiConfidence}%`, icon: <Activity className="w-3 h-3" />, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Market', value: 'Bullish', icon: <TrendingUp className="w-3 h-3" />, color: 'text-green-400', bg: 'bg-green-500/20' },
    { label: 'Volatility', value: 'Medium', icon: <LineChart className="w-3 h-3" />, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  ];

  return (
    <>
      {/* Mobile Overlay - Only show when sidebar is open on mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:relative h-full flex flex-col w-64
        bg-gradient-to-b from-gray-900 to-gray-950
        border-r border-emerald-900/30
        shadow-xl shadow-emerald-900/10
        z-50 lg:z-0
        transition-all duration-300 ease-in-out
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        ${isMobile && isOpen ? 'shadow-2xl' : ''}
      `}>
        
        {/* Logo Header */}
        <div className="p-4 border-b border-emerald-900/30 bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-40"></div>
                <div className="relative bg-gray-900 p-2 rounded-xl border border-emerald-500/20">
                  <Rocket className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">VeloxTradeAI</h1>
                <p className="text-xs text-emerald-300/60 flex items-center mt-0.5">
                  <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                  Professional Trading
                </p>
              </div>
            </div>
            
            {/* Mobile Close Button - Smaller */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg bg-gray-800 border border-emerald-900/30 hover:border-emerald-500 transition-all"
              >
                <X className="w-4 h-4 text-emerald-400" />
              </button>
            )}
          </div>
        </div>

        {/* User Profile - Smaller */}
        <div className="p-4 border-b border-emerald-900/30 bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center border-2 border-gray-800">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border border-gray-800 flex items-center justify-center">
                <Shield className="w-2 h-2 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white text-sm">Trader Pro</div>
                <span className="text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2 py-0.5 rounded-full font-bold">
                  ELITE
                </span>
              </div>
              
              <p className="text-xs text-emerald-300/70 flex items-center mt-0.5">
                <Wallet className="w-3 h-3 mr-1" />
                Premium Member
              </p>
              
              {/* Connection Status - Smaller */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-400">Live</span>
                  </div>
                  <div className="text-xs text-gray-500">•</div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-emerald-400">{activeBrokers} Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar - Smaller */}
        <div className="px-4 py-2 bg-gradient-to-r from-emerald-900/10 to-cyan-900/5 border-y border-emerald-900/20">
          <div className="grid grid-cols-3 gap-2">
            {quickStats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-1.5 rounded-lg bg-gray-800/40 border border-emerald-900/20"
              >
                <div className={`inline-flex p-1 rounded-md ${stat.bg} mb-1`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div className={`text-xs font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation - Smaller buttons */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider text-emerald-400/60 font-bold mb-3">
              TRADING SUITE
            </div>
            
            <div className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`
                      group flex items-center justify-between px-3 py-2.5 rounded-xl
                      transition-all duration-200 relative
                      ${isActive 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-md` 
                        : 'bg-gray-800/30 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-transparent hover:border-emerald-900/20'
                      }
                    `}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        p-1.5 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-800 group-hover:bg-gray-700'
                        }
                      `}>
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
                      <ChevronRight className={`w-3 h-3 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                    </div>
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-r-full"></div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Reports & Data Section - NEW */}
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

        {/* Footer Actions - Smaller buttons */}
        <div className="p-4 border-t border-emerald-900/30 bg-gray-900/50">
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button 
              onClick={() => navigate('/alerts')}
              className="group flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/40 border border-emerald-900/30 hover:border-emerald-500 transition-all"
            >
              <Bell className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
              <span className="text-xs mt-1 text-emerald-300/70 group-hover:text-emerald-300">Alerts</span>
            </button>
            
            <button 
              onClick={() => navigate('/support')}
              className="group flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/40 border border-blue-900/30 hover:border-blue-500 transition-all"
            >
              <HelpCircle className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
              <span className="text-xs mt-1 text-blue-300/70 group-hover:text-blue-300">Support</span>
            </button>
            
            <button 
              onClick={() => navigate('/rewards')}
              className="group flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/40 border border-purple-900/30 hover:border-purple-500 transition-all"
            >
              <Crown className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
              <span className="text-xs mt-1 text-purple-300/70 group-hover:text-purple-300">Rewards</span>
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              className="group flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/40 border border-cyan-900/30 hover:border-cyan-500 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
              <span className="text-xs mt-1 text-cyan-300/70 group-hover:text-cyan-300">Refresh</span>
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
              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center space-x-1">
                <Cloud className="w-3 h-3" />
                <span>Cloud</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
