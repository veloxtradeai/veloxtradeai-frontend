// ============================================
// VELOXTRADEAI - REAL API SERVICE - COMPLETE
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-backend.workers.dev';

// Token management
const getToken = () => {
  const token = localStorage.getItem('velox_auth_token');
  return token && token !== 'undefined' ? token : null;
};

const setToken = (token) => {
  if (token && token !== 'undefined') {
    localStorage.setItem('velox_auth_token', token);
  }
};

const removeToken = () => {
  localStorage.removeItem('velox_auth_token');
  localStorage.removeItem('velox_user');
};

// Safe number formatting
const safeToFixed = (value, decimals = 2) => {
  if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
    return '0.00';
  }
  return Number(value).toFixed(decimals);
};

// API Request helper - REAL WORKING
const apiRequest = async (endpoint, method = 'GET', data = null, useAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (useAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`📡 API Call: ${method} ${endpoint}`);
    
    // Construct full URL
    let fullUrl;
    if (endpoint.startsWith('http')) {
      fullUrl = endpoint;
    } else if (endpoint.startsWith('/')) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    } else {
      fullUrl = `${API_BASE_URL}/${endpoint}`;
    }

    const response = await fetch(fullUrl, config);
    
    // Handle network errors
    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        window.location.href = '/login';
        return { success: false, message: 'Session expired. Please login again.' };
      }
      
      if (response.status === 404) {
        console.warn(`⚠️ Endpoint not found: ${endpoint}`);
        return { 
          success: false, 
          message: 'Service temporarily unavailable',
          error: true 
        };
      }
      
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      return result;
    } else {
      const text = await response.text();
      return { success: true, data: text };
    }
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return {
      success: false,
      message: 'Network connection failed. Please check your internet.',
      data: null,
      error: error.message
    };
  }
};

// ======================
// HEALTH CHECK
// ======================
export const healthAPI = {
  check: async () => {
    return await apiRequest('/api/health', 'GET', null, false);
  }
};

// ======================
// REAL AUTHENTICATION APIs
// ======================
export const authAPI = {
  login: async (email, password) => {
    const result = await apiRequest('/api/auth/login', 'POST', { email, password }, false);
    if (result && result.success && result.token) {
      setToken(result.token);
      if (result.user) {
        localStorage.setItem('velox_user', JSON.stringify(result.user));
      }
    }
    return result;
  },
  
  register: async (userData) => {
    const result = await apiRequest('/api/auth/register', 'POST', userData, false);
    if (result && result.success && result.token) {
      setToken(result.token);
      if (result.user) {
        localStorage.setItem('velox_user', JSON.stringify(result.user));
      }
    }
    return result;
  },

  logout: () => {
    removeToken();
    window.location.href = '/login';
  },

  getCurrentUser: async () => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const result = await apiRequest('/api/auth/me');
      if (result && result.success && result.user) {
        localStorage.setItem('velox_user', JSON.stringify(result.user));
        return result.user;
      }
    } catch (error) {
      console.log('Auth error, using stored user');
    }
    
    // Fallback to stored user (for offline)
    const storedUser = localStorage.getItem('velox_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    
    return null;
  },

  updateProfile: async (userData) => {
    return await apiRequest('/api/auth/profile', 'POST', userData);
  }
};

// ======================
// REAL MARKET DATA APIs - NO DUMMY
// ======================
export const marketAPI = {
  // Get live market data for multiple symbols
  getLiveData: async (symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK']) => {
    const symbolStr = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return await apiRequest(`/api/market/realtime?symbols=${encodeURIComponent(symbolStr)}`);
  },

  // Get AI signal for a specific stock
  getStockSignal: async (symbol) => {
    return await apiRequest(`/api/market/signal?symbol=${encodeURIComponent(symbol)}`);
  },

  // Get top gainers - REAL ONLY
  getTopGainers: async () => {
    const result = await apiRequest('/api/market/top-gainers');
    if (result && result.success && Array.isArray(result.gainers)) {
      return result;
    }
    return { success: true, gainers: [] };
  },

  // Get top losers - REAL ONLY
  getTopLosers: async () => {
    const result = await apiRequest('/api/market/top-losers');
    if (result && result.success && Array.isArray(result.losers)) {
      return result;
    }
    return { success: true, losers: [] };
  },

  // Get option chain data
  getOptionChain: async (symbol = 'NIFTY') => {
    return await apiRequest(`/api/market/options?symbol=${encodeURIComponent(symbol)}`);
  },

  // Get market status
  getMarketStatus: async () => {
    const result = await apiRequest('/api/market/status');
    if (result && result.success) {
      return result;
    }
    // Default to closed if can't fetch
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    const isMarketHours = hours >= 9 && hours < 15;
    
    return {
      success: true,
      isOpen: !isWeekend && isMarketHours,
      message: !isWeekend && isMarketHours ? 'Market Open' : 'Market Closed',
      nextOpen: !isWeekend && !isMarketHours ? '9:15 AM Tomorrow' : 'Monday 9:15 AM'
    };
  },

  // Get index data
  getIndexData: async () => {
    return await apiRequest('/api/market/indices');
  }
};

