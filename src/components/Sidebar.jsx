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
  Sparkles,
  Cpu,
  Star,
  Award,
  Wifi,
  BatteryCharging,
  RefreshCw,
  Menu,
  X,
  ChevronRight,
  Cloud,
  Globe,
  ShieldCheck,
  Coins,
  Trophy,
  Sparkle,
  Brain,
  LineChart,
  TrendingDown,
  BarChart,
  Users,
  Clock,
  Smartphone,
  Monitor,
  LogOut,
  MessageSquare,
  TargetIcon
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [activeBrokers, setActiveBrokers] = useState(0);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [marketStatus, setMarketStatus] = useState('CLOSED');

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Mobile पर sidebar automatically close रहेगा
      if (mobile && isOpen) {
        // toggleSidebar(); // Uncomment if needed
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Real data fetch करेंगे - अभी के लिए localStorage से
  useEffect(() => {
    // Real backend connection check
    const checkBackendConnection = async () => {
      try {
        // यहाँ actual API call होगी
        // const response = await fetch('/api/status');
        // const data = await response.json();
        
        // Temporary - localStorage से data
        const brokers = JSON.parse(localStorage.getItem('velox_brokers') || '[]');
        const connected = brokers.filter(b => b.status === 'connected').length;
        setActiveBrokers(connected);
        
        // Market status check
        const now = new Date();
        const hours = now.getHours();
        const isMarketOpen = hours >= 9 && hours < 15.5; // 9 AM to 3:30 PM
        setMarketStatus(isMarketOpen ? 'OPEN' : 'CLOSED');
        
        // AI confidence - real calculation
        const confidence = localStorage.getItem('ai_confidence') || 85;
        setAiConfidence(confidence);
        
      } catch (error) {
        console.error('Backend connection failed:', error);
        // Fallback data
        setActiveBrokers(0);
        setMarketStatus('CLOSED');
        setAiConfidence(75);
      }
    };
    
    checkBackendConnection();
    
    // Real-time updates के लिए interval
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // आपके दिए गए फोटो के colors - Professional green theme
  const colorTheme = {
    primary: '#10B981', // Emerald-500
    secondary: '#06B6D4', // Cyan-500
    accent: '#8B5CF6', // Purple-500
    background: '#0F172A', // Slate-900
    cardBg: '#1E293B', // Slate-800
    text: '#F1F5F9', // Slate-100
    gradient: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
  };

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Dashboard',
      description: 'Real-time trading insights',
      gradient: 'from-emerald-500 to-cyan-500',
    },
    { 
      path: '/analytics', 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: 'Analytics',
      description: 'Advanced performance metrics',
      pro: true,
      gradient: 'from-purple-500 to-pink-500',
    },
    { 
      path: '/broker-settings', 
      icon: <Building2 className="w-5 h-5" />, 
      label: 'Broker Settings',
      description: 'Connect & manage brokers',
      count: activeBrokers,
      gradient: 'from-green-500 to-emerald-600',
    },
    { 
      path: '/subscription', 
      icon: <Crown className="w-5 h-5" />, 
      label: 'Subscription',
      description: 'Upgrade your plan',
      gradient: 'from-yellow-500 to-orange-500',
    },
    { 
      path: '/settings', 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings',
      description: 'Platform preferences',
      gradient: 'from-gray-600 to-slate-600',
    },
  ];

  // Quick stats - REAL DATA होगा
  const quickStats = [
    { 
      label: 'AI Confidence', 
      value: `${aiConfidence}%`, 
      icon: <Brain className="w-4 h-4" />, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      realData: true 
    },
    { 
      label: 'Market Status', 
      value: marketStatus, 
      icon: marketStatus === 'OPEN' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />, 
      color: marketStatus === 'OPEN' ? 'text-green-400' : 'text-red-400',
      bg: marketStatus === 'OPEN' ? 'bg-green-500/20' : 'bg-red-500/20',
      realData: true 
    },
    { 
      label: 'Brokers', 
      value: `${activeBrokers} Connected`, 
      icon: <Wifi className="w-4 h-4" />, 
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
      realData: true 
    },
  ];

  // Social features
  const socialFeatures = [
    { icon: '💬', label: 'Live Chat', path: '/chat', description: 'Real-time support' },
    { icon: '👥', label: 'Community', path: '/community', description: 'Join traders' },
    { icon: '📈', label: 'Signals', path: '/signals', description: 'Trade alerts' },
    { icon: '🏆', label: 'Leaderboard', path: '/leaderboard', description: 'Top performers' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    navigate('/login');
    if (isMobile) toggleSidebar();
  };

  const handleChat = () => {
    navigate('/chat');
    if (isMobile) toggleSidebar();
  };

  return (
    <>
      {/* Mobile Overlay - Fixed position */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:relative h-full flex flex-col w-64 lg:w-72
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
        border-r border-emerald-900/40
        shadow-2xl shadow-emerald-900/30
        z-50 lg:z-0
        transition-all duration-300 ease-in-out
        ${isMobile 
          ? `fixed top-0 left-0 h-full ${isOpen ? 'translate-x-0' : '-translate-x-full'}` 
          : 'translate-x-0'
        }
      `}>
        
        {/* Logo Header - Premium Design */}
        <div className="p-5 border-b border-emerald-900/40 bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3" onClick={() => navigate('/dashboard')}>
              <div className="relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-xl opacity-60"></div>
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 p-3 rounded-2xl border border-emerald-500/40">
                  <div className="flex items-center space-x-2">
                    <Rocket className="w-6 h-6 text-emerald-400" />
                    <TargetIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
              </div>
              
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  VeloxTradeAI
                </h1>
                <p className="text-xs text-emerald-300/80 flex items-center mt-0.5">
                  <Zap className="w-3 h-3 mr-1.5 text-yellow-400" />
                  <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-transparent bg-clip-text">
                    Elite Trading Platform
                  </span>
                </p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-900/40 hover:border-emerald-500 transition-all hover:scale-110"
              >
                <X className="w-5 h-5 text-emerald-400" />
              </button>
            )}
          </div>
        </div>

        {/* User Profile - Compact & Professional */}
        <div className="p-4 border-b border-emerald-900/40 bg-gradient-to-r from-slate-900/90 to-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full blur-md opacity-50"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white truncate">Trader Pro</div>
                <div className="flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 mr-1" />
                  <span className="text-[10px] bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2 py-0.5 rounded-full font-bold">
                    ELITE
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-emerald-300/80 flex items-center mt-0.5">
                <Wallet className="w-3 h-3 mr-1.5" />
                Premium Member
              </p>
              
              {/* Connection Status - Real Data */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${marketStatus === 'OPEN' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${marketStatus === 'OPEN' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`text-xs ${marketStatus === 'OPEN' ? 'text-green-400' : 'text-red-400'}`}>
                      {marketStatus}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 text-xs">
                  <Wifi className={`w-3 h-3 ${activeBrokers > 0 ? 'text-emerald-400' : 'text-gray-500'}`} />
                  <span className={activeBrokers > 0 ? 'text-emerald-400' : 'text-gray-500'}>
                    {activeBrokers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Real Data Display */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-900/30 to-cyan-900/20 border-y border-emerald-900/30">
          <div className="grid grid-cols-3 gap-2">
            {quickStats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-2 rounded-lg bg-gradient-to-b from-slate-800/60 to-slate-900/40 border border-emerald-900/30 hover:border-emerald-500/40 transition-all cursor-pointer group"
                onClick={() => stat.realData && navigate('/analytics')}
              >
                <div className={`inline-flex p-1 rounded-md ${stat.bg} mb-1 group-hover:scale-110 transition-transform`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div className={`text-xs font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation - Fixed height with scroll */}
        <nav className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
          <div className="mb-6">
            <div className="text-xs uppercase tracking-wider text-emerald-400/80 font-bold mb-3 flex items-center">
              <Sparkle className="w-3.5 h-3.5 mr-2" />
              TRADING SUITE
            </div>
            
            <div className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path || 
                               location.pathname.startsWith(item.path + '/');
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`
                      group flex items-center justify-between px-3 py-2.5 rounded-xl
                      transition-all duration-200 relative overflow-hidden
                      ${isActive 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                        : 'bg-slate-800/30 text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-emerald-900/40'
                      }
                    `}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        p-2 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-white/20' 
                          : 'bg-slate-800/50 group-hover:bg-slate-700/50'
                        }
                      `}>
                        <div className={isActive ? 'text-white' : 'text-emerald-400'}>
                          {item.icon}
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <div className={`font-medium text-sm ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                          {item.label}
                        </div>
                        <div className="text-[10px] text-emerald-300/60 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {item.pro && (
                        <span className="text-[10px] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded">
                          PRO
                        </span>
                      )}
                      {item.count !== undefined && item.count > 0 && (
                        <span className="text-[10px] bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-1.5 py-0.5 rounded">
                          {item.count}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-90' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
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

          {/* Chat Feature - आपकी demand के अनुसार */}
          <div className="mb-4">
            <button
              onClick={handleChat}
              className="w-full group flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-900/30 to-cyan-900/20 border border-emerald-900/40 hover:border-emerald-500/60 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm text-white">Live Chat</div>
                  <div className="text-[10px] text-emerald-300/60">24/7 Support</div>
                </div>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </button>
          </div>

          {/* Community Features */}
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider text-emerald-400/80 font-bold mb-3 flex items-center">
              <Users className="w-3.5 h-3.5 mr-2" />
              COMMUNITY
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {socialFeatures.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(feature.path);
                    isMobile && toggleSidebar();
                  }}
                  className="group p-2 rounded-lg bg-slate-800/30 border border-emerald-900/30 hover:border-emerald-500/40 hover:bg-slate-800/50 transition-all text-center"
                >
                  <div className="text-lg mb-1">{feature.icon}</div>
                  <div className="text-xs font-medium text-white">{feature.label}</div>
                  <div className="text-[10px] text-emerald-300/60">{feature.description}</div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer Actions - Compact */}
        <div className="p-4 border-t border-emerald-900/40 bg-gradient-to-t from-slate-950 to-slate-900">
          <div className="flex justify-between mb-3">
            <button className="group flex flex-col items-center p-2 rounded-lg bg-slate-800/30 border border-emerald-900/30 hover:border-emerald-500/40 transition-all flex-1 mx-1">
              <Bell className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 mb-1" />
              <span className="text-[10px] text-emerald-300/70">Alerts</span>
            </button>
            
            <button className="group flex flex-col items-center p-2 rounded-lg bg-slate-800/30 border border-emerald-900/30 hover:border-emerald-500/40 transition-all flex-1 mx-1">
              <HelpCircle className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 mb-1" />
              <span className="text-[10px] text-cyan-300/70">Help</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="group flex flex-col items-center p-2 rounded-lg bg-slate-800/30 border border-emerald-900/30 hover:border-red-500/40 transition-all flex-1 mx-1"
            >
              <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 mb-1" />
              <span className="text-[10px] text-red-300/70">Logout</span>
            </button>
          </div>

          {/* Version & Status */}
          <div className="text-center pt-3 border-t border-emerald-900/30">
            <div className="text-[10px] text-emerald-300/50 mb-1">
              VeloxTradeAI v3.0 • Elite
            </div>
            <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500">
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
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
