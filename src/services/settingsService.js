// services/settingsService.js
import { settingsAPI } from './api';

export const settingsService = {
  // Alias for backward compatibility
  getUserSettings: async (token) => {
    return await settingsAPI.getSettings();
  },
  
  saveUserSettings: async (token, settings) => {
    return await settingsAPI.saveSettings(settings);
  },
  
  // Additional methods
  applyTheme: (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('velox_theme', theme);
  },
  
  getTheme: () => {
    return localStorage.getItem('velox_theme') || 'light';
  },
  
  setLanguage: (lang) => {
    localStorage.setItem('velox_language', lang);
    return lang;
  },
  
  getLanguage: () => {
    return localStorage.getItem('velox_language') || 'en';
  }
};

export default settingsService;
