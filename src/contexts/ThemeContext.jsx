import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('emerald');
  const [themes] = useState([
    { id: 'emerald', name: 'Emerald Green', gradient: 'from-emerald-500 to-green-500' },
    { id: 'blue', name: 'Ocean Blue', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'amber', name: 'Sunset Amber', gradient: 'from-amber-500 to-red-500' },
    { id: 'dark', name: 'Midnight Dark', gradient: 'from-gray-800 to-gray-900' },
    { id: 'purple', name: 'Royal Purple', gradient: 'from-purple-500 to-pink-500' },
    { id: 'cyan', name: 'Cyan Wave', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'premium', name: 'Premium Gold', gradient: 'from-yellow-500 to-orange-500' },
  ]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('velox_theme');
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('emerald');
    }
  }, []);

  const applyTheme = (themeId) => {
    // Remove all theme classes
    document.documentElement.className = '';
    
    // Add new theme class
    document.documentElement.classList.add(`theme-${themeId}`);
    
    // Store in localStorage
    localStorage.setItem('velox_theme', themeId);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    
    // Dispatch event for other components to update
    window.dispatchEvent(new CustomEvent('themechange', { detail: newTheme }));
  };

  const toggleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    changeTheme(themes[nextIndex].id);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themes, 
      changeTheme, 
      toggleTheme,
      setTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
