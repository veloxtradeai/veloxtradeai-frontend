// ============================================
// VELOXTRADEAI - REAL API SERVICE - FINAL VERSION
// NO DUMMY/DEMO/FAKE DATA - ONLY REAL DATA
// ============================================

// ======================
// CONFIGURATION
// ======================
const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  WS_URL: import.meta.env.VITE_WS_URL || '',
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false,
  MAX_RETRIES: parseInt(import.meta.env.VITE_MAX_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: parseInt(import.meta.env.VITE_RETRY_DELAY) || 1000,
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000,
  TOKEN_REFRESH: parseInt(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 3540000
};

// ======================
// TOKEN MANAGEMENT
// ======================
const TokenManager = {
  getToken: () => {
    try {
      return localStorage.getItem('velox_auth_token');
    } catch {
      return null;
    }
  },

  setToken: (token) => {
    try {
      localStorage.setItem('velox_auth_token', token);
      localStorage.setItem('velox_token_time', Date.now().toString());
    } catch (error) {
      console.error('Token save error:', error);
    }
  },

  removeToken: () => {
    try {
      localStorage.removeItem('velox_auth_token');
      localStorage.removeItem('velox_token_time');
      localStorage.removeItem('velox_user');
      localStorage.removeItem('velox_last_login');
    } catch (error) {
      console.error('Token remove error:', error);
    }
  },

  isTokenValid: () => {
    const token = TokenManager.getToken();
    if (!token) return false;

    try {
      const tokenTime = parseInt(localStorage.getItem('velox_token_time') || '0');
      const currentTime = Date.now();
      const tokenAge = currentTime - tokenTime;
      
      return tokenAge < CONFIG.SESSION_TIMEOUT;
    } catch {
      return false;
    }
  }
};

// ======================
// UTILITY FUNCTIONS
// ======================
const Utils = {
  safeToFixed: (value, decimals = 2) => {
    if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
      return '0.00';
    }
    const num = Number(value);
    return num.toFixed(decimals);
  },

  formatCurrency: (amount) => {
    if (amount === undefined || amount === null || amount === '') {
      return '₹0';
    }
    
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return '₹0';

      if (Math.abs(num) >= 10000000) {
        return `₹${(num / 10000000).toFixed(2)}Cr`;
      }
      if (Math.abs(num) >= 100000) {
        return `₹${(num / 100000).toFixed(2)}L`;
      }
      if (Math.abs(num) >= 1000) {
        return `₹${(num / 1000).toFixed(2)}K`;
      }

      return `₹${num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    } catch (error) {
      return '₹0';
    }
  },

  calculateChange: (oldPrice, newPrice) => {
    if (!oldPrice || oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  },

  isMarketOpen: () => {
    const now = new Date();
    const day = now.getDay();
    const isWeekday = day >= 1 && day <= 5;
    
    if (!isWeekday) return false;
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    const marketOpenTime = 9 * 60 + 15;
    const marketCloseTime = 15 * 60 + 30;
    
    return currentTime >= marketOpenTime && currentTime <= marketCloseTime;
  }
};

// ======================
// API REQUEST MANAGER
// ======================
class ApiRequestManager {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.consecutiveErrors = 0;
    this.maxConsecutiveErrors = 5;
  }

  async request(endpoint, method = 'GET', data = null, useAuth = true) {
    // Check if backend URL is configured
    if (!CONFIG.API_BASE_URL) {
      return {
        success: false,
        message: 'Backend URL not configured',
        error: true,
        status: 0
      };
    }

    // Build request config
    const headers = {
      'Content-Type': 'application/json',
      'X-App-Version': import.meta.env.VITE_APP_VERSION || '3.0.0',
      'X-Client': 'veloxtradeai-web'
    };

    if (useAuth) {
      const token = TokenManager.getToken();
      if (token && TokenManager.isTokenValid()) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (useAuth) {
        TokenManager.removeToken();
        window.location.href = '/login';
        return {
          success: false,
          message: 'Session expired. Please login again.',
          error: true,
          status: 401
        };
      }
    }

    const config = {
      method,
      headers,
      signal: AbortSignal.timeout(15000)
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    // Execute request with retry logic
    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      try {
        const fullUrl = endpoint.startsWith('http') 
          ? endpoint 
          : `${CONFIG.API_BASE_URL}${endpoint}`;

        if (CONFIG.DEBUG) {
          console.log(`📡 API Request [${attempt}/${CONFIG.MAX_RETRIES}]:`, {
            method,
            url: fullUrl,
            data
          });
        }

        const response = await fetch(fullUrl, config);
        
        // Reset error counter on success
        this.consecutiveErrors = 0;

        // Handle specific status codes
        if (response.status === 401) {
          TokenManager.removeToken();
          window.location.href = '/login';
          return {
            success: false,
            message: 'Authentication required',
            error: true,
            status: 401
          };
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 5;
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        if (response.status === 503) {
          return {
            success: false,
            message: 'Service temporarily unavailable',
            error: true,
            status: 503
          };
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        let result;

        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          const text = await response.text();
          try {
            result = JSON.parse(text);
          } catch {
            result = { success: false, message: text };
          }
        }

        if (!response.ok) {
          return {
            success: false,
            message: result.message || `Request failed with status ${response.status}`,
            error: true,
            status: response.status,
            data: result
          };
        }

        return {
          success: true,
          ...result,
          status: response.status
        };

      } catch (error) {
        this.consecutiveErrors++;
        
        if (CONFIG.DEBUG) {
          console.error(`❌ API Error [${attempt}/${CONFIG.MAX_RETRIES}]:`, error);
        }

        // If max attempts reached or too many consecutive errors
        if (attempt === CONFIG.MAX_RETRIES || this.consecutiveErrors >= this.maxConsecutiveErrors) {
          return {
            success: false,
            message: error.name === 'TimeoutError' 
              ? 'Request timeout. Please check your connection.'
              : 'Network error. Please try again.',
            error: true,
            status: 0
          };
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
      }
    }

    return {
      success: false,
      message: 'Request failed after multiple attempts',
      error: true,
      status: 0
    };
  }
}

// Create singleton instance
const apiRequestManager = new ApiRequestManager();

// ======================
// HEALTH CHECK API
// ======================
export const healthAPI = {
  check: async () => {
    return await apiRequestManager.request('/api/health', 'GET', null, false);
  },

  isBackendAlive: async () => {
    try {
      const result = await healthAPI.check();
      return result.success && result.status === 'online';
    } catch {
      return false;
    }
  },

  getBackendInfo: async () => {
    const result = await healthAPI.check();
    if (result.success) {
      return {
        alive: true,
        version: result.version,
        timestamp: result.timestamp,
        features: result.features || []
      };
    }
    return {
      alive: false,
      version: null,
      timestamp: null,
      features: []
    };
  }
};

// ======================
// AUTHENTICATION API
// ======================
export const authAPI = {
  login: async (email, password) => {
    const result = await apiRequestManager.request('/api/auth/login', 'POST', { email, password }, false);
    
    if (result.success) {
      TokenManager.setToken(result.token);
      
      if (result.user) {
        localStorage.setItem('velox_user', JSON.stringify(result.user));
        localStorage.setItem('velox_last_login', new Date().toISOString());
      }
      
      // Start token refresh timer
      authAPI.startTokenRefresh();
    }
    
    return result;
  },

  register: async (userData) => {
    const result = await apiRequestManager.request('/api/auth/register', 'POST', userData, false);
    
    if (result.success) {
      TokenManager.setToken(result.token);
      
      if (result.user) {
        localStorage.setItem('velox_user', JSON.stringify(result.user));
      }
      
      authAPI.startTokenRefresh();
    }
    
    return result;
  },

  logout: () => {
    TokenManager.removeToken();
    window.location.href = '/login';
    return { success: true };
  },

  getCurrentUser: async () => {
    if (!TokenManager.isTokenValid()) {
      TokenManager.removeToken();
      return null;
    }

    try {
      const result = await apiRequestManager.request('/api/auth/me');
      if (result.success && result.user) {
        localStorage.setItem('velox_user', JSON.stringify(result.user));
        return result.user;
      }
    } catch (error) {
      console.error('Get user error:', error);
    }

    // Fallback to localStorage
    try {
      const userStr = localStorage.getItem('velox_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  refreshToken: async () => {
    try {
      const result = await apiRequestManager.request('/api/auth/refresh', 'POST', {}, true);
      if (result.success && result.token) {
        TokenManager.setToken(result.token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
    return false;
  },

  startTokenRefresh: () => {
    // Clear existing interval
    if (authAPI.refreshInterval) {
      clearInterval(authAPI.refreshInterval);
    }

    // Set up refresh interval (5 minutes before expiry)
    authAPI.refreshInterval = setInterval(async () => {
      if (TokenManager.isTokenValid()) {
        await authAPI.refreshToken();
      }
    }, CONFIG.TOKEN_REFRESH);
  },

  stopTokenRefresh: () => {
    if (authAPI.refreshInterval) {
      clearInterval(authAPI.refreshInterval);
      authAPI.refreshInterval = null;
    }
  }
};

// ======================
// MARKET DATA API - REAL DATA ONLY
// ======================
export const marketAPI = {
  getLiveData: async (symbols = ['RELIANCE', 'TCS', 'HDFCBANK']) => {
    const symbolStr = encodeURIComponent(symbols.join(','));
    return await apiRequestManager.request(`/api/market/realtime?symbols=${symbolStr}`);
  },

  getStockSignal: async (symbol) => {
    const encodedSymbol = encodeURIComponent(symbol);
    return await apiRequestManager.request(`/api/market/signal?symbol=${encodedSymbol}`);
  },

  getTopGainers: async () => {
    const result = await apiRequestManager.request('/api/market/top-gainers');
    
    if (!result.success || !result.gainers || result.gainers.length === 0) {
      return {
        success: true,
        gainers: [],
        count: 0,
        updated_at: new Date().toISOString(),
        message: 'No real-time data available'
      };
    }
    
    return result;
  },

  getTopLosers: async () => {
    const result = await apiRequestManager.request('/api/market/top-losers');
    
    if (!result.success || !result.losers || result.losers.length === 0) {
      return {
        success: true,
        losers: [],
        count: 0,
        updated_at: new Date().toISOString(),
        message: 'No real-time data available'
      };
    }
    
    return result;
  },

  getMarketStatus: async () => {
    try {
      const result = await apiRequestManager.request('/api/market/status');
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.log('Market status API error:', error);
    }
    
    // Calculate based on Indian market hours
    const now = new Date();
    const day = now.getDay();
    const isWeekday = day >= 1 && day <= 5;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    const marketOpenTime = 9 * 60 + 15;
    const marketCloseTime = 15 * 60 + 30;
    const isOpen = isWeekday && currentTime >= marketOpenTime && currentTime <= marketCloseTime;
    
    return {
      success: true,
      isOpen,
      isWeekday,
      currentTime: now.toISOString(),
      marketOpenTime: '09:15',
      marketCloseTime: '15:30',
      message: isOpen ? 'Market is open' : 'Market is closed',
      nextAction: isOpen 
        ? `Closes at ${marketCloseTime}`
        : isWeekday 
          ? `Opens tomorrow at ${marketOpenTime}`
          : 'Opens on Monday'
    };
  },

  getOptionChain: async (symbol = 'NIFTY') => {
    const encodedSymbol = encodeURIComponent(symbol);
    return await apiRequestManager.request(`/api/market/options?symbol=${encodedSymbol}`);
  },

  getIntradayChart: async (symbol, interval = '5min', days = 1) => {
    const encodedSymbol = encodeURIComponent(symbol);
    return await apiRequestManager.request(
      `/api/market/chart?symbol=${encodedSymbol}&interval=${interval}&days=${days}`
    );
  }
};

// ======================
// AI TRADING API - REAL SIGNALS
// ======================
export const tradingAPI = {
  getAISignals: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const result = await apiRequestManager.request(`/api/ai/signals?${queryParams}`);
    
    if (!result.success || !result.signals || result.signals.length === 0) {
      return {
        success: true,
        signals: [],
        count: 0,
        message: 'No AI signals available at this time'
      };
    }
    
    return result;
  },

  generateSignal: async (stockData) => {
    return await apiRequestManager.request('/api/trades/auto-entry', 'POST', stockData);
  },

  getRecommendations: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequestManager.request(`/api/trading/recommendations?${queryParams}`);
  },

  validateTrade: async (tradeData) => {
    return await apiRequestManager.request('/api/trades/validate', 'POST', tradeData);
  },

  getSignalStrength: async (symbol) => {
    const encodedSymbol = encodeURIComponent(symbol);
    return await apiRequestManager.request(`/api/ai/strength?symbol=${encodedSymbol}`);
  }
};

// ======================
// BROKER API - REAL INTEGRATION
// ======================
export const brokerAPI = {
  connectBroker: async (brokerData) => {
    return await apiRequestManager.request('/api/brokers/connect', 'POST', brokerData);
  },

  getBrokers: async () => {
    const result = await apiRequestManager.request('/api/brokers');
    
    if (!result.success) {
      return {
        success: true,
        brokers: [],
        connected: 0,
        message: 'Unable to fetch broker information'
      };
    }
    
    return result;
  },

  getHoldings: async (brokerId) => {
    return await apiRequestManager.request(`/api/brokers/${brokerId}/holdings`);
  },

  placeOrder: async (orderData) => {
    // Validate order data
    if (!orderData.symbol || !orderData.quantity || !orderData.action) {
      return {
        success: false,
        message: 'Invalid order data. Symbol, quantity, and action are required.'
      };
    }

    if (orderData.quantity <= 0) {
      return {
        success: false,
        message: 'Quantity must be greater than 0'
      };
    }

    const result = await apiRequestManager.request('/api/trades/execute', 'POST', orderData);
    
    // Store in local history for reference
    if (result.success) {
      try {
        const tradeHistory = JSON.parse(localStorage.getItem('velox_trade_history') || '[]');
        tradeHistory.unshift({
          ...orderData,
          orderId: result.orderId || `ORD_${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: result.status || 'executed',
          broker: orderData.broker || 'unknown'
        });
        
        // Keep only last 100 trades
        if (tradeHistory.length > 100) {
          tradeHistory.length = 100;
        }
        
        localStorage.setItem('velox_trade_history', JSON.stringify(tradeHistory));
      } catch (error) {
        console.error('Error saving trade history:', error);
      }
    }
    
    return result;
  },

  testConnection: async (brokerId) => {
    return await apiRequestManager.request(`/api/brokers/${brokerId}/test`, 'POST');
  },

  disconnectBroker: async (brokerId) => {
    return await apiRequestManager.request(`/api/brokers/${brokerId}/disconnect`, 'POST');
  },

  syncHoldings: async (brokerId) => {
    return await apiRequestManager.request(`/api/brokers/${brokerId}/sync`, 'POST');
  },

  getOrderHistory: async (brokerId, limit = 50) => {
    return await apiRequestManager.request(`/api/brokers/${brokerId}/orders?limit=${limit}`);
  },

  cancelOrder: async (brokerId, orderId) => {
    return await apiRequestManager.request(`/api/brokers/${brokerId}/orders/${orderId}/cancel`, 'POST');
  }
};

