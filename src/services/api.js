// ============================================
// VELOXTRADEAI - REAL API SERVICE - COMPLETE
// ============================================

// ✅ FIXED: Use proper environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://veloxtradeai-backend.yourdomain.com';

// Token management
const getToken = () => localStorage.getItem('velox_auth_token');
const setToken = (token) => localStorage.setItem('velox_auth_token', token);
const removeToken = () => localStorage.removeItem('velox_auth_token');

// Safe number formatting
const safeToFixed = (value, decimals = 2) => {
  if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
    return '0.00';
  }
  return Number(value).toFixed(decimals);
};

// ✅ FIXED: Improved API Request helper with better error handling
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
    
    // Check if endpoint starts with http
    const fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`;
    
    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    config.signal = controller.signal;
    
    const response = await fetch(fullUrl, config);
    clearTimeout(timeoutId);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      return { success: false, message: 'Session expired. Please login again.' };
    }

    // Handle 400, 404 errors gracefully
    if (response.status === 400 || response.status === 404) {
      return { 
        success: false, 
        message: 'API endpoint not available',
        error: true,
        status: response.status
      };
    }

    // Handle 500 errors
    if (response.status >= 500) {
      return {
        success: false,
        message: 'Backend server error',
        error: true,
        status: response.status
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
      return {
        success: false,
        message: result.message || `API error: ${response.status}`,
        status: response.status
      };
    }

    return result;
  } catch (error) {
    console.error('❌ API Error:', error);
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timeout. Please check your internet connection.',
        error: error.message
      };
    }
    return {
      success: false,
      message: 'Backend connection failed. Please try again later.',
      data: null,
      error: error.message
    };
  }
};

// ======================
// BACKEND HEALTH CHECK
// ======================
export const healthAPI = {
  check: async () => {
    return await apiRequest('/api/health', 'GET', null, false);
  },
  
  // Check if backend is reachable
  isBackendAlive: async () => {
    try {
      const response = await apiRequest('/api/health', 'GET', null, false);
      return response && response.status === 'online';
    } catch {
      return false;
    }
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
      // Store user data
      if (result.user) {
        localStorage.setItem('velox_user', JSON.stringify(result.user));
      }
    }
    return result;
  },
  
  register: async (userData) => {
    const result = await apiRequest('/api/auth/register', 'POST', userData, false);
    if (result && result.success) {
      setToken(result.token);
      if (result.user) {
        localStorage.setItem('velox_user', JSON.stringify(result.user));
      }
    }
    return result;
  },

  logout: () => {
    removeToken();
    localStorage.removeItem('velox_user');
    window.location.href = '/login';
    return { success: true };
  },

  getCurrentUser: async () => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const result = await apiRequest('/api/auth/me');
      if (result && result.success) {
        return result.user;
      }
    } catch (error) {
      console.log('Error fetching user:', error);
    }
    
    // Fallback to localStorage
    const userStr = localStorage.getItem('velox_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// ======================
// REAL MARKET DATA APIs (NO DUMMY DATA)
// ======================
export const marketAPI = {
  // Get live market data for multiple symbols
  getLiveData: async (symbols = ['RELIANCE', 'TCS', 'HDFCBANK']) => {
    const symbolStr = symbols.join(',');
    return await apiRequest(`/api/market/realtime?symbols=${symbolStr}`);
  },

  // Get AI signal for a specific stock
  getStockSignal: async (symbol) => {
    return await apiRequest(`/api/market/signal?symbol=${symbol}`);
  },

  // Get top gainers - REAL DATA ONLY
  getTopGainers: async () => {
    const result = await apiRequest('/api/market/top-gainers');
    if (result.success && result.gainers) {
      return result;
    }
    // Return empty array if no real data
    return {
      success: true,
      gainers: [],
      updated_at: new Date().toISOString(),
      message: 'No real-time data available'
    };
  },

  // Get top losers - REAL DATA ONLY
  getTopLosers: async () => {
    const result = await apiRequest('/api/market/top-losers');
    if (result.success && result.losers) {
      return result;
    }
    return {
      success: true,
      losers: [],
      updated_at: new Date().toISOString(),
      message: 'No real-time data available'
    };
  },

  // Get market status
  getMarketStatus: async () => {
    try {
      const response = await apiRequest('/api/market/status');
      if (response.success) {
        return response;
      }
    } catch (error) {
      console.log('Market status API error:', error);
    }
    
    // Calculate based on time (Indian market hours: 9:15 AM to 3:30 PM)
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    const marketOpenTime = 9 * 60 + 15; // 9:15 AM
    const marketCloseTime = 15 * 60 + 30; // 3:30 PM
    
    return {
      success: true,
      isOpen: currentTime >= marketOpenTime && currentTime <= marketCloseTime,
      message: currentTime >= marketOpenTime && currentTime <= marketCloseTime 
        ? 'Market is open' 
        : 'Market is closed',
      nextOpen: marketOpenTime > currentTime ? `${marketOpenTime - currentTime} minutes` : 'Tomorrow',
      currentTime: now.toISOString()
    };
  },

  // Get multiple stocks in one call
  getBatchStockData: async (symbols) => {
    const promises = symbols.map(symbol => 
      apiRequest(`/api/market/realtime?symbol=${symbol}`)
    );
    return await Promise.all(promises);
  }
};

// ======================
// AI TRADING APIs - REAL SIGNALS ONLY
// ======================
export const tradingAPI = {
  // Get AI signals with high confidence (85%+)
  getAISignals: async () => {
    const result = await apiRequest('/api/ai/signals');
    if (result.success && result.signals && result.signals.length > 0) {
      return result;
    }
    return {
      success: true,
      signals: [],
      count: 0,
      message: 'No high confidence signals available at the moment'
    };
  },

  // Generate signal (for auto-entry)
  generateSignal: async (stockData) => {
    return await apiRequest('/api/trades/auto-entry', 'POST', stockData);
  },

  // Get trading recommendations with filters
  getRecommendations: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/api/trading/recommendations?${queryParams}`);
  },

  // Validate trade before execution
  validateTrade: async (tradeData) => {
    return await apiRequest('/api/trades/validate', 'POST', tradeData);
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
    const result = await apiRequest('/api/brokers');
    if (result && result.success) {
      return result;
    }
    // No dummy data - return empty
    return { 
      success: true, 
      brokers: [], 
      connected: 0,
      message: 'No brokers connected'
    };
  },

  // Get broker holdings
  getHoldings: async (brokerId) => {
    return await apiRequest(`/api/brokers/${brokerId}/holdings`);
  },

  // Place an order
  placeOrder: async (orderData) => {
    // Validate order data first
    if (!orderData.symbol || !orderData.quantity || !orderData.action) {
      return {
        success: false,
        message: 'Invalid order data: symbol, quantity and action are required'
      };
    }
    
    const result = await apiRequest('/api/trades/execute', 'POST', orderData);
    
    if (result.success) {
      // Store in local history for reference
      const tradeHistory = JSON.parse(localStorage.getItem('velox_trade_history') || '[]');
      tradeHistory.push({
        ...orderData,
        timestamp: new Date().toISOString(),
        status: 'executed',
        orderId: result.orderId || `ORD_${Date.now()}`
      });
      localStorage.setItem('velox_trade_history', JSON.stringify(tradeHistory.slice(-50))); // Keep last 50
    }
    
    return result;
  },

  // Test broker connection
  testConnection: async (brokerId) => {
    return await apiRequest(`/api/brokers/${brokerId}/test`, 'POST');
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
  getOrderHistory: async (brokerId, limit = 20) => {
    return await apiRequest(`/api/brokers/${brokerId}/orders?limit=${limit}`);
  }
};

