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
  const [theme, setTheme] = useState('velox-dark');
  const [themes] = useState([
    { id: 'velox-dark', name: 'Velox Dark' },
    { id: 'velox-light', name: 'Velox Light' },
    { id: 'velox-neon', name: 'Neon Pro' },
    { id: 'velox-ocean', name: 'Ocean Blue' },
    { id: 'velox-sunset', name: 'Sunset' },
    { id: 'velox-fire', name: 'Fire Red' },
    { id: 'velox-premium', name: 'Premium' },
  ]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('velox_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    
    // Apply theme classes to body
    document.body.className = '';
    document.body.classList.add(`theme-${newTheme}`);
    
    // Store in localStorage
    localStorage.setItem('velox_theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, themes, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