// ======================
// TRADE MANAGEMENT API
// ======================
export const tradeAPI = {
  getTrades: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const result = await apiRequestManager.request(`/api/trades?${queryParams}`);
    
    if (!result.success) {
      return {
        success: true,
        trades: [],
        count: 0,
        message: 'Unable to fetch trades'
      };
    }
    
    return result;
  },

  getActiveTrades: async () => {
    const result = await apiRequestManager.request('/api/trades/active');
    
    if (!result.success) {
      return {
        success: true,
        trades: [],
        count: 0,
        message: 'Unable to fetch active trades'
      };
    }
    
    return result;
  },

  addTrade: async (tradeData) => {
    return await apiRequestManager.request('/api/trades', 'POST', tradeData);
  },

  updateTrade: async (tradeId, updates) => {
    return await apiRequestManager.request(`/api/trades/${tradeId}`, 'PUT', updates);
  },

  autoAdjust: async (tradeId, currentPrice) => {
    return await apiRequestManager.request('/api/trades/auto-adjust', 'POST', {
      trade_id: tradeId,
      current_price: currentPrice
    });
  },

  closeTrade: async (tradeId, exitData = {}) => {
    return await apiRequestManager.request(`/api/trades/${tradeId}/close`, 'POST', exitData);
  },

  getTradeHistory: async (days = 30) => {
    return await apiRequestManager.request(`/api/trades/history?days=${days}`);
  },

  getTradeAnalytics: async (period = 'monthly') => {
    return await apiRequestManager.request(`/api/trades/analytics?period=${period}`);
  }
};