// ======================
// REAL AI TRADING APIs
// ======================
export const tradingAPI = {
  // Get AI signals - NO DUMMY
  getAISignals: async () => {
    const result = await apiRequest('/api/ai/signals');
    if (result && result.success && Array.isArray(result.signals)) {
      // Filter only high confidence signals
      const highConfidence = result.signals.filter(signal => 
        signal.confidence && parseFloat(signal.confidence) >= 85
      );
      return { ...result, signals: highConfidence };
    }
    return { success: true, signals: [] };
  },

  // Get AI screener
  getAIScreener: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await apiRequest(`/api/ai/screener?${query}`);
  },

  // Generate signal (for auto-entry)
  generateSignal: async (stockData) => {
    return await apiRequest('/api/trades/auto-entry', 'POST', stockData);
  },

  // Get trading recommendations
  getRecommendations: async () => {
    const result = await apiRequest('/api/trading/recommendations');
    if (result && result.success && Array.isArray(result.recommendations)) {
      return result;
    }
    return { success: true, recommendations: [] };
  },

  // Get watchlist
  getWatchlist: async () => {
    const result = await apiRequest('/api/trading/watchlist');
    if (result && result.success && Array.isArray(result.watchlist)) {
      return result;
    }
    return { success: true, watchlist: [] };
  },

  // Add to watchlist
  addToWatchlist: async (symbol) => {
    return await apiRequest('/api/trading/watchlist/add', 'POST', { symbol });
  }
};

// ======================
// REAL BROKER APIs - WORKING
// ======================
export const brokerAPI = {
  // Connect a broker
  connectBroker: async (brokerData) => {
    return await apiRequest('/api/brokers/connect', 'POST', brokerData);
  },

  // Get all connected brokers
  getBrokers: async () => {
    const result = await apiRequest('/api/brokers');
    if (result && result.success) {
      return result;
    }
    return { success: true, brokers: [], connected: 0 };
  },

  // Get broker holdings
  getHoldings: async (brokerId) => {
    return await apiRequest(`/api/brokers/${brokerId}/holdings`);
  },

  // Place an order
  placeOrder: async (orderData) => {
    return await apiRequest('/api/trades/execute', 'POST', orderData);
  },

  // Test broker connection
  testConnection: async (brokerId) => {
    return await apiRequest(`/api/brokers/${brokerId}/test`);
  },

  // Disconnect broker
  disconnectBroker: async (brokerId) => {
    return await apiRequest(`/api/brokers/${brokerId}/disconnect`, 'POST');
  },

  // Sync broker holdings
  syncHoldings: async (brokerId) => {
    return await apiRequest(`/api/brokers/${brokerId}/sync`, 'POST');
  },

  // Get order history
  getOrderHistory: async (brokerId, days = 7) => {
    return await apiRequest(`/api/brokers/${brokerId}/orders?days=${days}`);
  },

  // Get broker margin
  getMargin: async (brokerId) => {
    return await apiRequest(`/api/brokers/${brokerId}/margin`);
  }
};

// ======================
// REAL TRADE MANAGEMENT APIs
// ======================
export const tradeAPI = {
  // Get all trades - NO DUMMY
  getTrades: async () => {
    const result = await apiRequest('/api/trades');
    if (result && result.success && Array.isArray(result.trades)) {
      return result;
    }
    return { success: true, trades: [] };
  },

  // Get active trades
  getActiveTrades: async () => {
    const result = await apiRequest('/api/trades/active');
    if (result && result.success && Array.isArray(result.trades)) {
      const active = result.trades.filter(trade => trade.status === 'open');
      return { ...result, trades: active };
    }
    return { success: true, trades: [] };
  },

  // Add a new trade
  addTrade: async (tradeData) => {
    return await apiRequest('/api/trades', 'POST', tradeData);
  },

  // Update a trade
  updateTrade: async (tradeId, updates) => {
    return await apiRequest(`/api/trades/${tradeId}`, 'PUT', updates);
  },

  // Auto adjust SL/TP
  autoAdjust: async (tradeId, currentPrice) => {
    return await apiRequest('/api/trades/auto-adjust', 'POST', { 
      trade_id: tradeId, 
      current_price: currentPrice 
    });
  },

  // Close a trade
  closeTrade: async (tradeId) => {
    return await apiRequest(`/api/trades/${tradeId}/close`, 'POST');
  },

  // Get trade statistics
  getTradeStats: async () => {
    return await apiRequest('/api/trades/stats');
  },

  // Bulk close trades
  bulkCloseTrades: async (tradeIds) => {
    return await apiRequest('/api/trades/bulk-close', 'POST', { trade_ids: tradeIds });
  }
};

