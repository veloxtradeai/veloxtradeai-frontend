// ============================================
// VELOXTRADEAI - REAL API SERVICE - COMPLETE
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Token management
const getToken = () => localStorage.getItem('velox_auth_token');
const setToken = (token) => localStorage.setItem('velox_auth_token', token);
const removeToken = () => localStorage.removeItem('velox_auth_token');

// Safe number formatting
const safeToFixed = (value, decimals = 2) => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0.00';
  }
  return Number(value).toFixed(decimals);
};

// API Request helper
const apiRequest = async (endpoint, method = 'GET', data = null, useAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
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
    mode: 'cors',
    credentials: 'omit',
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`📡 API Call: ${method} ${API_BASE_URL}${endpoint}`);
    
    // Check if endpoint starts with /api
    const fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(fullUrl, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      return { success: false, message: 'Session expired' };
    }

    // Handle 400, 404 errors gracefully
    if (response.status === 400 || response.status === 404) {
      console.log(`⚠️ API ${response.status}: ${endpoint}`);
      return { 
        success: false, 
        message: 'Endpoint not available',
        error: true 
      };
    }

    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { success: false, message: text };
    }
    
    if (!response.ok) {
      throw new Error(result.message || `API error: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('❌ API Error:', error);
    return {
      success: false,
      message: 'Backend connection failed',
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
// AUTHENTICATION APIs
// ======================
export const authAPI = {
  login: async (email, password) => {
    const result = await apiRequest('/api/auth/login', 'POST', { email, password }, false);
    if (result && result.success) {
      setToken(result.token);
    }
    return result;
  },
  
  register: async (userData) => {
    const result = await apiRequest('/api/auth/register', 'POST', userData, false);
    if (result && result.success) {
      setToken(result.token);
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
    
    const result = await apiRequest('/api/auth/me');
    if (result && result.success) {
      return result.user || { 
        email: 'user@demo.com', 
        subscription: result.subscription || 'trial',
        name: 'Demo User'
      };
    }
    return null;
  }
};

// ======================
// MARKET DATA APIs
// ======================
export const marketAPI = {
  // Get live market data for multiple symbols
  getLiveData: async (symbols = 'RELIANCE,TCS,HDFCBANK,INFY,ICICIBANK') => {
    return await apiRequest(`/api/market/realtime?symbols=${symbols}`);
  },

  // Get AI signal for a specific stock
  getStockSignal: async (symbol) => {
    return await apiRequest(`/api/market/signal?symbol=${symbol}`);
  },

  // Get top gainers
  getTopGainers: async () => {
    return await apiRequest('/api/market/top-gainers');
  },

  // Get top losers
  getTopLosers: async () => {
    return await apiRequest('/api/market/top-losers');
  },

  // Get option chain data
  getOptionChain: async (symbol = 'NIFTY') => {
    try {
      const response = await apiRequest(`/api/market/options?symbol=${symbol}`);
      return response;
    } catch {
      return {
        success: true,
        data: [],
        message: 'Option chain endpoint not available'
      };
    }
  },

  // Get market status
  getMarketStatus: async () => {
    try {
      const response = await apiRequest('/api/market/status');
      return response;
    } catch {
      return {
        success: true,
        isOpen: false,
        message: 'Market closed'
      };
    }
  }
};

// ======================
// AI TRADING APIs
// ======================
export const tradingAPI = {
  // Get AI signals
  getAISignals: async () => {
    return await apiRequest('/api/ai/signals');
  },

  // Get AI screener
  getAIScreener: async () => {
    return await apiRequest('/api/ai/screener');
  },

  // Generate signal (for auto-entry)
  generateSignal: async (stockData) => {
    return await apiRequest('/api/trades/auto-entry', 'POST', stockData);
  },

  // Get trading recommendations
  getRecommendations: async () => {
    return await apiRequest('/api/trading/recommendations');
  }
};

// ======================
// BROKER APIs - REAL WORKING
// ======================
export const brokerAPI = {
  // Connect a broker
  connectBroker: async (brokerData) => {
    return await apiRequest('/api/brokers/connect', 'POST', brokerData);
  },

  // Get all connected brokers
  getBrokers: async () => {
    try {
      const result = await apiRequest('/api/brokers');
      if (result && result.success) {
        return result;
      }
      return { success: true, brokers: [], connected: 0 };
    } catch {
      return { success: true, brokers: [], connected: 0 };
    }
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
  }
};

// ======================
// TRADE MANAGEMENT APIs
// ======================
export const tradeAPI = {
  // Get all trades
  getTrades: async () => {
    try {
      const result = await apiRequest('/api/trades');
      return result;
    } catch {
      return { success: true, trades: [] };
    }
  },

  // Get active trades
  getActiveTrades: async () => {
    try {
      const result = await apiRequest('/api/trades/active');
      return result;
    } catch {
      return { success: true, trades: [] };
    }
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
  }
};

// ======================
// PORTFOLIO APIs - REAL DATA ONLY
// ======================
export const portfolioAPI = {
  getAnalytics: async () => {
    try {
      const result = await apiRequest('/api/portfolio/analytics');
      
      if (result && result.success) {
        return result;
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
    } catch (error) {
      console.log('Portfolio API not available:', error);
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
    }
  },

  getPerformance: async (period = 'monthly') => {
    try {
      const result = await apiRequest(`/api/portfolio/performance?period=${period}`);
      return result;
    } catch {
      return {
        success: true,
        performance: {
          monthlyReturn: 0,
          quarterlyReturn: 0,
          yearlyReturn: 0
        }
      };
    }
  }
};

// ======================
// SETTINGS APIs
// ======================
const defaultSettings = {
  notifications: {
    emailAlerts: false,
    smsAlerts: false,
    pushNotifications: false,
    whatsappAlerts: false,
    tradeExecuted: false,
    stopLossHit: false,
    targetAchieved: false,
    marketCloseAlerts: false,
    priceAlerts: false,
    newsAlerts: false
  },
  trading: {
    autoTradeExecution: false,
    maxPositions: 0,
    maxRiskPerTrade: 0,
    maxDailyLoss: 0,
    defaultQuantity: 0,
    allowShortSelling: false,
    slippageTolerance: 0,
    enableHedgeMode: false,
    requireConfirmation: false,
    partialExit: false,
    trailSLAfterProfit: false
  },
  risk: {
    stopLossType: 'percentage',
    stopLossValue: 0,
    trailingStopLoss: false,
    trailingStopDistance: 0,
    takeProfitType: 'percentage',
    takeProfitValue: 0,
    riskRewardRatio: 0,
    maxPortfolioRisk: 0,
    volatilityAdjustment: false,
    maxDrawdown: 0
  },
  display: {
    theme: 'dark',
    defaultView: 'dashboard',
    refreshInterval: 0,
    showAdvancedCharts: false,
    compactMode: false,
    language: 'en',
    showIndicators: false,
    darkModeIntensity: 'medium',
    chartType: 'candlestick',
    gridLines: false
  },
  privacy: {
    publicProfile: false,
    showPortfolioValue: false,
    shareTradingHistory: false,
    dataSharing: 'none',
    twoFactorAuth: false,
    sessionTimeout: 0,
    showRealName: false,
    hideBalance: false,
    autoLogout: false
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
    syncInterval: 0
  }
};

export const settingsAPI = {
  getSettings: async () => {
    try {
      const result = await apiRequest('/api/settings');
      if (result && result.success) {
        return result;
      }
      return {
        success: true,
        settings: defaultSettings
      };
    } catch (error) {
      console.log('Settings API not available:', error);
      return {
        success: true,
        settings: defaultSettings
      };
    }
  },

  saveSettings: async (settings) => {
    return await apiRequest('/api/settings', 'POST', settings);
  },

  resetSettings: async () => {
    return await apiRequest('/api/settings/reset', 'POST');
  }
};

// ======================
// SUBSCRIPTION APIs
// ======================
export const subscriptionAPI = {
  check: async () => {
    try {
      const result = await apiRequest('/api/subscription/status');
      return result;
    } catch {
      return {
        success: true,
        plan: 'free_trial',
        trialDaysLeft: 7,
        active: true
      };
    }
  },

  getPlans: async () => {
    try {
      const result = await apiRequest('/api/subscription/plans');
      return result;
    } catch {
      return {
        success: true,
        plans: [
          { id: 'free_trial', name: '7-Day Free Trial', price: 0, features: ['Basic AI signals', '1 broker connection', 'Limited alerts'] },
          { id: 'monthly', name: 'Monthly Plan', price: 999, features: ['Full AI signals', 'Unlimited brokers', 'All alerts', 'Priority support'] },
          { id: 'yearly', name: 'Yearly Plan', price: 9999, features: ['Full AI signals', 'Unlimited brokers', 'All alerts', 'Priority support', '1 month free'] }
        ]
      };
    }
  },

  upgrade: async (planId) => {
    return await apiRequest('/api/subscription/upgrade', 'POST', { plan: planId });
  }
};

// ======================
// LANGUAGE MANAGEMENT
// ======================
export const languageAPI = {
  setLanguage: (lang) => {
    localStorage.setItem('velox_language', lang);
    window.location.reload();
  },

  getLanguage: () => {
    return localStorage.getItem('velox_language') || 'en';
  },

  getTranslations: async (lang = 'en') => {
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
        quantity: 'Quantity'
      },
      hi: {
        dashboard: 'डैशबोर्ड',
        portfolioValue: 'पोर्टफोलियो वैल्यू',
        dailyPnL: 'दैनिक P&L',
        winRate: 'विन रेट',
        activeTrades: 'एक्टिव ट्रेड्स',
        marketOpen: 'बाज़ार खुला',
        marketClosed: 'बाज़ार बंद',
        refresh: 'रिफ्रेश',
        holdings: 'होल्डिंग्स',
        today: 'आज',
        recommendations: 'AI सिफ़ारिशें',
        stock: 'स्टॉक',
        price: 'प्राइस',
        change: 'बदलाव',
        signal: 'सिग्नल',
        confidence: 'आत्मविश्वास',
        action: 'एक्शन',
        buy: 'खरीदें',
        sell: 'बेचें',
        entry: 'एंट्री',
        exit: 'एग्ज़िट',
        stoploss: 'स्टॉप लॉस',
        target: 'टारगेट',
        quantity: 'क्वांटिटी'
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
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${API_BASE_URL.replace(/^https?:\/\//, '').replace(/^http?:\/\//, '')}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      const token = getToken();
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected - reconnecting in 5s');
      setTimeout(() => setupWebSocket(onMessage), 5000);
    };

    return () => ws.close();
  } catch (error) {
    console.error('WebSocket setup failed:', error);
    return () => {};
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
  language: languageAPI,
  settings: settingsAPI,
  setupWebSocket,
  safeToFixed,
  
  // Check backend status
  checkBackendStatus: async () => {
    try {
      const response = await apiRequest('/api/health', 'GET', null, false);
      return response && response.success;
    } catch {
      return false;
    }
  },

  // Format currency
  formatCurrency: (amount) => {
    if (amount === undefined || amount === null || amount === '') {
      return '₹0';
    }
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return '₹0';
      
      return `₹${num.toLocaleString('en-IN', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    } catch (error) {
      return '₹0';
    }
  },

  // Get API base URL
  getApiBaseUrl: () => API_BASE_URL
};
