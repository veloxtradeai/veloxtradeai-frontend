// API Base URL
const API_BASE_URL = 'https://veloxtradeai-api.velox-trade-ai.workers.dev';

// Auth token storage
const getToken = () => localStorage.getItem('veloxtradeai_token');
const setToken = (token) => localStorage.setItem('veloxtradeai_token', token);
const removeToken = () => localStorage.removeItem('veloxtradeai_token');

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
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      return;
    }

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ======================
// AUTHENTICATION APIs
// ======================
export const authAPI = {
  register: (userData) => apiRequest('/api/auth/register', 'POST', userData, false),
  
  login: (email, password) => 
    apiRequest('/api/auth/login', 'POST', { email, password }, false),
  
  logout: () => {
    removeToken();
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const token = getToken();
    if (!token) return null;
    
    try {
      // Decode JWT token (if using JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }
};

// ======================
// MARKET DATA APIs
// ======================
export const marketAPI = {
  getLiveData: (symbols = 'RELIANCE,TCS,HDFCBANK,INFY,ICICIBANK') =>
    apiRequest(`/api/market/live?symbols=${symbols}`),

  getStockData: (symbol) =>
    apiRequest(`/api/market/stock?symbol=${symbol}`),
};

// ======================
// AI TRADING APIs
// ======================
export const tradingAPI = {
  // AI Stock Screener
  getAIScreener: (filters = {}) =>
    apiRequest('/api/ai/screener', 'POST', { filters }),

  // Get Trading Signals
  getSignals: () =>
    apiRequest('/api/ai/signal'),

  // Calculate Levels
  calculateLevels: (symbol) =>
    apiRequest('/api/ai/levels', 'POST', { symbol }),

  // Generate Real-time Signal
  generateSignal: (stockData) =>
    apiRequest('/api/ai/generate-signal', 'POST', stockData),
};

// ======================
// BROKER APIs
// ======================
export const brokerAPI = {
  // Connect Broker
  connectBroker: (brokerData) =>
    apiRequest('/api/broker/connect', 'POST', brokerData),

  // Get Connected Brokers
  getBrokers: (userId) =>
    apiRequest(`/api/broker/data?user_id=${userId}`),

  // Place Order
  placeOrder: (orderData) =>
    apiRequest('/api/broker/place-order', 'POST', orderData),

  // Test Connection
  testConnection: (brokerId) =>
    apiRequest(`/api/broker/test/${brokerId}`),
};

// ======================
// TRADE MANAGEMENT APIs
// ======================
export const tradeAPI = {
  // Get All Trades
  getTrades: (userId) =>
    apiRequest(`/api/trades?user_id=${userId}`),

  // Add New Trade
  addTrade: (tradeData) =>
    apiRequest('/api/trades', 'POST', tradeData),

  // Update Trade
  updateTrade: (tradeId, updates) =>
    apiRequest(`/api/trades/${tradeId}`, 'PUT', updates),

  // Auto Adjust SL/TGT
  autoAdjust: (tradeId, currentPrice) =>
    apiRequest('/api/trades/auto-adjust', 'POST', { trade_id: tradeId, current_price: currentPrice }),

  // Close Trade
  closeTrade: (tradeId) =>
    apiRequest(`/api/trades/${tradeId}/close`, 'POST'),
};

// ======================
// PORTFOLIO APIs
// ======================
export const portfolioAPI = {
  getAnalytics: (userId) =>
    apiRequest(`/api/analytics/portfolio?user_id=${userId}`),

  getPerformance: (userId, period = 'monthly') =>
    apiRequest(`/api/analytics/performance?user_id=${userId}&period=${period}`),

  getRiskMetrics: (userId) =>
    apiRequest(`/api/analytics/risk-metrics?user_id=${userId}`),
};

// ======================
// REAL-TIME WebSocket
// ======================
export const setupWebSocket = (onMessage) => {
  // WebSocket for real-time updates
  const ws = new WebSocket(`wss://veloxtradeai-api.velox-trade-ai.workers.dev/ws`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    // Send authentication token
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
    // Try to reconnect after 5 seconds
    setTimeout(() => setupWebSocket(onMessage), 5000);
  };

  return ws;
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
};