// ======================
// REAL PORTFOLIO APIs - NO DUMMY
// ======================
export const portfolioAPI = {
  getAnalytics: async () => {
    const result = await apiRequest('/api/portfolio/analytics');
    
    if (result && result.success && result.portfolio) {
      // Ensure all values are valid numbers
      const portfolio = result.portfolio;
      return {
        success: true,
        portfolio: {
          totalValue: portfolio.totalValue || 0,
          dailyPnL: portfolio.dailyPnL || 0,
          winRate: portfolio.winRate || '0%',
          activeTrades: portfolio.activeTrades || 0,
          holdingsCount: portfolio.holdingsCount || 0,
          investedValue: portfolio.investedValue || 0,
          returnsPercent: portfolio.returnsPercent || 0,
          holdings: Array.isArray(portfolio.holdings) ? portfolio.holdings : []
        }
      };
    }
    
    // REAL EMPTY PORTFOLIO - NO DUMMY DATA
    return {
      success: true,
      portfolio: {
        totalValue: 0,
        dailyPnL: 0,
        winRate: '0%',
        activeTrades: 0,
        holdingsCount: 0,
        investedValue: 0,
        returnsPercent: 0,
        holdings: []
      }
    };
  },

  getPerformance: async (period = 'monthly') => {
    const result = await apiRequest(`/api/portfolio/performance?period=${period}`);
    if (result && result.success && result.performance) {
      return result;
    }
    return {
      success: true,
      performance: {
        monthlyReturn: 0,
        quarterlyReturn: 0,
        yearlyReturn: 0,
        allTimeReturn: 0
      }
    };
  },

  getHoldings: async () => {
    const result = await apiRequest('/api/portfolio/holdings');
    if (result && result.success && Array.isArray(result.holdings)) {
      return result;
    }
    return { success: true, holdings: [] };
  },

  getPnLHistory: async (days = 30) => {
    return await apiRequest(`/api/portfolio/pnl-history?days=${days}`);
  }
};

// ======================
// REAL SETTINGS APIs
// ======================
const defaultSettings = {
  notifications: {
    emailAlerts: false,
    smsAlerts: false,
    pushNotifications: true,
    whatsappAlerts: false,
    tradeExecuted: true,
    stopLossHit: true,
    targetAchieved: true,
    marketCloseAlerts: false,
    priceAlerts: true,
    newsAlerts: false
  },
  trading: {
    autoTradeExecution: false,
    maxPositions: 5,
    maxRiskPerTrade: 2,
    maxDailyLoss: 5,
    defaultQuantity: 1,
    allowShortSelling: false,
    slippageTolerance: 0.5,
    enableHedgeMode: false,
    requireConfirmation: true,
    partialExit: false,
    trailSLAfterProfit: true
  },
  risk: {
    stopLossType: 'percentage',
    stopLossValue: 2,
    trailingStopLoss: true,
    trailingStopDistance: 1,
    takeProfitType: 'percentage',
    takeProfitValue: 4,
    riskRewardRatio: 2,
    maxPortfolioRisk: 10,
    volatilityAdjustment: true,
    maxDrawdown: 15
  },
  display: {
    theme: 'dark',
    defaultView: 'dashboard',
    refreshInterval: 30,
    showAdvancedCharts: true,
    compactMode: false,
    language: 'en',
    showIndicators: true,
    darkModeIntensity: 'medium',
    chartType: 'candlestick',
    gridLines: true
  },
  privacy: {
    publicProfile: false,
    showPortfolioValue: true,
    shareTradingHistory: false,
    dataSharing: 'none',
    twoFactorAuth: false,
    sessionTimeout: 30,
    showRealName: false,
    hideBalance: false,
    autoLogout: true
  },
  api: {
    allowThirdPartyAccess: false,
    webhookEnabled: false,
    rateLimit: 'low',
    logRetention: '30days',
    apiKey: '',
    webhookUrl: ''
  },
  subscription: {
    plan: 'free_trial',
    trialDaysLeft: 7,
    autoRenew: false,
    billingCycle: 'monthly'
  },
  broker: {
    connectedBrokers: [],
    autoSync: false,
    syncInterval: 5
  }
};