// ======================
// TRADE MANAGEMENT APIs - REAL DATA ONLY
// ======================
export const tradeAPI = {
  // Get all trades
  getTrades: async () => {
    const result = await apiRequest('/api/trades');
    if (result.success) {
      return result;
    }
    return { success: true, trades: [] };
  },

  // Get active trades
  getActiveTrades: async () => {
    const result = await apiRequest('/api/trades/active');
    if (result.success) {
      return result;
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

  // Get trade history
  getTradeHistory: async (days = 7) => {
    return await apiRequest(`/api/trades/history?days=${days}`);
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
        },
        message: 'Portfolio data not available'
      };
    } catch (error) {
      console.log('Portfolio API not available:', error);
      return {
        success: false,
        portfolio: null,
        message: 'Failed to fetch portfolio data'
      };
    }
  },

  getPerformance: async (period = 'monthly') => {
    try {
      const result = await apiRequest(`/api/portfolio/performance?period=${period}`);
      return result;
    } catch {
      return {
        success: false,
        performance: null,
        message: 'Performance data not available'
      };
    }
  },

  // Get holdings summary
  getHoldingsSummary: async () => {
    try {
      const result = await apiRequest('/api/portfolio/holdings');
      return result;
    } catch {
      return {
        success: false,
        holdings: [],
        message: 'Holdings data not available'
      };
    }
  }
};

// ======================
// REAL DATA HELPER FUNCTIONS
// ======================

// Format currency
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || amount === '') {
    return '₹0';
  }
  try {
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0';
    
    if (Math.abs(num) >= 10000000) { // 1 crore
      return `₹${(num / 10000000).toFixed(2)}Cr`;
    }
    if (Math.abs(num) >= 100000) { // 1 lakh
      return `₹${(num / 100000).toFixed(2)}L`;
    }
    if (Math.abs(num) >= 1000) { // 1 thousand
      return `₹${(num / 1000).toFixed(2)}K`;
    }
    
    return `₹${num.toLocaleString('en-IN', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  } catch (error) {
    return '₹0';
  }
};

// Calculate percentage change
export const calculateChange = (oldPrice, newPrice) => {
  if (!oldPrice || !newPrice || oldPrice === 0) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

// Check if market is open
export const isMarketOpen = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  const marketOpenTime = 9 * 60 + 15; // 9:15 AM
  const marketCloseTime = 15 * 60 + 30; // 3:30 PM
  
  // Check if weekday (Monday to Friday)
  const day = now.getDay();
  const isWeekday = day >= 1 && day <= 5;
  
  return isWeekday && (currentTime >= marketOpenTime && currentTime <= marketCloseTime);
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
  
  // Utility functions
  safeToFixed,
  formatCurrency,
  calculateChange,
  isMarketOpen,
  
  // Get API base URL
  getApiBaseUrl: () => API_BASE_URL,
  
  // Initialize connection
  initialize: async () => {
    try {
      const isAlive = await healthAPI.isBackendAlive();
      if (!isAlive) {
        console.warn('⚠️ Backend is not reachable. Some features may not work.');
      }
      return isAlive;
    } catch (error) {
      console.error('Initialization error:', error);
      return false;
    }
  }
};