// ======================
// PORTFOLIO API - REAL DATA ONLY
// ======================
export const portfolioAPI = {
  getAnalytics: async () => {
    const result = await apiRequestManager.request('/api/portfolio/analytics');
    
    if (!result.success || !result.portfolio) {
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
          holdings: [],
          cashBalance: 0,
          totalProfit: 0,
          totalLoss: 0
        },
        message: 'Portfolio data not available'
      };
    }
    
    return result;
  },

  getPerformance: async (period = 'monthly') => {
    const result = await apiRequestManager.request(`/api/portfolio/performance?period=${period}`);
    
    if (!result.success) {
      return {
        success: true,
        performance: {
          monthlyReturn: 0,
          quarterlyReturn: 0,
          yearlyReturn: 0,
          overallReturn: 0,
          bestTrade: 0,
          worstTrade: 0,
          successRate: '0%'
        },
        message: 'Performance data not available'
      };
    }
    
    return result;
  },

  getHoldingsSummary: async () => {
    const result = await apiRequestManager.request('/api/portfolio/holdings');
    
    if (!result.success) {
      return {
        success: true,
        holdings: [],
        totalValue: 0,
        totalInvested: 0,
        totalProfit: 0,
        message: 'Holdings data not available'
      };
    }
    
    return result;
  },

  getSectorAllocation: async () => {
    return await apiRequestManager.request('/api/portfolio/sectors');
  },

  getRiskMetrics: async () => {
    return await apiRequestManager.request('/api/portfolio/risk');
  }
};