export const settingsAPI = {
  getSettings: async () => {
    const result = await apiRequest('/api/settings');
    if (result && result.success && result.settings) {
      // Merge with defaults for missing values
      const mergedSettings = JSON.parse(JSON.stringify(defaultSettings));
      Object.keys(result.settings).forEach(category => {
        if (mergedSettings[category]) {
          Object.keys(result.settings[category]).forEach(key => {
            if (mergedSettings[category][key] !== undefined) {
              mergedSettings[category][key] = result.settings[category][key];
            }
          });
        }
      });
      return { success: true, settings: mergedSettings };
    }
    return { success: true, settings: defaultSettings };
  },

  saveSettings: async (settings) => {
    return await apiRequest('/api/settings', 'POST', settings);
  },

  resetSettings: async () => {
    return await apiRequest('/api/settings/reset', 'POST');
  },

  // Theme management
  setTheme: (theme) => {
    localStorage.setItem('velox_theme', theme);
    document.documentElement.classList.remove('light', 'dark', 'auto');
    if (theme !== 'auto') {
      document.documentElement.classList.add(theme);
    }
  },

  getTheme: () => {
    return localStorage.getItem('velox_theme') || 'dark';
  }
};

// ======================
// REAL SUBSCRIPTION APIs
// ======================
export const subscriptionAPI = {
  check: async () => {
    const result = await apiRequest('/api/subscription/status');
    if (result && result.success) {
      return result;
    }
    // Default trial
    const userStr = localStorage.getItem('velox_user');
    let trialDaysLeft = 7;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.createdAt) {
          const created = new Date(user.createdAt);
          const now = new Date();
          const daysPassed = Math.floor((now - created) / (1000 * 60 * 60 * 24));
          trialDaysLeft = Math.max(0, 7 - daysPassed);
        }
      } catch {}
    }
    
    return {
      success: true,
      plan: 'free_trial',
      trialDaysLeft: trialDaysLeft,
      active: true,
      expiresAt: new Date(Date.now() + trialDaysLeft * 24 * 60 * 60 * 1000).toISOString()
    };
  },

  getPlans: async () => {
    const result = await apiRequest('/api/subscription/plans');
    if (result && result.success && Array.isArray(result.plans)) {
      return result;
    }
    return {
      success: true,
      plans: [
        { 
          id: 'free_trial', 
          name: '7-Day Free Trial', 
          price: 0, 
          duration: '7 days',
          features: ['Basic AI signals', '1 broker connection', 'Limited alerts', 'Daily 5 recommendations']
        },
        { 
          id: 'monthly', 
          name: 'Monthly Plan', 
          price: 999, 
          duration: '30 days',
          features: ['Full AI signals', 'Unlimited brokers', 'All alerts', 'Priority support', 'Real-time data']
        },
        { 
          id: 'quarterly', 
          name: 'Quarterly Plan', 
          price: 2699, 
          duration: '90 days',
          features: ['Everything in Monthly', 'Save 10%', 'Advanced analytics', 'Dedicated support']
        },
        { 
          id: 'yearly', 
          name: 'Yearly Plan', 
          price: 9999, 
          duration: '365 days',
          features: ['Everything in Quarterly', 'Save 16%', 'Premium features', '24/7 phone support', 'Custom strategies']
        }
      ]
    };
  },

  upgrade: async (planId) => {
    return await apiRequest('/api/subscription/upgrade', 'POST', { plan: planId });
  },

  getInvoices: async () => {
    return await apiRequest('/api/subscription/invoices');
  },

  cancelSubscription: async () => {
    return await apiRequest('/api/subscription/cancel', 'POST');
  }
};

// ======================
// CHAT & SUPPORT APIs
// ======================
export const chatAPI = {
  // Get chat history
  getChatHistory: async () => {
    return await apiRequest('/api/chat/history');
  },

  // Send message
  sendMessage: async (message) => {
    return await apiRequest('/api/chat/send', 'POST', { message });
  },

  // Get support tickets
  getTickets: async () => {
    return await apiRequest('/api/support/tickets');
  },

  // Create support ticket
  createTicket: async (subject, message) => {
    return await apiRequest('/api/support/tickets', 'POST', { subject, message });
  },

  // Get FAQ
  getFAQ: async () => {
    return await apiRequest('/api/support/faq');
  }
};

