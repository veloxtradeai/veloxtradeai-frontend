import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  const translationsData = {
    en: {
      // Dashboard
      dashboard: 'Dashboard',
      portfolioValue: 'Portfolio Value',
      dailyPnL: 'Daily P&L',
      winRate: 'Win Rate',
      activeTrades: 'Active Trades',
      marketOpen: 'Market Open',
      marketClosed: 'Market Closed',
      
      // Analytics
      analytics: 'Analytics',
      performance: 'Performance',
      totalTrades: 'Total Trades',
      winningTrades: 'Winning Trades',
      losingTrades: 'Losing Trades',
      avgDailyPnL: 'Avg Daily P&L',
      
      // Common
      loading: 'Loading...',
      refresh: 'Refresh',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      logout: 'Logout'
    },
    hi: {
      // Dashboard
      dashboard: 'डैशबोर्ड',
      portfolioValue: 'पोर्टफोलियो वैल्यू',
      dailyPnL: 'दैनिक P&L',
      winRate: 'विन रेट',
      activeTrades: 'एक्टिव ट्रेड्स',
      marketOpen: 'बाज़ार खुला',
      marketClosed: 'बाज़ार बंद',
      
      // Analytics
      analytics: 'एनालिटिक्स',
      performance: 'परफॉर्मेंस',
      totalTrades: 'कुल ट्रेड्स',
      winningTrades: 'जीतने वाले ट्रेड्स',
      losingTrades: 'हारने वाले ट्रेड्स',
      avgDailyPnL: 'औसत दैनिक P&L',
      
      // Common
      loading: 'लोड हो रहा है...',
      refresh: 'रिफ़्रेश',
      save: 'सेव करें',
      cancel: 'कैंसल',
      confirm: 'कन्फर्म',
      logout: 'लॉगआउट'
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('velox_language') || 'en';
    setLanguage(savedLang);
    setTranslations(translationsData[savedLang] || translationsData.en);
  }, []);

  const changeLanguage = (lang) => {
    if (translationsData[lang]) {
      setLanguage(lang);
      setTranslations(translationsData[lang]);
      localStorage.setItem('velox_language', lang);
    }
  };

  const t = (key) => {
    return translations[key] || key;
  };

  const value = {
    language,
    translations,
    t,
    changeLanguage,
    isHindi: language === 'hi',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
