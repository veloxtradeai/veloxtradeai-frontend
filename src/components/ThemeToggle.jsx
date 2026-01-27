import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, Sun, Moon, Sparkles, Droplets, Zap, Sunrise, Sunset, Flame } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, themes, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Theme color mappings
  const themeColors = {
    'velox-dark': {
      primary: 'from-emerald-500 to-cyan-500',
      secondary: 'from-gray-900 to-gray-950',
      icon: <Moon className="w-5 h-5 text-emerald-400" />,
      name: 'Velox Dark',
      accent: 'bg-gradient-to-r from-emerald-600 to-cyan-600'
    },
    'velox-light': {
      primary: 'from-emerald-600 to-cyan-600',
      secondary: 'from-gray-100 to-gray-200',
      icon: <Sun className="w-5 h-5 text-yellow-500" />,
      name: 'Velox Light',
      accent: 'bg-gradient-to-r from-emerald-500 to-cyan-500'
    },
    'velox-neon': {
      primary: 'from-emerald-400 to-cyan-400',
      secondary: 'from-gray-950 to-black',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      name: 'Neon Pro',
      accent: 'bg-gradient-to-r from-emerald-500 to-cyan-500'
    },
    'velox-ocean': {
      primary: 'from-blue-500 to-cyan-500',
      secondary: 'from-gray-900 to-blue-950',
      icon: <Droplets className="w-5 h-5 text-blue-400" />,
      name: 'Ocean Blue',
      accent: 'bg-gradient-to-r from-blue-600 to-cyan-600'
    },
    'velox-sunset': {
      primary: 'from-orange-500 to-pink-500',
      secondary: 'from-gray-900 to-purple-950',
      icon: <Sunset className="w-5 h-5 text-orange-400" />,
      name: 'Sunset',
      accent: 'bg-gradient-to-r from-orange-600 to-pink-600'
    },
    'velox-fire': {
      primary: 'from-red-500 to-orange-500',
      secondary: 'from-gray-900 to-red-950',
      icon: <Flame className="w-5 h-5 text-red-400" />,
      name: 'Fire Red',
      accent: 'bg-gradient-to-r from-red-600 to-orange-600'
    },
    'velox-premium': {
      primary: 'from-purple-500 via-pink-500 to-rose-500',
      secondary: 'from-gray-900 to-purple-950',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      name: 'Premium',
      accent: 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600'
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Premium Gradient Design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl 
          bg-gradient-to-r from-emerald-900/30 to-cyan-900/20 
          border border-emerald-900/30 hover:border-emerald-500 
          hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
        title="Change Theme"
      >
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        
        <div className="relative flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-70"></div>
            <div className="relative p-1.5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border border-emerald-900/30">
              <Palette className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            </div>
          </div>
          
          <div className="text-left">
            <div className="text-sm font-bold text-emerald-300 group-hover:text-emerald-200">
              {themeColors[theme]?.name || 'Theme'}
            </div>
            <div className="text-xs text-emerald-400/70 group-hover:text-emerald-300/80">
              Click to change
            </div>
          </div>
          
          <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </button>

      {/* Theme Dropdown - Premium Glassmorphism */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 
          bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-950/95 
          backdrop-blur-xl rounded-2xl border border-emerald-900/50 
          shadow-2xl shadow-emerald-900/30 z-50 overflow-hidden">
          
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-emerald-900/40 to-cyan-900/30 border-b border-emerald-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>Select Theme</span>
                </h3>
                <p className="text-sm text-emerald-300/70 mt-1">
                  Customize your trading experience
                </p>
              </div>
              <div className="text-xs bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-3 py-1.5 rounded-full">
                {Object.keys(themeColors).length} Themes
              </div>
            </div>
          </div>

          {/* Theme Grid */}
          <div className="p-4 grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {Object.entries(themeColors).map(([themeId, themeData]) => {
              const isActive = theme === themeId;
              return (
                <button
                  key={themeId}
                  onClick={() => {
                    changeTheme(themeId);
                    setIsOpen(false);
                    // Save to localStorage for persistence
                    localStorage.setItem('velox_theme', themeId);
                  }}
                  className={`
                    group relative p-4 rounded-xl border-2 transition-all duration-300
                    ${isActive 
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/30' 
                      : 'border-emerald-900/30 hover:border-emerald-500/50'
                    }
                    bg-gradient-to-br ${themeData.secondary} overflow-hidden
                  `}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-70"></div>
                        <div className="relative w-6 h-6 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full flex items-center justify-center border-2 border-white">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Theme Preview */}
                  <div className="relative z-0">
                    {/* Theme Gradient Bar */}
                    <div className={`h-3 rounded-lg mb-3 bg-gradient-to-r ${themeData.primary} ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}></div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${themeData.accent}/20`}>
                          {themeData.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{themeData.name}</div>
                          <div className="text-xs text-emerald-300/70">
                            {themeId.replace('velox-', '')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mini Preview */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3">
                      <div className="h-2 rounded bg-emerald-500/40"></div>
                      <div className="h-2 rounded bg-cyan-500/40"></div>
                      <div className="h-2 rounded bg-gray-700"></div>
                      <div className="h-2 rounded bg-gray-600"></div>
                      <div className="h-2 rounded bg-gray-500"></div>
                      <div className="h-2 rounded bg-gray-400/40"></div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-emerald-900/30 bg-gradient-to-t from-gray-950/80 to-transparent">
            <div className="flex items-center justify-between text-xs text-emerald-300/60">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Theme applied instantly</span>
              </div>
              <button 
                onClick={() => {
                  changeTheme('velox-dark');
                  localStorage.setItem('velox_theme', 'velox-dark');
                  setIsOpen(false);
                }}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Reset to default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