// ======================
// LANGUAGE MANAGEMENT
// ======================
export const languageAPI = {
  setLanguage: (lang) => {
    localStorage.setItem('velox_language', lang);
    // Dispatch event for language change
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  },

  getLanguage: () => {
    return localStorage.getItem('velox_language') || 'en';
  },

  getTranslations: async (lang = 'en') => {
    // Try to fetch from API first
    try {
      const result = await apiRequest(`/api/language/${lang}`);
      if (result && result.success && result.translations) {
        return result.translations;
      }
    } catch (error) {
      console.log('Using built-in translations');
    }
    
    // Built-in translations
    const translations = {
      en: {
        dashboard: 'Dashboard',
        portfolioValue: 'Portfolio Value',
        dailyPnL: 'Daily P&L',
        winRate: 'Win Rate',
        activeTrades: 'Active Trades',
        marketOpen: 'Market Open',
        marketClosed: 'Market Closed',
        refresh: 'Refresh',
        holdings: 'holdings',
        today: 'Today',
        recommendations: 'AI Recommendations',
        stock: 'Stock',
        price: 'Price',
        change: 'Change',
        signal: 'Signal',
        confidence: 'Confidence',
        action: 'Action',
        buy: 'Buy',
        sell: 'Sell',
        entry: 'Entry',
        exit: 'Exit',
        stoploss: 'Stop Loss',
        target: 'Target',
        quantity: 'Quantity',
        connectBroker: 'Connect Broker',
        settings: 'Settings',
        logout: 'Logout',
        login: 'Login',
        register: 'Register',
        subscription: 'Subscription',
        analytics: 'Analytics',
        brokerSettings: 'Broker Settings'
      },
      hi: {
        dashboard: 'डैशबोर्ड',
        portfolioValue: 'पोर्टफोलियो वैल्यू',
        dailyPnL: 'दैनिक P&L',
        winRate: 'जीत दर',
        activeTrades: 'सक्रिय ट्रेड',
        marketOpen: 'बाज़ार खुला',
        marketClosed: 'बाज़ार बंद',
        refresh: 'रिफ्रेश',
        holdings: 'होल्डिंग्स',
        today: 'आज',
        recommendations: 'AI सिफ़ारिशें',
        stock: 'स्टॉक',
        price: 'मूल्य',
        change: 'बदलाव',
        signal: 'संकेत',
        confidence: 'आत्मविश्वास',
        action: 'कार्रवाई',
        buy: 'खरीदें',
        sell: 'बेचें',
        entry: 'प्रवेश',
        exit: 'निकास',
        stoploss: 'स्टॉप लॉस',
        target: 'लक्ष्य',
        quantity: 'मात्रा',
        connectBroker: 'ब्रोकर जोड़ें',
        settings: 'सेटिंग्स',
        logout: 'लॉग आउट',
        login: 'लॉग इन',
        register: 'पंजीकरण',
        subscription: 'सदस्यता',
        analytics: 'विश्लेषण',
        brokerSettings: 'ब्रोकर सेटिंग्स'
      }
    };
    
    return translations[lang] || translations.en;
  }
};

