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
  Monitor
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [activeBrokers, setActiveBrokers] = useState(0);
  const [aiConfidence, setAiConfidence] = useState(0);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch real broker data (simulated)
  useEffect(() => {
    // In real app, fetch from API
    const brokers = JSON.parse(localStorage.getItem('velox_brokers') || '[]');
    const connected = brokers.filter(b => b.status === 'connected').length;
    setActiveBrokers(connected);
    
    // Simulate AI confidence based on market
    const confidence = Math.min(85 + Math.floor(Math.random() * 15), 98);
    setAiConfidence(confidence);
  }, []);

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Dashboard',
      badge: '🔥',
      gradient: 'from-emerald-500 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-cyan-500',
      description: 'Real-time insights'
    },
    { 
      path: '/analytics', 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: 'Analytics',
      pro: true,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      description: 'Advanced charts'
    },
    { 
      path: '/ai-signals', 
      icon: <Brain className="w-5 h-5" />, 
      label: 'AI Signals',
      badge: 'AI',
      gradient: 'from-violet-500 to-blue-500',
      iconBg: 'bg-gradient-to-br from-violet-500 to-blue-500',
      description: 'Smart predictions'
    },
    { 
      path: '/broker', 
      icon: <Building2 className="w-5 h-5" />, 
      label: 'Broker',
      count: activeBrokers,
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
      description: 'Manage accounts'
    },
    { 
      path: '/subscription', 
      icon: <Crown className="w-5 h-5" />, 
      label: 'Premium',
      status: 'PRO',
      gradient: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      description: 'Upgrade plan'
    },
    { 
      path: '/settings', 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings',
      gradient: 'from-gray-600 to-slate-500',
      iconBg: 'bg-gradient-to-br from-gray-600 to-slate-500',
      description: 'Preferences'
    },
  ];

  const quickStats = [
    { label: 'AI Confidence', value: `${aiConfidence}%`, icon: <Brain className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Market Trend', value: 'Bullish', icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-500/20' },
    { label: 'Volatility', value: 'Medium', icon: <Activity className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  ];

  const socialFeatures = [
    { icon: '👑', label: 'Leaderboard', path: '/leaderboard' },
    { icon: '🏆', label: 'Achievements', path: '/achievements' },
    { icon: '🤝', label: 'Community', path: '/community' },
    { icon: '🎮', label: 'Challenges', path: '/challenges' },
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
        fixed lg:relative h-full flex flex-col w-64 lg:w-72
        bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
        border-r border-emerald-900/30
        shadow-2xl shadow-emerald-900/20
        z-50 lg:z-0
        transition-transform duration-300 ease-in-out
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        
        {/* Logo Header with Glow */}
        <div className="p-6 border-b border-emerald-900/30 bg-gradient-to-r from-gray-900 to-gray-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 p-2.5 rounded-2xl border border-emerald-500/30">
                  <Rocket className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-premium">
                  VeloxTradeAI
                </h1>
                <p className="text-xs text-emerald-300/70 flex items-center mt-1">
                  <Zap className="w-3 h-3 mr-1.5 text-yellow-400" />
                  Professional Trading Platform
                </p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-900/30 hover:border-emerald-500 transition-all"
              >
                <X className="w-5 h-5 text-emerald-400" />
              </button>
            )}
          </div>
        </div>

        {/* User Profile - Premium Look */}
        <div className="p-5 border-b border-emerald-900/30 bg-gradient-to-r from-gray-900/80 to-gray-950/80">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full blur-md opacity-60"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-bold text-lg text-white truncate">Trader Pro</div>
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 text-yellow-400 mr-1.5" />
                  <span className="text-xs bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white px-3 py-1 rounded-full font-bold">
                    ELITE
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-emerald-300/80 flex items-center mt-1">
                <Wallet className="w-3.5 h-3.5 mr-2" />
                Premium Member
              </p>
              
              {/* Connection Status */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-400">Live</span>
                  </div>
                  <div className="text-xs text-gray-400">•</div>
                  <div className="flex items-center space-x-1">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">{activeBrokers} Connected</span>
                  </div>
                </div>
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="px-5 py-3 bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 border-y border-emerald-900/20">
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-2 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-900/30 border border-emerald-900/20 hover:border-emerald-500/30 transition-all"
              >
                <div className={`inline-flex p-1.5 rounded-lg ${stat.bg} mb-1`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-5 overflow-y-auto sidebar-scroll">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-wider text-emerald-400/70 font-bold mb-4 flex items-center">
              <Sparkle className="w-3.5 h-3.5 mr-2" />
              TRADING SUITE
            </div>
            
            <div className="space-y-2.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`
                      group flex items-center justify-between px-4 py-3.5 rounded-2xl
                      transition-all duration-300 relative overflow-hidden
                      ${isActive 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split('-')[1]}-500/30` 
                        : 'bg-gradient-to-r from-gray-800/40 to-gray-900/30 text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent hover:border-emerald-900/30'
                      }
                    `}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`
                        p-2.5 rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'bg-white/20 backdrop-blur-sm' 
                          : 'bg-gradient-to-br from-gray-800 to-gray-900 group-hover:bg-gray-700'
                        }
                      `}>
                        <div className={isActive ? 'text-white' : 'text-emerald-400'}>
                          {item.icon}
                        </div>
                      </div>
                      
                      <div>
                        <div className={`font-semibold ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                          {item.label}
                        </div>
                        <div className="text-xs text-emerald-300/60 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className="text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2.5 py-1 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                      {item.pro && (
                        <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2.5 py-1 rounded-full font-bold">
                          PRO
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className="text-xs bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-2.5 py-1 rounded-full font-bold">
                          {item.count}
                        </span>
                      )}
                      {item.status && (
                        <span className="text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2.5 py-1 rounded-full font-bold">
                          {item.status}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                    </div>
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-r-full"></div>
                    )}
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Social & Community Features */}
          <div className="mb-8">
            <div className="text-xs uppercase tracking-wider text-emerald-400/70 font-bold mb-4 flex items-center">
              <Users className="w-3.5 h-3.5 mr-2" />
              COMMUNITY
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {socialFeatures.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(feature.path);
                    isMobile && toggleSidebar();
                  }}
                  className="group p-3 rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/30 border border-emerald-900/20 hover:border-emerald-500/40 transition-all hover:scale-105"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-xs font-medium text-white">{feature.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Market Stats */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-cyan-900/10 border border-emerald-900/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <LineChart className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Market Pulse</span>
              </div>
              <div className="text-xs bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-2 py-1 rounded-full">
                LIVE
              </div>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">NIFTY 50</span>
                <span className="text-sm font-bold text-emerald-400">+1.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">SENSEX</span>
                <span className="text-sm font-bold text-emerald-400">+0.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">AI Accuracy</span>
                <span className="text-sm font-bold text-emerald-400">{aiConfidence}%</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-emerald-900/20">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                <Globe className="w-3.5 h-3.5" />
                <span>Global Markets • Real-time</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-5 border-t border-emerald-900/30 bg-gradient-to-t from-gray-950 to-gray-900">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <button className="group flex flex-col items-center justify-center p-2.5 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-900/30 hover:border-emerald-500 transition-all">
              <Bell className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
              <span className="text-xs mt-1.5 text-emerald-300/70 group-hover:text-emerald-300">Alerts</span>
            </button>
            
            <button className="group flex flex-col items-center justify-center p-2.5 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-900/30 hover:border-blue-500 transition-all">
              <HelpCircle className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
              <span className="text-xs mt-1.5 text-blue-300/70 group-hover:text-blue-300">Support</span>
            </button>
            
            <button className="group flex flex-col items-center justify-center p-2.5 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-900/30 hover:border-purple-500 transition-all">
              <Crown className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
              <span className="text-xs mt-1.5 text-purple-300/70 group-hover:text-purple-300">Rewards</span>
            </button>
            
            <button className="group flex flex-col items-center justify-center p-2.5 rounded-xl bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-900/30 hover:border-cyan-500 transition-all">
              <RefreshCw className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
              <span className="text-xs mt-1.5 text-cyan-300/70 group-hover:text-cyan-300">Refresh</span>
            </button>
          </div>

          {/* Version & Status */}
          <div className="text-center pt-3 border-t border-emerald-900/20">
            <div className="text-xs text-emerald-300/50 mb-1">
              VeloxTradeAI v3.0 • Elite Edition
            </div>
            <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
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
