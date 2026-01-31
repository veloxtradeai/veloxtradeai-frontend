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
      // Navigation
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      brokerSettings: 'Broker Settings',
      subscription: 'Subscription',
      settings: 'Settings',
      logout: 'Logout',
      
      // Dashboard
      portfolioValue: 'Portfolio Value',
      dailyPnL: 'Daily P&L',
      winRate: 'Win Rate',
      activeTrades: 'Active Trades',
      marketOpen: 'Market Open',
      marketClosed: 'Market Closed',
      
      // Analytics
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
      connect: 'Connect',
      disconnect: 'Disconnect',
      sync: 'Sync',
      viewAll: 'View All',
      
      // Broker Settings
      connectedBrokers: 'Connected Brokers',
      totalHoldings: 'Total Holdings',
      availableBalance: 'Available Balance',
      totalEquity: 'Total Equity',
      brokerConnections: 'Broker Connections',
      connectNewBroker: 'Connect New Broker',
      noBrokersConnected: 'No Brokers Connected',
      noHoldingsFound: 'No Holdings Found',
      portfolioSummary: 'Portfolio Summary',
      totalInvestments: 'Total Investments',
      currentValue: 'Current Value',
      totalPnL: 'Total P&L',
      dayPnL: 'Day P&L',
      
      // Settings
      notifications: 'Notifications',
      alertChannels: 'Alert Channels',
      emailAlerts: 'Email Alerts',
      smsAlerts: 'SMS Alerts',
      pushNotifications: 'Push Notifications',
      whatsappAlerts: 'WhatsApp Alerts',
      tradeEvents: 'Trade Events',
      tradeExecuted: 'Trade Executed',
      stopLossHit: 'Stop Loss Hit',
      targetAchieved: 'Target Achieved',
      marketCloseSummary: 'Market Close Summary',
      priceAlerts: 'Price Alerts',
      newsAlerts: 'News Alerts',
      tradingConfiguration: 'Trading Configuration',
      autoTradeExecution: 'Auto Trade Execution',
      maxOpenPositions: 'Max Open Positions',
      maxRiskPerTrade: 'Max Risk Per Trade',
      defaultQuantity: 'Default Quantity',
      maxDailyLoss: 'Max Daily Loss',
      slippageTolerance: 'Slippage Tolerance',
      partialExit: 'Partial Exit',
      allowShortSelling: 'Allow Short Selling',
      tradeConfirmation: 'Trade Confirmation',
      riskManagement: 'Risk Management',
      stopLossSettings: 'Stop Loss Settings',
      stopLossType: 'Stop Loss Type',
      stopLossPercentage: 'Stop Loss Percentage',
      trailingStopLoss: 'Trailing Stop Loss',
      trailingDistance: 'Trailing Distance',
      takeProfitType: 'Take Profit Type',
      takeProfitPercentage: 'Take Profit Percentage',
      maxPortfolioRisk: 'Max Portfolio Risk',
      display: 'Display',
      themeAppearance: 'Theme & Appearance',
      themeSelection: 'Theme Selection',
      dark: 'Dark',
      light: 'Light',
      blue: 'Blue',
      green: 'Green',
      language: 'Language',
      displayPreferences: 'Display Preferences',
      advancedCharts: 'Advanced Charts',
      compactMode: 'Compact Mode',
      technicalIndicators: 'Technical Indicators',
      gridLines: 'Grid Lines',
      autoRefreshInterval: 'Auto Refresh Interval',
      privacySecurity: 'Privacy & Security',
      twoFactorAuthentication: 'Two-Factor Authentication',
      publicProfile: 'Public Profile',
      showPortfolioValue: 'Show Portfolio Value',
      shareTradingHistory: 'Share Trading History',
      showRealName: 'Show Real Name',
      hideBalance: 'Hide Balance',
      autoLogout: 'Auto Logout',
      sessionTimeout: 'Session Timeout',
      dataSharingPreferences: 'Data Sharing Preferences',
      dataManagement: 'Data Management',
      exportAllSettings: 'Export All Settings',
      resetToDefault: 'Reset to Default',
      deleteAccount: 'Delete Account',
      apiSettings: 'API Settings',
      allowThirdPartyAccess: 'Allow Third-Party Access',
      webhookNotifications: 'Webhook Notifications',
      apiRateLimit: 'API Rate Limit',
      logRetentionPeriod: 'Log Retention Period'
    },
    hi: {
      // Navigation
      dashboard: 'डैशबोर्ड',
      analytics: 'एनालिटिक्स',
      brokerSettings: 'ब्रोकर सेटिंग्स',
      subscription: 'सब्सक्रिप्शन',
      settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
      
      // Dashboard
      portfolioValue: 'पोर्टफोलियो वैल्यू',
      dailyPnL: 'दैनिक P&L',
      winRate: 'विन रेट',
      activeTrades: 'एक्टिव ट्रेड्स',
      marketOpen: 'बाज़ार खुला',
      marketClosed: 'बाज़ार बंद',
      
      // Analytics
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
      connect: 'कनेक्ट',
      disconnect: 'डिस्कनेक्ट',
      sync: 'सिंक',
      viewAll: 'सभी देखें',
      
      // Broker Settings
      connectedBrokers: 'कनेक्टेड ब्रोकर',
      totalHoldings: 'कुल होल्डिंग्स',
      availableBalance: 'उपलब्ध बैलेंस',
      totalEquity: 'कुल इक्विटी',
      brokerConnections: 'ब्रोकर कनेक्शन्स',
      connectNewBroker: 'नया ब्रोकर कनेक्ट करें',
      noBrokersConnected: 'कोई ब्रोकर कनेक्ट नहीं',
      noHoldingsFound: 'कोई होल्डिंग्स नहीं मिली',
      portfolioSummary: 'पोर्टफोलियो सारांश',
      totalInvestments: 'कुल निवेश',
      currentValue: 'वर्तमान वैल्यू',
      totalPnL: 'कुल P&L',
      dayPnL: 'दिन का P&L',
      
      // Settings
      notifications: 'नोटिफिकेशन',
      alertChannels: 'अलर्ट चैनल्स',
      emailAlerts: 'ईमेल अलर्ट्स',
      smsAlerts: 'SMS अलर्ट्स',
      pushNotifications: 'पुश नोटिफिकेशन',
      whatsappAlerts: 'WhatsApp अलर्ट्स',
      tradeEvents: 'ट्रेड इवेंट्स',
      tradeExecuted: 'ट्रेड एक्जीक्यूट हुआ',
      stopLossHit: 'स्टॉप लॉस हिट',
      targetAchieved: 'टार्गेट अचीव्ड',
      marketCloseSummary: 'मार्केट क्लोज समरी',
      priceAlerts: 'प्राइस अलर्ट्स',
      newsAlerts: 'न्यूज अलर्ट्स',
      tradingConfiguration: 'ट्रेडिंग कॉन्फ़िगरेशन',
      autoTradeExecution: 'ऑटो ट्रेड एक्जीक्यूशन',
      maxOpenPositions: 'मैक्स ओपन पोजीशन्स',
      maxRiskPerTrade: 'मैक्स रिस्क प्रति ट्रेड',
      defaultQuantity: 'डिफ़ॉल्ट क्वांटिटी',
      maxDailyLoss: 'मैक्स डेली लॉस',
      slippageTolerance: 'स्लिपेज टॉलरेंस',
      partialExit: 'पार्शियल एक्जिट',
      allowShortSelling: 'शॉर्ट सेलिंग की अनुमति',
      tradeConfirmation: 'ट्रेड कन्फर्मेशन',
      riskManagement: 'रिस्क मैनेजमेंट',
      stopLossSettings: 'स्टॉप लॉस सेटिंग्स',
      stopLossType: 'स्टॉप लॉस टाइप',
      stopLossPercentage: 'स्टॉप लॉस प्रतिशत',
      trailingStopLoss: 'ट्रेलिंग स्टॉप लॉस',
      trailingDistance: 'ट्रेलिंग डिस्टेंस',
      takeProfitType: 'टेक प्रॉफिट टाइप',
      takeProfitPercentage: 'टेक प्रॉफिट प्रतिशत',
      maxPortfolioRisk: 'मैक्स पोर्टफोलियो रिस्क',
      display: 'डिस्प्ले',
      themeAppearance: 'थीम और अपीयरेंस',
      themeSelection: 'थीम सिलेक्शन',
      dark: 'डार्क',
      light: 'लाइट',
      blue: 'ब्लू',
      green: 'ग्रीन',
      language: 'भाषा',
      displayPreferences: 'डिस्प्ले प्रेफरेंसेज',
      advancedCharts: 'एडवांस्ड चार्ट्स',
      compactMode: 'कॉम्पैक्ट मोड',
      technicalIndicators: 'टेक्निकल इंडिकेटर्स',
      gridLines: 'ग्रिड लाइन्स',
      autoRefreshInterval: 'ऑटो रिफ्रेश इंटरवल',
      privacySecurity: 'प्राइवेसी और सिक्योरिटी',
      twoFactorAuthentication: 'टू-फैक्टर ऑथेंटिकेशन',
      publicProfile: 'पब्लिक प्रोफाइल',
      showPortfolioValue: 'पोर्टफोलियो वैल्यू दिखाएं',
      shareTradingHistory: 'ट्रेडिंग हिस्ट्री शेयर करें',
      showRealName: 'रियल नेम दिखाएं',
      hideBalance: 'बैलेंस छुपाएं',
      autoLogout: 'ऑटो लॉगआउट',
      sessionTimeout: 'सेशन टाइमआउट',
      dataSharingPreferences: 'डेटा शेयरिंग प्रेफरेंसेज',
      dataManagement: 'डेटा मैनेजमेंट',
      exportAllSettings: 'सभी सेटिंग्स एक्सपोर्ट करें',
      resetToDefault: 'डिफ़ॉल्ट पर रीसेट करें',
      deleteAccount: 'अकाउंट डिलीट करें',
      apiSettings: 'API सेटिंग्स',
      allowThirdPartyAccess: 'थर्ड-पार्टी API एक्सेस दें',
      webhookNotifications: 'वेबहुक नोटिफिकेशन',
      apiRateLimit: 'API रेट लिमिट',
      logRetentionPeriod: 'लॉग रिटेंशन पीरियड'
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
