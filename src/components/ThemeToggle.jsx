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

  const themeColors = {
    'emerald': {
      primary: 'from-emerald-500 to-green-500',
      secondary: 'from-gray-900 to-gray-950',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      name: 'Emerald Green',
      accent: 'bg-gradient-to-r from-emerald-600 to-green-600'
    },
    'blue': {
      primary: 'from-blue-500 to-cyan-500',
      secondary: 'from-blue-900 to-cyan-950',
      icon: <Droplets className="w-5 h-5 text-blue-400" />,
      name: 'Ocean Blue',
      accent: 'bg-gradient-to-r from-blue-600 to-cyan-600'
    },
    'amber': {
      primary: 'from-amber-500 to-red-500',
      secondary: 'from-amber-900 to-red-950',
      icon: <Sunset className="w-5 h-5 text-amber-400" />,
      name: 'Sunset Amber',
      accent: 'bg-gradient-to-r from-amber-600 to-red-600'
    },
    'dark': {
      primary: 'from-gray-800 to-gray-900',
      secondary: 'from-gray-900 to-gray-950',
      icon: <Moon className="w-5 h-5 text-gray-400" />,
      name: 'Midnight Dark',
      accent: 'bg-gradient-to-r from-gray-700 to-gray-800'
    },
    'purple': {
      primary: 'from-purple-500 to-pink-500',
      secondary: 'from-purple-900 to-pink-950',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      name: 'Royal Purple',
      accent: 'bg-gradient-to-r from-purple-600 to-pink-600'
    },
    'cyan': {
      primary: 'from-cyan-500 to-blue-500',
      secondary: 'from-cyan-900 to-blue-950',
      icon: <Droplets className="w-5 h-5 text-cyan-400" />,
      name: 'Cyan Wave',
      accent: 'bg-gradient-to-r from-cyan-600 to-blue-600'
    },
    'premium': {
      primary: 'from-yellow-500 to-orange-500',
      secondary: 'from-yellow-900 to-orange-950',
      icon: <Flame className="w-5 h-5 text-yellow-400" />,
      name: 'Premium Gold',
      accent: 'bg-gradient-to-r from-yellow-600 to-orange-600'
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-900/30 border border-emerald-900/40 hover:border-emerald-500 transition-all"
        title="Change Theme"
      >
        <Palette className="w-4 h-4 text-emerald-400" />
        <span className="text-sm text-white hidden lg:inline">
          {themeColors[theme]?.name || 'Theme'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl shadow-2xl border border-emerald-900/40 z-50">
          <div className="p-4 border-b border-emerald-900/40">
            <h4 className="text-sm text-emerald-400 font-medium">Select Theme</h4>
            <p className="text-xs text-emerald-300/60 mt-1">Choose your preferred color scheme</p>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  changeTheme(t.id);
                  setIsOpen(false);
                }}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                  theme === t.id 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-emerald-900/40 bg-slate-800/30 hover:border-emerald-500/60'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg mb-2 flex items-center justify-center bg-gradient-to-r ${t.gradient}`}>
                  {themeColors[t.id]?.icon || <Palette className="w-5 h-5 text-white" />}
                </div>
                <span className={`text-xs font-medium ${theme === t.id ? 'text-emerald-400' : 'text-white'}`}>
                  {t.name}
                </span>
                {theme === t.id && (
                  <div className="mt-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-emerald-900/40">
            <div className="text-xs text-emerald-300/60 text-center">
              Theme changes apply instantly
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
