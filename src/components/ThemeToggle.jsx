import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, themes, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        title="Change Theme"
      >
        <Palette className="w-5 h-5" />
        <span className="text-sm">Theme</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
          <div className="p-2">
            <h4 className="text-xs text-gray-400 px-2 py-1">Select Theme</h4>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  changeTheme(t.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-600"
                    style={{ 
                      backgroundColor: t.id === 'light' ? '#f9fafb' : 
                                     t.id === 'dark' ? '#111827' : 
                                     t.id === 'blue' ? '#0ea5e9' : 
                                     t.id === 'green' ? '#10b981' : '#8b5cf6' 
                    }}
                  />
                  <span className="text-sm">{t.name}</span>
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