// ======================
// REAL-TIME WebSocket
// ======================
export const setupWebSocket = (onMessage) => {
  try {
    // Check if browser supports WebSocket
    if (typeof WebSocket === 'undefined') {
      console.warn('WebSocket not supported');
      return () => {};
    }
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = API_BASE_URL.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}//${wsHost}/ws`;
    
    console.log(`🔌 Connecting WebSocket to: ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      const token = getToken();
      if (token) {
        ws.send(JSON.stringify({ 
          type: 'auth', 
          token: token,
          client: 'web',
          version: '3.0'
        }));
      }
      
      // Subscribe to market updates
      ws.send(JSON.stringify({ 
        type: 'subscribe',
        channels: ['market_data', 'signals', 'portfolio']
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage && typeof onMessage === 'function') {
          onMessage(data);
        }
        
        // Handle specific message types
        switch(data.type) {
          case 'market_update':
            console.log('📈 Market update:', data.symbol, data.price);
            break;
          case 'signal_alert':
            console.log('🚨 Signal alert:', data);
            // Show notification if confidence is high
            if (data.confidence >= 85) {
              if (Notification.permission === 'granted') {
                new Notification(`AI Signal: ${data.symbol}`, {
                  body: `${data.action} - ${data.confidence}% confidence`,
                  icon: '/logo.png'
                });
              }
            }
            break;
          case 'trade_update':
            console.log('💰 Trade update:', data);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);
      // Reconnect after delay
      if (event.code !== 1000) {
        console.log('Reconnecting in 3 seconds...');
        setTimeout(() => setupWebSocket(onMessage), 3000);
      }
    };

    // Return cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component unmounting');
      }
    };
  } catch (error) {
    console.error('WebSocket setup failed:', error);
    return () => {};
  }
};

// ======================
// UTILITY FUNCTIONS
// ======================
export const utils = {
  // Format currency
  formatCurrency: (amount, currency = '₹') => {
    if (amount === undefined || amount === null || amount === '') {
      return `${currency}0`;
    }
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return `${currency}0`;
      
      if (Math.abs(num) >= 10000000) {
        // For crores
        return `${currency}${(num / 10000000).toFixed(2)}Cr`;
      } else if (Math.abs(num) >= 100000) {
        // For lakhs
        return `${currency}${(num / 100000).toFixed(2)}L`;
      } else if (Math.abs(num) >= 1000) {
        // For thousands
        return `${currency}${(num / 1000).toFixed(1)}K`;
      }
      
      return `${currency}${num.toLocaleString('en-IN', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    } catch (error) {
      return `${currency}0`;
    }
  },

  // Format percentage
  formatPercent: (value) => {
    if (value === undefined || value === null || value === '') {
      return '0.00%';
    }
    try {
      const num = parseFloat(value);
      if (isNaN(num)) return '0.00%';
      
      const sign = num >= 0 ? '+' : '';
      return `${sign}${num.toFixed(2)}%`;
    } catch (error) {
      return '0.00%';
    }
  },

  // Format date
  formatDate: (date, format = 'relative') => {
    if (!date) return '--';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '--';
    
    if (format === 'relative') {
      const now = new Date();
      const diffMs = now - dateObj;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    
    return dateObj.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Validate email
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate phone
  validatePhone: (phone) => {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone.replace(/\D/g, ''));
  },

  // Generate random ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ======================
// EXPORT ALL APIs
// ======================
export default {
  health: healthAPI,
  auth: authAPI,
  market: marketAPI,
  trading: tradingAPI,
  broker: brokerAPI,
  trade: tradeAPI,
  portfolio: portfolioAPI,
  subscription: subscriptionAPI,
  chat: chatAPI,
  language: languageAPI,
  settings: settingsAPI,
  utils: utils,
  setupWebSocket,
  safeToFixed,
  
  // Check backend status
  checkBackendStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Get API base URL
  getApiBaseUrl: () => API_BASE_URL,

  // Initialize app
  initialize: async () => {
    console.log('🚀 Initializing VeloxTradeAI...');
    
    // Set theme
    const theme = settingsAPI.getTheme();
    settingsAPI.setTheme(theme);
    
    // Check backend
    const isBackendConnected = await api.checkBackendStatus();
    console.log(`Backend ${isBackendConnected ? '✅ Connected' : '❌ Disconnected'}`);
    
    return {
      backendConnected: isBackendConnected,
      theme: theme,
      language: languageAPI.getLanguage(),
      version: '3.0.0'
    };
  }
};

// Global instance
const api = {
  health: healthAPI,
  auth: authAPI,
  market: marketAPI,
  trading: tradingAPI,
  broker: brokerAPI,
  trade: tradeAPI,
  portfolio: portfolioAPI,
  subscription: subscriptionAPI,
  chat: chatAPI,
  language: languageAPI,
  settings: settingsAPI,
  utils: utils,
  setupWebSocket,
  safeToFixed,
  checkBackendStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  },
  getApiBaseUrl: () => API_BASE_URL,
  initialize: async () => {
    console.log('🚀 Initializing VeloxTradeAI...');
    
    // Set theme
    const theme = settingsAPI.getTheme();
    settingsAPI.setTheme(theme);
    
    // Check backend
    const isBackendConnected = await api.checkBackendStatus();
    console.log(`Backend ${isBackendConnected ? '✅ Connected' : '❌ Disconnected'}`);
    
    return {
      backendConnected: isBackendConnected,
      theme: theme,
      language: languageAPI.getLanguage(),
      version: '3.0.0'
    };
  }
};

export { api as default };
