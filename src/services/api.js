// API Base URL - CORRECT THIS BASED ON YOUR CLOUDFLARE WORKER
const API_BASE_URL = 'https://veloxtradeai-api.velox-trade-ai.workers.dev';

// Auth token storage - IMPORTANT: Use same key as App.jsx
const getToken = () => localStorage.getItem('velox_auth_token');
const setToken = (token) => localStorage.setItem('velox_auth_token', token);
const removeToken = () => localStorage.removeItem('velox_auth_token');

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
    mode: 'cors', // Important for Cloudflare Workers
    credentials: 'omit', // Cloudflare Workers don't need credentials
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      return null;
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { success: false, message: text };
    }
    
    if (!response.ok) {
      throw new Error(result.message || `API request failed with status ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: null
    };
  }
};

// Mock data for development when backend is not available
const mockData = {
  // Mock login response
  login: {
    success: true,
    token: 'mock-jwt-token-for-development',
    user: {
      id: 1,
      name: 'Demo User',
      email: 'demo@veloxtrade.ai',
      subscription: 'premium'
    }
  },
  
  // Mock stocks data
  stocks: {
    success: true,
    recommendations: [
      { 
        symbol: 'RELIANCE', 
        name: 'Reliance Industries Ltd', 
        currentPrice: 2800.50, 
        changePercent: 2.5, 
        signal: 'strong_buy',
        riskLevel: 'medium',
        timeFrame: 'swing',
        confidence: 85
      },
      { 
        symbol: 'TCS', 
        name: 'Tata Consultancy Services Ltd', 
        currentPrice: 3800.75, 
        changePercent: 1.8, 
        signal: 'buy',
        riskLevel: 'low',
        timeFrame: 'positional',
        confidence: 78
      },
      { 
        symbol: 'HDFCBANK', 
        name: 'HDFC Bank Ltd', 
        currentPrice: 1650.25, 
        changePercent: -0.5, 
        signal: 'neutral',
        riskLevel: 'low',
        timeFrame: 'intraday',
        confidence: 65
      },
      { 
        symbol: 'INFY', 
        name: 'Infosys Ltd', 
        currentPrice: 1550.80, 
        changePercent: 3.2, 
        signal: 'buy',
        riskLevel: 'medium',
        timeFrame: 'swing',
        confidence: 82
      }
    ]
  },
  
  // Mock portfolio data
  portfolio: {
    success: true,
    portfolio: {
      totalValue: 1250000,
      investedValue: 1000000,
      returnsPercent: 25,
      dailyPnL: 15000,
      activeTrades: 3,
      holdingsCount: 8
    }
  }
};

// Check if backend is available
const isBackendAvailable = async () => {
  try {
    const response = await fetch(API_BASE_URL + '/health', { 
      method: 'GET', 
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Use mock data if backend is not available
let useMockData = false;

// Initialize backend check
(async () => {
  try {
    const available = await isBackendAvailable();
    useMockData = !available;
    console.log('Backend available:', available);
    if (!available) {
      console.log('Using mock data for development');
    }
  } catch (error) {
    console.error('Backend check failed:', error);
    useMockData = true;
  }
})();

// ======================
// AUTHENTICATION APIs
// ======================
export const authAPI = {
  register: async (userData) => {
    if (useMockData) {
      // Auto login after registration
      const result = { ...mockData.login };
      setToken(result.token);
      return result;
    }
    const result = await apiRequest('/api/auth/register', 'POST', userData, false);
    if (result && result.success) {
      setToken(result.token);
    }
    return result;
  },
  
  login: async (email, password) => {
    if (useMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = { ...mockData.login };
      setToken(result.token);
      return result;
    }
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
    
    try {
      // For mock data, return mock user
      if (useMockData) {
        return mockData.login.user;
      }
      
      // Call API to get current user
      const result = await apiRequest('/api/auth/me');
      if (result && result.success) {
        return result.user;
      }
      return null;
    } catch {
      return null;
    }
  }
};

// ======================
// MARKET DATA APIs
// ======================
export const marketAPI = {
  getLiveData: async (symbols = 'RELIANCE,TCS,HDFCBANK,INFY,ICICIBANK') => {
    if (useMockData) {
      return mockData.stocks;
    }
    return await apiRequest(`/api/market/live?symbols=${symbols}`);
  },

  getStockData: async (symbol) => {
    if (useMockData) {
      const stock = mockData.stocks.recommendations.find(s => s.symbol === symbol);
      return { success: true, data: stock };
    }
    return await apiRequest(`/api/market/stock?symbol=${symbol}`);
  },
};

// ======================
// AI TRADING APIs
// ======================
export const tradingAPI = {
  // AI Stock Screener
  getAIScreener: async (filters = {}) => {
    if (useMockData) {
      return mockData.stocks;
    }
    return await apiRequest('/api/ai/screener', 'POST', { filters });
  },

  // Get Trading Signals
  getSignals: async () => {
    if (useMockData) {
      return {
        success: true,
        signals: mockData.stocks.recommendations.map(stock => ({
          ...stock,
          action: 'BUY',
          entry: stock.currentPrice * 0.98,
          target: stock.currentPrice * 1.08,
          stoploss: stock.currentPrice * 0.95
        }))
      };
    }
    return await apiRequest('/api/ai/signal');
  },

  // Calculate Levels
  calculateLevels: async (symbol) => {
    if (useMockData) {
      const stock = mockData.stocks.recommendations.find(s => s.symbol === symbol);
      return {
        success: true,
        levels: {
          support: stock.currentPrice * 0.95,
          resistance: stock.currentPrice * 1.05,
          pivot: stock.currentPrice
        }
      };
    }
    return await apiRequest('/api/ai/levels', 'POST', { symbol });
  },

  // Generate Real-time Signal
  generateSignal: async (stockData) => {
    if (useMockData) {
      return {
        success: true,
        signal: {
          ...stockData,
          confidence: 85,
          timestamp: new Date().toISOString()
        }
      };
    }
    return await apiRequest('/api/ai/generate-signal', 'POST', stockData);
  },
};

// ======================
// BROKER APIs
// ======================
export const brokerAPI = {
  // Connect Broker
  connectBroker: async (brokerData) => {
    if (useMockData) {
      return { success: true, message: 'Broker connected successfully' };
    }
    return await apiRequest('/api/broker/connect', 'POST', brokerData);
  },

  // Get Connected Brokers
  getBrokers: async () => {
    if (useMockData) {
      return {
        success: true,
        brokers: [
          { id: 1, name: 'Zerodha', status: 'connected', connectedSince: '2024-01-01' },
          { id: 2, name: 'Upstox', status: 'disconnected' }
        ]
      };
    }
    const token = getToken();
    if (!token) return { success: false, brokers: [] };
    
    // Decode token to get user_id
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/broker/data?user_id=${payload.user_id || payload.id}`);
    } catch {
      return { success: false, brokers: [] };
    }
  },

  // Place Order
  placeOrder: async (orderData) => {
    if (useMockData) {
      return { success: true, orderId: 'MOCK123', message: 'Order placed successfully' };
    }
    return await apiRequest('/api/broker/place-order', 'POST', orderData);
  },

  // Test Connection
  testConnection: async (brokerId) => {
    if (useMockData) {
      return { success: true, connected: true };
    }
    return await apiRequest(`/api/broker/test/${brokerId}`);
  },
};

