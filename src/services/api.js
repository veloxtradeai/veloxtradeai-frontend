// ============================================
// VELOXTRADEAI - REAL API SERVICE
// NO MOCK DATA - REAL BACKEND CONNECTION ONLY
// ============================================

// ✅ असली बैकेंड URL (environment variable से)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🔴 मोक डेटा बिल्कुल बंद - कोई चेक नहीं
const FORCE_REAL_DATA_ONLY = true;

// 🔐 ऑथ टोकन सिस्टम
const getToken = () => localStorage.getItem('velox_auth_token');
const setToken = (token) => {
  localStorage.setItem('velox_auth_token', token);
  console.log('टोकन सेव हुआ');
};
const removeToken = () => {
  localStorage.removeItem('velox_auth_token');
  console.log('टोकन हटा दिया गया');
};

// 📡 API रिक्वेस्ट हेल्पर (रियल डेटा के लिए)
const apiRequest = async (endpoint, method = 'GET', data = null, useAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // ऑथ टोकन अटैच करो
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
    console.log(`📡 API कॉल: ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // 401 अनऑथोराइज्ड - लॉगिन पेज भेजो
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      return {
        success: false,
        message: 'सेशन खत्म हुआ है। कृपया दोबारा लॉगिन करें।',
        data: null
      };
    }

    // रिस्पॉन्स चेक करो
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { success: false, message: text };
    }
    
    // एरर हैंडलिंग
    if (!response.ok) {
      throw new Error(result.message || `API में समस्या (status: ${response.status})`);
    }

    return result;
  } catch (error) {
    console.error('❌ API एरर:', error);
    return {
      success: false,
      message: 'बैकेंड कनेक्शन फेल हुआ। कृपया बाद में कोशिश करें।',
      data: null,
      error: error.message
    };
  }
};

// ======================
// ऑथेंटिकेशन APIs
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
    if (!token) {
      return null;
    }
    
    const result = await apiRequest('/api/auth/me');
    if (result && result.success) {
      return result.user;
    }
    return null;
  }
};

// ======================
// मार्केट डेटा APIs
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
// AI ट्रेडिंग APIs
// ======================
export const tradingAPI = {
  // AI स्टॉक स्क्रीनर
  getAIScreener: async (filters = {}) => {
    return await apiRequest('/api/ai/screener', 'POST', { filters });
  },

  // ट्रेडिंग सिग्नल लाओ
  getSignals: async () => {
    return await apiRequest('/api/ai/signal');
  },

  // लेवल कैलकुलेट करो
  calculateLevels: async (symbol) => {
    return await apiRequest('/api/ai/levels', 'POST', { symbol });
  },

  // रियल-टाइम सिग्नल जनरेट करो
  generateSignal: async (stockData) => {
    return await apiRequest('/api/ai/generate-signal', 'POST', stockData);
  },
};

// ======================
// ब्रोकर APIs
// ======================
export const brokerAPI = {
  // ब्रोकर कनेक्ट करो
  connectBroker: async (brokerData) => {
    return await apiRequest('/api/broker/connect', 'POST', brokerData);
  },

  // कनेक्टेड ब्रोकर लाओ
  getBrokers: async () => {
    const token = getToken();
    if (!token) return { success: false, brokers: [] };
    
    try {
      // टोकन से user_id निकालो
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/broker/data?user_id=${payload.user_id || payload.id}`);
    } catch {
      return { success: false, brokers: [] };
    }
  },

  // ऑर्डर प्लेस करो
  placeOrder: async (orderData) => {
    return await apiRequest('/api/broker/place-order', 'POST', orderData);
  },

  // कनेक्शन टेस्ट करो
  testConnection: async (brokerId) => {
    return await apiRequest(`/api/broker/test/${brokerId}`);
  },
};

// ======================
// ट्रेड मैनेजमेंट APIs
// ======================
export const tradeAPI = {
  // सारे ट्रेड लाओ
  getTrades: async () => {
    const token = getToken();
    if (!token) return { success: false, trades: [] };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return await apiRequest(`/api/trades?user_id=${payload.user_id || payload.id}`);
    } catch {
      return { success: false, trades: [] };
    }
  },

  // नया ट्रेड जोड़ो
  addTrade: async (tradeData) => {
    return await apiRequest('/api/trades', 'POST', tradeData);
  },

  // ट्रेड अपडेट करो
  updateTrade: async (tradeId, updates) => {
    return await apiRequest(`/api/trades/${tradeId}`, 'PUT', updates);
  },

  // ऑटो SL/TGT एडजस्ट करो
  autoAdjust: async (tradeId, currentPrice) => {
    return await apiRequest('/api/trades/auto-adjust', 'POST', { 
      trade_id: tradeId, 
      current_price: currentPrice 
    });
  },

  // ट्रेड क्लोज करो
  closeTrade: async (tradeId) => {
    return await apiRequest(`/api/trades/${tradeId}/close`, 'POST');
  },
};

// ======================
// पोर्टफोलियो APIs
// ======================
export const portfolioAPI = {
  getAnalytics: async () => {
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
// रियल-टाइम वेबसॉकेट
// ======================
export const setupWebSocket = (onMessage) => {
  try {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//veloxtradeai-api.velox-trade-ai.workers.dev/ws`);
    
    ws.onopen = () => {
      console.log('✅ वेबसॉकेट कनेक्टेड');
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
        console.error('वेबसॉकेट मैसेज एरर:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ वेबसॉकेट एरर:', error);
    };

    ws.onclose = () => {
      console.log('🔌 वेबसॉकेट डिस्कनेक्टेड - 5 सेकंड में रीकनेक्ट');
      setTimeout(() => setupWebSocket(onMessage), 5000);
    };

    return () => ws.close();
  } catch (error) {
    console.error('वेबसॉकेट सेटअप फेल:', error);
    return () => {};
  }
};

// ======================
// सारे APIs एक्सपोर्ट
// ======================
export default {
  auth: authAPI,
  market: marketAPI,
  trading: tradingAPI,
  broker: brokerAPI,
  trade: tradeAPI,
  portfolio: portfolioAPI,
  setupWebSocket,
  // यह फंक्शन बताएगा कि बैकेंड कनेक्टेड है या नहीं
  checkBackendStatus: async () => {
    try {
      const response = await fetch(API_BASE_URL + '/health');
      return response.ok;
    } catch {
      return false;
    }
  }
};
