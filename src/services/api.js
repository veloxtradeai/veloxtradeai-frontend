// src/services/api.js - COMPLETE FINAL VERSION

const API_BASE_URL = 'https://veloxtradeai-api.velox-trade-ai.workers.dev';
const WS_BASE_URL = 'wss://veloxtradeai-api.velox-trade-ai.workers.dev/ws';

// Helper function for API calls
const makeRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id') || 'demo_user';
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'X-User-ID': userId
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed ${endpoint}:`, error);
    throw error;
  }
};

// Health API
export const healthAPI = {
  check: async () => {
    return await makeRequest('/api/health');
  }
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    return await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  login: async (email, password) => {
    return await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  getCurrentUser: async () => {
    return await makeRequest('/api/auth/me');
  }
};

// Market API
export const marketAPI = {
  getRealtimeData: async (symbol) => {
    return await makeRequest(`/api/market/realtime?symbol=${symbol}`);
  },
  
  getSignal: async (symbol) => {
    return await makeRequest(`/api/market/signal?symbol=${symbol}`);
  },
  
  getTopGainers: async () => {
    return await makeRequest('/api/market/top-gainers');
  },
  
  getTopLosers: async () => {
    return await makeRequest('/api/market/top-losers');
  }
};

// AI Signals API
export const aiAPI = {
  getSignals: async () => {
    return await makeRequest('/api/ai/signals');
  }
};

// Broker API
export const brokerAPI = {
  getBrokers: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/brokers?user_id=${userId}`);
  },
  
  connectBroker: async (brokerData) => {
    return await makeRequest('/api/brokers/connect', {
      method: 'POST',
      body: JSON.stringify(brokerData)
    });
  },
  
  syncBroker: async (brokerId) => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest('/api/brokers/sync', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, broker_id: brokerId })
    });
  },
  
  disconnectBroker: async (brokerId) => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest('/api/brokers/disconnect', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, broker_id: brokerId })
    });
  }
};

// Holdings API
export const holdingsAPI = {
  getHoldings: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/holdings?user_id=${userId}`);
  }
};

// Trades API
export const tradesAPI = {
  getActiveTrades: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/trades/active?user_id=${userId}`);
  },
  
  getTradeHistory: async (limit = 20) => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/trades/history?user_id=${userId}&limit=${limit}`);
  },
  
  executeTrade: async (tradeData) => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest('/api/trades/execute', {
      method: 'POST',
      body: JSON.stringify({ ...tradeData, user_id: userId })
    });
  },
  
  closeTrade: async (tradeId, exitPrice) => {
    return await makeRequest('/api/trades/close', {
      method: 'POST',
      body: JSON.stringify({ trade_id: tradeId, exit_price: exitPrice })
    });
  }
};

// Analytics API
export const analyticsAPI = {
  getPortfolio: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/analytics/portfolio?user_id=${userId}`);
  }
};

// Subscription API
export const subscriptionAPI = {
  checkSubscription: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/subscription/check?user_id=${userId}`);
  }
};

// WebSocket Setup
export const setupWebSocket = (onMessage) => {
  if (!WebSocket) {
    console.warn('WebSocket not supported');
    return () => {};
  }
  
  try {
    const ws = new WebSocket(WS_BASE_URL);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({
        type: 'subscribe',
        userId: localStorage.getItem('user_id') || 'demo_user'
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  } catch (error) {
    console.error('WebSocket setup failed:', error);
    return () => {};
  }
};

export default {
  healthAPI,
  authAPI,
  marketAPI,
  aiAPI,
  brokerAPI,
  holdingsAPI,
  tradesAPI,
  analyticsAPI,
  subscriptionAPI,
  setupWebSocket
};