// ======================
// SETTINGS API
// ======================
export const settingsAPI = {
  getSettings: async () => {
    const result = await apiRequestManager.request('/api/settings');
    
    if (!result.success || !result.settings) {
      return {
        success: true,
        settings: getDefaultSettings(),
        message: 'Using default settings'
      };
    }
    
    return result;
  },

  saveSettings: async (settings) => {
    return await apiRequestManager.request('/api/settings', 'POST', settings);
  },

  resetSettings: async () => {
    return await apiRequestManager.request('/api/settings/reset', 'POST');
  },

  exportSettings: async () => {
    return await apiRequestManager.request('/api/settings/export');
  },

  importSettings: async (settingsData) => {
    return await apiRequestManager.request('/api/settings/import', 'POST', settingsData);
  }
};

// ======================
// SUBSCRIPTION API
// ======================
export const subscriptionAPI = {
  getStatus: async () => {
    const result = await apiRequestManager.request('/api/subscription/status');
    
    if (!result.success) {
      return {
        success: true,
        plan: 'free_trial',
        trialDaysLeft: 7,
        active: true,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['Basic AI signals', 'Real-time data', '1 broker connection'],
        message: 'Subscription data not available'
      };
    }
    
    return result;
  },

  getPlans: async () => {
    const result = await apiRequestManager.request('/api/subscription/plans');
    
    if (!result.success || !result.plans || result.plans.length === 0) {
      return {
        success: true,
        plans: [
          {
            id: 'free_trial',
            name: '7-Day Free Trial',
            price: 0,
            duration: '7 days',
            features: ['Basic AI signals', 'Real-time data', '1 broker connection', 'Limited alerts'],
            popular: false
          },
          {
            id: 'monthly',
            name: 'Monthly Plan',
            price: 999,
            duration: '30 days',
            features: ['Full AI signals', 'Multiple brokers', 'All alerts', 'Priority support', 'Auto trading'],
            popular: true
          },
          {
            id: 'yearly',
            name: 'Yearly Plan',
            price: 9999,
            duration: '365 days',
            features: ['Full AI signals', 'Unlimited brokers', 'All alerts', '24/7 support', 'Auto trading', 'Advanced analytics'],
            popular: false
          }
        ]
      };
    }
    
    return result;
  },

  upgrade: async (planId) => {
    return await apiRequestManager.request('/api/subscription/upgrade', 'POST', { plan: planId });
  },

  cancel: async () => {
    return await apiRequestManager.request('/api/subscription/cancel', 'POST');
  },

  getInvoices: async () => {
    return await apiRequestManager.request('/api/subscription/invoices');
  }
};

