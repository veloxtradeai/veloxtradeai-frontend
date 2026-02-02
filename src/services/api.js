// src/services/api.js - COMPLETE FINAL VERSION WITH ALL EXPORTS

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
    console.log(`API Call: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`API Response from ${endpoint}:`, data);
    return data;
    
  } catch (error) {
    console.error(`API call failed ${endpoint}:`, error);
    throw error;
  }
};

// ======================
// ALL API EXPORTS
// ======================

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
  },
  
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    return { success: true };
  }
};

// Market API
export const marketAPI = {
  getRealtimeData: async (symbol = 'RELIANCE') => {
    return await makeRequest(`/api/market/realtime?symbol=${symbol}`);
  },
  
  getSignal: async (symbol = 'RELIANCE') => {
    return await makeRequest(`/api/market/signal?symbol=${symbol}`);
  },
  
  getTopGainers: async () => {
    return await makeRequest('/api/market/top-gainers');
  },
  
  getTopLosers: async () => {
    return await makeRequest('/api/market/top-losers');
  }
};

// Trading API (for backward compatibility with useStocks.jsx)
export const tradingAPI = {
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
  },
  
  // Alias for portfolioAPI (for useStocks.jsx)
  getPortfolio: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/analytics/portfolio?user_id=${userId}`);
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
  },
  
  placeOrder: async (orderData) => {
    // This will be implemented when broker integration is complete
    console.log('Placing order:', orderData);
    return {
      success: true,
      orderId: `ORD_${Date.now()}`,
      message: 'Order placed successfully (Simulated)'
    };
  }
};

// Holdings API
export const holdingsAPI = {
  getHoldings: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/holdings?user_id=${userId}`);
  }
};

// Trades API (same as tradingAPI but with different name)
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

// Portfolio Analytics API
export const portfolioAPI = {
  getPortfolio: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/analytics/portfolio?user_id=${userId}`);
  },
  
  getAnalytics: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/analytics/portfolio?user_id=${userId}`);
  }
};

// Analytics API (for Dashboard.jsx)
export const analyticsAPI = {
  getPortfolio: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/analytics/portfolio?user_id=${userId}`);
  },
  
  getAnalytics: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/analytics/portfolio?user_id=${userId}`);
  }
};

// Settings API (for Settings.jsx)
export const settingsAPI = {
  updateProfile: async (profileData) => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest('/api/settings/profile', {
      method: 'PUT',
      body: JSON.stringify({ ...profileData, user_id: userId })
    });
  },
  
  updatePreferences: async (preferences) => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest('/api/settings/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences, user_id: userId })
    });
  },
  
  getSettings: async () => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest(`/api/settings?user_id=${userId}`);
  },
  
  updatePassword: async (currentPassword, newPassword) => {
    const userId = localStorage.getItem('user_id') || 'demo_user';
    return await makeRequest('/api/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ 
        current_password: currentPassword, 
        new_password: newPassword,
        user_id: userId 
      })
    });
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
  if (typeof WebSocket === 'undefined') {
    console.warn('WebSocket not supported in this environment');
    return () => {
      console.log('WebSocket cleanup (no WebSocket support)');
    };
  }
  
  try {
    console.log('Setting up WebSocket connection...');
    
    // For now, simulate WebSocket with interval (actual WebSocket will be implemented later)
    const intervalId = setInterval(() => {
      // Simulate market updates every 10 seconds
      const simulatedData = {
        type: 'market_update',
        timestamp: new Date().toISOString(),
        message: 'Market data updated'
      };
      
      if (onMessage && typeof onMessage === 'function') {
        onMessage(simulatedData);
      }
    }, 10000);
    
    console.log('WebSocket simulation started');
    
    return () => {
      console.log('Cleaning up WebSocket simulation');
      clearInterval(intervalId);
    };
    
  } catch (error) {
    console.error('WebSocket setup failed:', error);
    return () => {
      console.log('WebSocket cleanup after error');
    };
  }
};

// ======================
// DEFAULT EXPORT
// ======================
export default {
  healthAPI,
  authAPI,
  marketAPI,
  tradingAPI,
  aiAPI,
  brokerAPI,
  holdingsAPI,
  tradesAPI,
  portfolioAPI,
  analyticsAPI,
  settingsAPI,
  subscriptionAPI,
  setupWebSocket
};
