import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('velox_theme') || 'light';
  });

  const themes = [
    { id: 'light', name: 'Light', class: 'light-theme' },
    { id: 'dark', name: 'Dark', class: 'dark-theme' },
    { id: 'blue', name: 'Ocean Blue', class: 'blue-theme' },
    { id: 'green', name: 'Forest Green', class: 'green-theme' },
    { id: 'purple', name: 'Royal Purple', class: 'purple-theme' }
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('velox_theme', theme);
    
    // Apply theme classes
    themes.forEach(t => {
      document.documentElement.classList.remove(t.class);
    });
    const currentTheme = themes.find(t => t.id === theme);
    if (currentTheme) {
      document.documentElement.classList.add(currentTheme.class);
    }
  }, [theme]);

  const changeTheme = (themeId) => {
    setTheme(themeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, themes, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};