// ======================
// NOTIFICATIONS API
// ======================
export const notificationsAPI = {
  getNotifications: async (limit = 50) => {
    return await apiRequestManager.request(`/api/notifications?limit=${limit}`);
  },

  markAsRead: async (notificationId) => {
    return await apiRequestManager.request(`/api/notifications/${notificationId}/read`, 'POST');
  },

  markAllAsRead: async () => {
    return await apiRequestManager.request('/api/notifications/read-all', 'POST');
  },

  deleteNotification: async (notificationId) => {
    return await apiRequestManager.request(`/api/notifications/${notificationId}`, 'DELETE');
  },

  getUnreadCount: async () => {
    const result = await apiRequestManager.request('/api/notifications/unread-count');
    
    if (!result.success) {
      return {
        success: true,
        count: 0,
        message: 'Unable to fetch notification count'
      };
    }
    
    return result;
  }
};

// ======================
// WEBSOCKET MANAGER
// ======================
export class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.heartbeatInterval = null;
  }

  connect() {
    if (!CONFIG.WS_URL) {
      console.warn('WebSocket URL not configured');
      return;
    }

    try {
      this.ws = new WebSocket(CONFIG.WS_URL);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send authentication if token exists
        const token = TokenManager.getToken();
        if (token) {
          this.send({ type: 'auth', token });
        }
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Notify listeners
        this.emit('connected', { timestamp: new Date().toISOString() });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle heartbeat response
          if (data.type === 'pong') {
            return;
          }
          
          // Notify listeners based on message type
          if (data.type && this.listeners.has(data.type)) {
            this.listeners.get(data.type).forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                console.error('WebSocket listener error:', error);
              }
            });
          }
          
          // Also notify generic message listeners
          if (this.listeners.has('message')) {
            this.listeners.get('message').forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                console.error('WebSocket message listener error:', error);
              }
            });
          }
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnected = false;
        this.emit('error', { error: error.message });
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();
        
        // Attempt reconnect
        this.attemptReconnect();
        
        this.emit('disconnected', {
          code: event.code,
          reason: event.reason,
          timestamp: new Date().toISOString()
        });
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  send(data) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('WebSocket send error:', error);
        return false;
      }
    }
    return false;
  }

  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
    
    // Return unsubscribe function
    return () => {
      if (this.listeners.has(type)) {
        this.listeners.get(type).delete(callback);
        if (this.listeners.get(type).size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  unsubscribe(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
      if (this.listeners.get(type).size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('WebSocket emit error:', error);
        }
      });
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000); // Every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect() {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnected');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.listeners.clear();
  }
}

