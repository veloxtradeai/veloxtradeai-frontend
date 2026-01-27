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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        title="Change Theme"
      >
        <Palette className="w-5 h-5 text-emerald-400" />
        <span className="text-sm text-white">{themeColors[theme]?.name || 'Theme'}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-50">
          <div className="p-2">
            <h4 className="text-xs text-gray-400 px-2 py-1">Select Theme</h4>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  changeTheme(t.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-600"
                    style={{ 
                      backgroundColor: t.id === 'velox-light' ? '#f9fafb' : 
                                     t.id === 'velox-dark' ? '#111827' : 
                                     '#8b5cf6'
                    }}
                  />
                  <span className="text-sm text-white">{t.name}</span>
                </div>
                {theme === t.id && <Check className="w-4 h-4 text-green-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