// ======================
// TRADE MANAGEMENT APIs
// ======================
export const tradeAPI = {
  // Get All Trades
  getTrades: async () => {
    if (useMockData) {
      return {
        success: true,
        trades: [
          { id: 1, symbol: 'RELIANCE', action: 'BUY', quantity: 10, status: 'open', pnl: 3000 },
          { id: 2, symbol: 'TCS', action: 'SELL', quantity: 5, status: 'closed', pnl: -500 }
        ]
      };
    }
    const token = getToken();
    if (!token) return { success: false, trades: [] };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/trades?user_id=${payload.user_id || payload.id}`);
    } catch {
      return { success: false, trades: [] };
    }
  },

  // Add New Trade
  addTrade: async (tradeData) => {
    if (useMockData) {
      return { success: true, tradeId: 'MOCK_TRADE_001' };
    }
    return await apiRequest('/api/trades', 'POST', tradeData);
  },

  // Update Trade
  updateTrade: async (tradeId, updates) => {
    if (useMockData) {
      return { success: true, message: 'Trade updated' };
    }
    return await apiRequest(`/api/trades/${tradeId}`, 'PUT', updates);
  },

  // Auto Adjust SL/TGT
  autoAdjust: async (tradeId, currentPrice) => {
    if (useMockData) {
      return { success: true, newStoploss: currentPrice * 0.95, newTarget: currentPrice * 1.08 };
    }
    return await apiRequest('/api/trades/auto-adjust', 'POST', { trade_id: tradeId, current_price: currentPrice });
  },

  // Close Trade
  closeTrade: async (tradeId) => {
    if (useMockData) {
      return { success: true, message: 'Trade closed' };
    }
    return await apiRequest(`/api/trades/${tradeId}/close`, 'POST');
  },
};

// ======================
// PORTFOLIO APIs
// ======================
export const portfolioAPI = {
  getAnalytics: async () => {
    if (useMockData) {
      return mockData.portfolio;
    }
    const token = getToken();
    if (!token) return { success: false, portfolio: null };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/analytics/portfolio?user_id=${payload.user_id || payload.id}`);
    } catch {
      return { success: false, portfolio: null };
    }
  },

  getPerformance: async (period = 'monthly') => {
    if (useMockData) {
      return {
        success: true,
        performance: {
          monthlyReturn: 5.2,
          yearlyReturn: 25.8,
          sharpeRatio: 1.8
        }
      };
    }
    const token = getToken();
    if (!token) return { success: false, performance: null };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/analytics/performance?user_id=${payload.user_id || payload.id}&period=${period}`);
    } catch {
      return { success: false, performance: null };
    }
  },

  getRiskMetrics: async () => {
    if (useMockData) {
      return {
        success: true,
        riskMetrics: {
          volatility: 18.4,
          maxDrawdown: -8.5,
          var: 3.2
        }
      };
    }
    const token = getToken();
    if (!token) return { success: false, riskMetrics: null };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/analytics/risk-metrics?user_id=${payload.user_id || payload.id}`);
    } catch {
      return { success: false, riskMetrics: null };
    }
  },
};

// ======================
// REAL-TIME WebSocket
// ======================
export const setupWebSocket = (onMessage) => {
  // If using mock data, simulate WebSocket with interval
  if (useMockData) {
    const interval = setInterval(() => {
      // Simulate price updates
      const update = {
        type: 'price_update',
        symbol: mockData.stocks.recommendations[
          Math.floor(Math.random() * mockData.stocks.recommendations.length)
        ].symbol,
        price: Math.random() * 1000 + 2000,
        changePercent: (Math.random() - 0.5) * 5,
        timestamp: new Date().toISOString()
      };
      onMessage(update);
    }, 5000);

    // Return cleanup function
    return () => clearInterval(interval);
  }

  // Real WebSocket implementation
  try {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//veloxtradeai-api.velox-trade-ai.workers.dev/ws`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
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
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
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
  setupWebSocket,
  isBackendAvailable: () => !useMockData,
};