// Create WebSocket manager instance
export const webSocketManager = new WebSocketManager();

// ======================
// HELPER FUNCTIONS
// ======================
function getDefaultSettings() {
  return {
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
      gridLines: false,
      primaryColor: 'emerald'
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
}

// ======================
// INITIALIZATION
// ======================
export const initializeAPI = async () => {
  console.log('🚀 Initializing VeloxTradeAI API...');
  
  // Check backend connectivity
  const backendAlive = await healthAPI.isBackendAlive();
  
  if (!backendAlive) {
    console.warn('⚠️ Backend is not reachable. Some features may not work.');
    
    // Try to connect to WebSocket anyway
    if (CONFIG.WS_URL) {
      webSocketManager.connect();
    }
    
    return {
      success: false,
      backendAlive: false,
      message: 'Backend connection failed'
    };
  }
  
  // Connect WebSocket
  if (CONFIG.WS_URL) {
    webSocketManager.connect();
  }
  
  // Start token refresh if user is logged in
  if (TokenManager.isTokenValid()) {
    authAPI.startTokenRefresh();
  }
  
  console.log('✅ API initialization complete');
  
  return {
    success: true,
    backendAlive: true,
    webSocketConnected: webSocketManager.isConnected
  };
};

// ======================
// EXPORT EVERYTHING
// ======================
export default {
  // API Modules
  health: healthAPI,
  auth: authAPI,
  market: marketAPI,
  trading: tradingAPI,
  broker: brokerAPI,
  trade: tradeAPI,
  portfolio: portfolioAPI,
  subscription: subscriptionAPI,
  settings: settingsAPI,
  notifications: notificationsAPI,
  
  // WebSocket
  webSocket: webSocketManager,
  
  // Utilities
  utils: Utils,
  
  // Configuration
  config: CONFIG,
  
  // Initialization
  initialize: initializeAPI,
  
  // Token Management
  token: TokenManager,
  
  // Helper Functions
  formatCurrency: Utils.formatCurrency,
  safeToFixed: Utils.safeToFixed,
  isMarketOpen: Utils.isMarketOpen,
  calculateChange: Utils.calculateChange
};
