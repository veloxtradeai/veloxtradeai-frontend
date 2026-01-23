// ============================================
// VELOXTRADEAI - REAL API SERVICE
// NO MOCK DATA - ONLY REAL BACKEND
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      return { success: false, message: 'Session expired' };
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
    console.error('API Error:', error);
    return {
      success: false,
      message: 'Backend connection failed',
      data: null,
      error: error.message
    };
  }
};

// ======================
// AUTHENTICATION APIs
// ======================
export const authAPI = {
  register: async (userData) => {
    const result = await apiRequest('/api/auth/register', 'POST', userData, false);
    if (result && result.success) {
      setToken(result.token);
    }
    return result;
  },
  
  login: async (email, password) => {
    const result = await apiRequest('/api/auth/login', 'POST', { email, password }, false);
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
      return result.user;
    }
    return null;
  }
};

// ======================
// MARKET DATA APIs
// ======================
export const marketAPI = {
  getLiveData: async (symbols = 'RELIANCE,TCS,HDFCBANK,INFY,ICICIBANK') => {
    return await apiRequest(`/api/market/live?symbols=${symbols}`);
  },

  getStockData: async (symbol) => {
    return await apiRequest(`/api/market/stock?symbol=${symbol}`);
  },
};

// ======================
// AI TRADING APIs
// ======================
export const tradingAPI = {
  getAIScreener: async (filters = {}) => {
    return await apiRequest('/api/ai/screener', 'POST', { filters });
  },

  getSignals: async () => {
    return await apiRequest('/api/ai/signal');
  },

  calculateLevels: async (symbol) => {
    return await apiRequest('/api/ai/levels', 'POST', { symbol });
  },

  generateSignal: async (stockData) => {
    return await apiRequest('/api/ai/generate-signal', 'POST', stockData);
  },
};

// ======================
// BROKER APIs
// ======================
export const brokerAPI = {
  connectBroker: async (brokerData) => {
    return await apiRequest('/api/broker/connect', 'POST', brokerData);
  },

  getBrokers: async () => {
    const token = getToken();
    if (!token) return { success: false, brokers: [] };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/broker/data?user_id=${payload.user_id || payload.id}`);
    } catch {
      return await apiRequest('/api/broker/data');
    }
  },

  placeOrder: async (orderData) => {
    return await apiRequest('/api/broker/place-order', 'POST', orderData);
  },

  testConnection: async (brokerId) => {
    return await apiRequest(`/api/broker/test/${brokerId}`);
  },
};

// ======================
// TRADE MANAGEMENT APIs
// ======================
export const tradeAPI = {
  getTrades: async () => {
    const token = getToken();
    if (!token) return { success: false, trades: [] };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/trades?user_id=${payload.user_id || payload.id}`);
    } catch {
      return await apiRequest('/api/trades');
    }
  },

  addTrade: async (tradeData) => {
    return await apiRequest('/api/trades', 'POST', tradeData);
  },

  updateTrade: async (tradeId, updates) => {
    return await apiRequest(`/api/trades/${tradeId}`, 'PUT', updates);
  },

  autoAdjust: async (tradeId, currentPrice) => {
    return await apiRequest('/api/trades/auto-adjust', 'POST', { 
      trade_id: tradeId, 
      current_price: currentPrice 
    });
  },

  closeTrade: async (tradeId) => {
    return await apiRequest(`/api/trades/${tradeId}/close`, 'POST');
  },
};

// ======================
// PORTFOLIO APIs
// ======================
export const portfolioAPI = {
  getAnalytics: async () => {
    const token = getToken();
    if (!token) return { success: false, portfolio: null };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/analytics/portfolio?user_id=${payload.user_id || payload.id}`);
    } catch {
      return await apiRequest('/api/analytics/portfolio');
    }
  },

  getPerformance: async (period = 'monthly') => {
    const token = getToken();
    if (!token) return { success: false, performance: null };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/analytics/performance?user_id=${payload.user_id || payload.id}&period=${period}`);
    } catch {
      return await apiRequest(`/api/analytics/performance?period=${period}`);
    }
  },

  getRiskMetrics: async () => {
    return await apiRequest('/api/analytics/risk-metrics');
  },
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
        marketClosed: 'Market Closed'
      },
      hi: {
        dashboard: 'डैशबोर्ड',
        portfolioValue: 'पोर्टफोलियो वैल्यू',
        dailyPnL: 'दैनिक P&L',
        winRate: 'विन रेट',
        activeTrades: 'एक्टिव ट्रेड्स',
        marketOpen: 'बाज़ार खुला',
        marketClosed: 'बाज़ार बंद'
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
    const wsUrl = `${wsProtocol}//${API_BASE_URL.replace(/^https?:\/\//, '')}/ws`;
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
  auth: authAPI,
  market: marketAPI,
  trading: tradingAPI,
  broker: brokerAPI,
  trade: tradeAPI,
  portfolio: portfolioAPI,
  language: languageAPI,
  setupWebSocket,
  safeToFixed,
  
  checkBackendStatus: async () => {
    try {
      const response = await fetch(API_BASE_URL + '/health');
      return response.ok;
    } catch {
      return false;
    }
  }
};
