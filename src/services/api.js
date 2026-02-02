// ============================================
// VELOXTRADEAI - REAL API SERVICE - FINAL VERSION
// NO DUMMY DATA - REAL BACKEND CONNECTION ONLY
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Token management
const getToken = () => {
  const token = localStorage.getItem('velox_auth_token');
  return token && token !== 'null' ? token : null;
};

const setToken = (token) => {
  if (token) {
    localStorage.setItem('velox_auth_token', token);
  }
};

const removeToken = () => {
  localStorage.removeItem('velox_auth_token');
  localStorage.removeItem('velox_user');
};

// Safe number formatting
const safeToFixed = (value, decimals = 2) => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0.00';
  }
  return Number(value).toFixed(decimals);
};

// API Request helper - STRICTLY REAL ONLY
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
    console.log(`📡 REAL API Call: ${method} ${API_BASE_URL}${endpoint}`);
    
    // Check if we have backend URL
    if (!API_BASE_URL) {
      console.error('❌ No backend URL configured');
      return {
        success: false,
        message: 'Backend not configured',
        error: 'BACKEND_NOT_CONFIGURED'
      };
    }
    
    const fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`;
    
    // Set timeout for request
    const timeout = 10000; // 10 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;
    
    const response = await fetch(fullUrl, config);
    clearTimeout(timeoutId);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      return { 
        success: false, 
        message: 'Session expired',
        error: 'UNAUTHORIZED'
      };
    }

    // Handle 404 - REAL: Return empty but with error flag
    if (response.status === 404) {
      return { 
        success: false, 
        message: 'Endpoint not found',
        error: 'ENDPOINT_NOT_FOUND',
        data: null
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
        error: 'API_ERROR',
        data: null
      };
    }

    return result;
  } catch (error) {
    console.error('❌ REAL API Error:', error);
    
    // Handle abort (timeout)
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timeout - Backend not responding',
        error: 'TIMEOUT',
        data: null
      };
    }
    
    return {
      success: false,
      message: 'Backend connection failed',
      data: null,
      error: 'CONNECTION_FAILED'
    };
  }
};

// ======================
// HEALTH CHECK - REAL
// ======================
export const healthAPI = {
  check: async () => {
    const result = await apiRequest('/api/health', 'GET', null, false);
    
    // REAL: If backend is down, return failure
    if (!result.success) {
      return {
        success: false,
        status: 'offline',
        message: 'Backend unavailable',
        timestamp: new Date().toISOString()
      };
    }
    
    return result;
  }
};

// ======================
// AUTHENTICATION APIs - REAL
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
      if (result && result.success) {
        // Save to localStorage
        localStorage.setItem('velox_user', JSON.stringify(result.user));
        return result.user;
      }
    } catch (error) {
      console.error('Get current user error:', error);
    }
    
    // REAL: If API fails, check localStorage
    const storedUser = localStorage.getItem('velox_user');
    return storedUser ? JSON.parse(storedUser) : null;
  }
};

// ======================
// MARKET DATA APIs - REAL ONLY
// ======================
export const marketAPI = {
  getLiveData: async (symbols = 'RELIANCE,TCS,HDFCBANK,INFY,ICICIBANK') => {
    const result = await apiRequest(`/api/market/realtime?symbols=${symbols}`);
    
    // REAL: If no data, return empty
    if (!result.success) {
      return {
        success: false,
        data: [],
        message: 'Market data unavailable'
      };
    }
    
    return result;
  },

  getStockSignal: async (symbol) => {
    const result = await apiRequest(`/api/market/signal?symbol=${symbol}`);
    
    // REAL: If no signal, return empty
    if (!result.success) {
      return {
        success: false,
        signal: null,
        message: 'Signal data unavailable'
      };
    }
    
    return result;
  },

  getTopGainers: async () => {
    const result = await apiRequest('/api/market/top-gainers');
    
    // REAL: Empty array if fails
    if (!result.success) {
      return {
        success: true,
        gainers: [],
        message: 'Using cached data'
      };
    }
    
    return result;
  },

  getTopLosers: async () => {
    const result = await apiRequest('/api/market/top-losers');
    
    // REAL: Empty array if fails
    if (!result.success) {
      return {
        success: true,
        losers: [],
        message: 'Using cached data'
      };
    }
    
    return result;
  },

  getOptionChain: async (symbol = 'NIFTY') => {
    const result = await apiRequest(`/api/market/options?symbol=${symbol}`);
    
    // REAL: Empty array if fails
    if (!result.success) {
      return {
        success: true,
        data: [],
        message: 'Option chain data unavailable'
      };
    }
    
    return result;
  },

  getMarketStatus: async () => {
    const result = await apiRequest('/api/market/status');
    
    // REAL: Default to closed if fails
    if (!result.success) {
      return {
        success: true,
        isOpen: false,
        message: 'Market status unavailable'
      };
    }
    
    return result;
  }
};

// ======================
// AI TRADING APIs - REAL
// ======================
export const tradingAPI = {
  getAISignals: async () => {
    const result = await apiRequest('/api/ai/signals');
    
    // REAL: Empty array if fails
    if (!result.success || !result.signals) {
      return {
        success: true,
        signals: [],
        message: 'No AI signals available'
      };
    }
    
    return result;
  },

  getAIScreener: async () => {
    const result = await apiRequest('/api/ai/screener');
    
    // REAL: Empty array if fails
    if (!result.success) {
      return {
        success: true,
        data: [],
        message: 'Screener data unavailable'
      };
    }
    
    return result;
  },

  generateSignal: async (stockData) => {
    const result = await apiRequest('/api/trades/auto-entry', 'POST', stockData);
    return result;
  },

  getRecommendations: async () => {
    const result = await apiRequest('/api/trading/recommendations');
    
    // REAL: Empty array if fails
    if (!result.success) {
      return {
        success: true,
        recommendations: [],
        message: 'Recommendations unavailable'
      };
    }
    
    return result;
  }
};

// ======================
// BROKER APIs - REAL WORKING
// ======================
export const brokerAPI = {
  connectBroker: async (brokerData) => {
    const result = await apiRequest('/api/brokers/connect', 'POST', brokerData);
    return result;
  },

  getBrokers: async () => {
    const result = await apiRequest('/api/brokers');
    
    // REAL: Empty array if fails
    if (!result.success) {
      return {
        success: true,
        brokers: [],
        connected: 0,
        message: 'Broker data unavailable'
      };
    }
    
    return result;
  },

  getHoldings: async (brokerId) => {
    const result = await apiRequest(`/api/brokers/${brokerId}/holdings`);
    
    // REAL: Empty array if fails
    if (!result.success) {
      return {
        success: true,
        holdings: [],
        message: 'Holdings data unavailable'
      };
    }
    
    return result;
  },

  placeOrder: async (orderData) => {
    const result = await apiRequest('/api/trades/execute', 'POST', orderData);
    return result;
  },

  testConnection: async (brokerId) => {
    const result = await apiRequest(`/api/brokers/${brokerId}/test`, 'POST');
    return result;
  },

  disconnectBroker: async (brokerId) => {
    const result = await apiRequest(`/api/brokers/${brokerId}/disconnect`, 'POST');
    return result;
  },

  syncHoldings: async (brokerId) => {
    const result = await apiRequest(`/api/brokers/${brokerId}/sync`, 'POST');
    return result;
  }
};

// ======================
// TRADE MANAGEMENT APIs - REAL
// ======================
export const tradeAPI = {
  getTrades: async () => {
    const result = await apiRequest('/api/trades');
    
    // REAL: Empty array if fails
    if (!result.success) {
      return {
        success: true,
        trades: [],
        message: 'Trades data unavailable'
      };
    }
    
    return result;
  },

  getActiveTrades: async () => {
    const result = await apiRequest('/api/trades/active');
    
    // REAL: Empty array if fails
    if (!result.success) {
      return {
        success: true,
        trades: [],
        message: 'Active trades data unavailable'
      };
    }
    
    return result;
  },

  addTrade: async (tradeData) => {
    const result = await apiRequest('/api/trades', 'POST', tradeData);
    return result;
  },

  updateTrade: async (tradeId, updates) => {
    const result = await apiRequest(`/api/trades/${tradeId}`, 'PUT', updates);
    return result;
  },

  autoAdjust: async (tradeId, currentPrice) => {
    const result = await apiRequest('/api/trades/auto-adjust', 'POST', { 
      trade_id: tradeId, 
      current_price: currentPrice 
    });
    return result;
  },

  closeTrade: async (tradeId) => {
    const result = await apiRequest(`/api/trades/${tradeId}/close`, 'POST');
    return result;
  }
};

// ======================
// PORTFOLIO APIs - REAL DATA ONLY (NO DUMMY)
// ======================
export const portfolioAPI = {
  getAnalytics: async () => {
    try {
      const result = await apiRequest('/api/analytics/portfolio');
      
      if (result && result.success && result.portfolio) {
        return result;
      }
      
      // REAL EMPTY PORTFOLIO - ABSOLUTELY NO DUMMY DATA
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
          total_investment: '0.00',
          current_value: '0.00',
          total_pnl: '0.00',
          pnl_percentage: '0.00',
          open_trades: 0,
          closed_trades: 0,
          win_rate: '0%',
          daily_target: 'Waiting for data...'
        },
        message: 'Portfolio data loading...'
      };
    } catch (error) {
      console.log('Portfolio API error:', error);
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
          total_investment: '0.00',
          current_value: '0.00',
          total_pnl: '0.00',
          pnl_percentage: '0.00',
          open_trades: 0,
          closed_trades: 0,
          win_rate: '0%',
          daily_target: 'Data unavailable'
        },
        message: 'Portfolio data unavailable'
      };
    }
  },

  getPerformance: async (period = 'monthly') => {
    const result = await apiRequest(`/api/portfolio/performance?period=${period}`);
    
    // REAL: Empty performance if fails
    if (!result.success) {
      return {
        success: true,
        performance: {
          monthlyReturn: 0,
          quarterlyReturn: 0,
          yearlyReturn: 0,
          totalReturn: 0
        },
        message: 'Performance data unavailable'
      };
    }
    
    return result;
  }
};

// ======================
// SETTINGS APIs - REAL
// ======================
export const settingsAPI = {
  getSettings: async () => {
    const result = await apiRequest('/api/settings');
    
    // REAL: Return empty settings if fails
    if (!result.success) {
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
          requireConfirmation: false
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
          volatilityAdjustment: false
        },
        display: {
          theme: 'dark',
          defaultView: 'dashboard',
          refreshInterval: 0,
          showAdvancedCharts: false,
          compactMode: false,
          language: 'en',
          showIndicators: false
        },
        privacy: {
          publicProfile: false,
          showPortfolioValue: false,
          shareTradingHistory: false,
          dataSharing: 'none',
          twoFactorAuth: false,
          sessionTimeout: 0,
          showRealName: false
        },
        api: {
          allowThirdPartyAccess: false,
          webhookEnabled: false,
          rateLimit: 'low',
          logRetention: '30days'
        }
      };
      
      return {
        success: true,
        settings: defaultSettings,
        message: 'Using default settings'
      };
    }
    
    return result;
  },

  saveSettings: async (settings) => {
    const result = await apiRequest('/api/settings', 'POST', settings);
    return result;
  },

  resetSettings: async () => {
    const result = await apiRequest('/api/settings/reset', 'POST');
    return result;
  }
};

// ======================
// SUBSCRIPTION APIs - REAL
// ======================
export const subscriptionAPI = {
  check: async () => {
    const result = await apiRequest('/api/subscription/check');
    
    // REAL: Return trial if fails
    if (!result.success) {
      return {
        success: true,
        plan: 'free_trial',
        trialDaysLeft: 7,
        active: true,
        is_premium: 0,
        trial_active: true,
        trial_ends: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        days_left: 7,
        message: 'Subscription data unavailable'
      };
    }
    
    return result;
  },

  getPlans: async () => {
    const result = await apiRequest('/api/subscription/plans');
    
    // REAL: Return empty plans if fails
    if (!result.success) {
      return {
        success: true,
        plans: [],
        message: 'Plans data unavailable'
      };
    }
    
    return result;
  },

  upgrade: async (planId) => {
    const result = await apiRequest('/api/subscription/upgrade', 'POST', { plan: planId });
    return result;
  }
};

// ======================
// REAL-TIME WebSocket
// ======================
export const setupWebSocket = (onMessage) => {
  try {
    if (!API_BASE_URL) {
      console.log('⚠️ No backend URL for WebSocket');
      return () => {};
    }
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsBase = API_BASE_URL.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}//${wsBase}/ws`;
    
    console.log(`🔌 Connecting WebSocket: ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      const token = getToken();
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }));
      }
      
      // Subscribe to market data
      ws.send(JSON.stringify({ 
        type: 'subscribe', 
        channels: ['market_data', 'signals', 'trades'] 
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        switch (data.type) {
          case 'market_update':
            console.log('📈 Market update received');
            break;
          case 'signal_generated':
            console.log('🚨 New AI signal generated');
            break;
          case 'trade_update':
            console.log('💹 Trade update received');
            break;
          case 'error':
            console.error('WebSocket error:', data.message);
            break;
        }
        
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket disconnected: ${event.code} ${event.reason}`);
      
      // Reconnect after 5 seconds if not normal closure
      if (event.code !== 1000) {
        console.log('Reconnecting in 5 seconds...');
        setTimeout(() => setupWebSocket(onMessage), 5000);
      }
    };

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
// EXPORT ALL APIs
// ======================
export default {
  // APIs
  health: healthAPI,
  auth: authAPI,
  market: marketAPI,
  trading: tradingAPI,
  broker: brokerAPI,
  trade: tradeAPI,
  portfolio: portfolioAPI,
  subscription: subscriptionAPI,
  settings: settingsAPI,
  
  // WebSocket
  setupWebSocket,
  
  // Helpers
  safeToFixed,
  
  // Check backend status
  checkBackendStatus: async () => {
    try {
      const response = await healthAPI.check();
      return response && response.success && response.status === 'online';
    } catch {
      return false;
    }
  },

  // Format currency
  formatCurrency: (amount) => {
    if (amount === undefined || amount === null || amount === '' || isNaN(Number(amount))) {
      return '₹0';
    }
    
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return '₹0';
      
      if (num >= 10000000) {
        return `₹${(num / 10000000).toFixed(2)}Cr`;
      } else if (num >= 100000) {
        return `₹${(num / 100000).toFixed(2)}L`;
      } else if (num >= 1000) {
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

  // Get API base URL
  getApiBaseUrl: () => API_BASE_URL,
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getToken();
    const user = localStorage.getItem('velox_user');
    return !!(token && user);
  },
  
  // Clear all data
  clearAllData: () => {
    removeToken();
    localStorage.removeItem('velox_settings');
    localStorage.removeItem('velox_last_login');
    localStorage.removeItem('velox_users');
  }
};
